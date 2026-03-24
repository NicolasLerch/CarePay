import { randomUUID } from "node:crypto";

import { AppError } from "../../app/errors/app-error.js";
import { normalizeDecimalString } from "../../shared/utils/decimal.js";
import { AlertsRepository } from "../alerts/alerts.repository.js";
import { EntriesRepository } from "../entries/entries.repository.js";
import { HospitalBillingRulesRepository } from "../hospital-billing-rules/hospital-billing-rules.repository.js";
import { HospitalsService } from "../hospitals/hospitals.service.js";

import { InvoiceDateCalculator } from "./invoice-date-calculator.js";
import {
  assertSupportedInvoiceStatus,
  normalizeInvoiceStatus,
} from "./invoice-status.js";
import type {
  CreateInvoiceInput,
  ListInvoicesQuery,
  SuggestInvoiceInput,
  UpdateInvoiceStatusInput,
} from "./invoices.schemas.js";
import { InvoicesRepository } from "./invoices.repository.js";

export class InvoicesService {
  public constructor(
    private readonly invoicesRepository = new InvoicesRepository(),
    private readonly alertsRepository = new AlertsRepository(),
    private readonly entriesRepository = new EntriesRepository(),
    private readonly hospitalsService = new HospitalsService(),
    private readonly hospitalBillingRulesRepository = new HospitalBillingRulesRepository(),
    private readonly invoiceDateCalculator = new InvoiceDateCalculator(),
  ) {}

  public async list(query: ListInvoicesQuery) {
    await this.expirePendingInvoices(query.hospitalId);
    return this.invoicesRepository.findAll({
      ...query,
      status: query.status ? normalizeInvoiceStatus(query.status) : undefined,
    });
  }

  public async getById(invoiceId: string) {
    await this.expirePendingInvoices();
    const invoice = await this.invoicesRepository.findById(invoiceId);

    if (!invoice) {
      throw new AppError("Invoice not found.", 404);
    }

    return invoice;
  }

  public async updateStatus(
    invoiceId: string,
    input: UpdateInvoiceStatusInput,
  ) {
    await this.expirePendingInvoices();
    const invoice = await this.getById(invoiceId);
    const nextStatus = normalizeInvoiceStatus(input.status);

    assertSupportedInvoiceStatus(nextStatus);

    if (nextStatus === "expired") {
      throw new AppError(
        "Invoices are marked as expired automatically by the backend.",
        400,
      );
    }

    if (nextStatus === "pending" && invoice.status === "expired") {
      throw new AppError(
        "An expired invoice cannot be moved back to pending manually.",
        409,
      );
    }

    const nextPresentedAt =
      nextStatus === "presented"
        ? input.presentedAt ?? invoice.presentedAt ?? new Date().toISOString()
        : nextStatus === "dismissed"
          ? null
          : invoice.presentedAt;

    const nextNotes =
      invoice.status === "expired" && nextStatus === "presented"
        ? input.notes ?? invoice.notes ?? "Presentada fuera de termino."
        : input.notes ?? invoice.notes;

    const updatedInvoice = await this.invoicesRepository.updateStatus(invoiceId, {
      status: nextStatus,
      presentedAt: nextPresentedAt,
      notes: nextNotes,
    });

    if (!updatedInvoice) {
      throw new AppError("Invoice not found.", 404);
    }

    if (nextStatus === "presented" || nextStatus === "dismissed") {
      await this.alertsRepository.dismissByInvoiceId(invoiceId);
    }

    return updatedInvoice;
  }

  public async suggest(input: SuggestInvoiceInput) {
    await this.hospitalsService.getById(input.hospitalId);
    this.ensurePeriod(input.invoicePeriodStart, input.invoicePeriodEnd);

    const billingRule =
      await this.hospitalBillingRulesRepository.findApplicableByDate(
        input.hospitalId,
        input.invoicePeriodEnd,
      );

    if (!billingRule) {
      throw new AppError("No billing rule found for the invoice period.", 409);
    }

    const periodEntries =
      await this.entriesRepository.findUnbilledByHospitalAndPeriod({
        hospitalId: input.hospitalId,
        periodStart: input.invoicePeriodStart,
        periodEnd: input.invoicePeriodEnd,
      });

    const subtotalAmount = periodEntries.reduce(
      (acc, entry) => acc + Number(entry.finalAmount),
      0,
    );

    const dates = this.invoiceDateCalculator.calculate({
      invoicePeriodStart: input.invoicePeriodStart,
      invoicePeriodEnd: input.invoicePeriodEnd,
      billingRule,
    });

    return {
      hospitalId: input.hospitalId,
      invoicePeriodStart: input.invoicePeriodStart,
      invoicePeriodEnd: input.invoicePeriodEnd,
      entryIds: periodEntries.map((entry) => entry.id),
      entries: periodEntries,
      subtotalAmount: normalizeDecimalString(String(subtotalAmount)),
      adjustmentsAmount: "0",
      totalAmount: normalizeDecimalString(String(subtotalAmount)),
      estimatedPaymentDate: dates.estimatedPaymentDate,
      deadlineDate: dates.deadlineDate,
      billingRuleSnapshot: billingRule,
      rateSnapshot: this.buildRateSnapshot(periodEntries),
    };
  }

  public async create(input: CreateInvoiceInput) {
    await this.hospitalsService.getById(input.hospitalId);
    this.ensurePeriod(input.invoicePeriodStart, input.invoicePeriodEnd);

    const billingRule =
      await this.hospitalBillingRulesRepository.findApplicableByDate(
        input.hospitalId,
        input.invoicePeriodEnd,
      );

    if (!billingRule) {
      throw new AppError("No billing rule found for the invoice period.", 409);
    }

    const suggested = await this.suggest({
      hospitalId: input.hospitalId,
      invoicePeriodStart: input.invoicePeriodStart,
      invoicePeriodEnd: input.invoicePeriodEnd,
    });

    const selectedEntries = suggested.entries.filter((entry) =>
      input.entryIds.includes(entry.id),
    );

    if (selectedEntries.length !== input.entryIds.length) {
      throw new AppError(
        "Some selected entries are not available as unbilled entries for the requested period.",
        409,
      );
    }

    const subtotalAmount = selectedEntries.reduce(
      (acc, entry) => acc + Number(entry.finalAmount),
      0,
    );
    const adjustmentsAmount = normalizeDecimalString(
      input.adjustmentsAmount ?? "0",
    );
    const totalAmount = normalizeDecimalString(
      String(subtotalAmount + Number(adjustmentsAmount)),
    );

    const dates = this.invoiceDateCalculator.calculate({
      invoicePeriodStart: input.invoicePeriodStart,
      invoicePeriodEnd: input.invoicePeriodEnd,
      billingRule,
    });

    const invoice = await this.invoicesRepository.create({
      id: randomUUID(),
      hospitalId: input.hospitalId,
      appliedBillingRuleId: billingRule.id,
      status: "pending",
      invoicePeriodStart: input.invoicePeriodStart,
      invoicePeriodEnd: input.invoicePeriodEnd,
      subtotalAmount: normalizeDecimalString(String(subtotalAmount)),
      adjustmentsAmount,
      totalAmount,
      currencyCode: this.resolveCurrencyCode(selectedEntries),
      estimatedPaymentDate:
        input.estimatedPaymentDate ?? dates.estimatedPaymentDate,
      estimatedPaymentDateOverridden: input.estimatedPaymentDate !== undefined,
      deadlineDate: dates.deadlineDate,
      presentedAt: null,
      notes: input.notes ?? null,
      rateSnapshotJson: this.buildRateSnapshot(selectedEntries),
      billingRuleSnapshotJson: billingRule,
    });

    await this.entriesRepository.assignInvoice(
      selectedEntries.map((entry) => entry.id),
      invoice.id,
    );

    return invoice;
  }

  public async expirePendingInvoices(hospitalId?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const expiredInvoices = await this.invoicesRepository.findPendingExpiredByDate(
      today,
      hospitalId,
    );

    if (expiredInvoices.length === 0) {
      return;
    }

    await this.invoicesRepository.markExpiredByIds(
      expiredInvoices.map((invoice) => invoice.id),
    );
  }

  private ensurePeriod(periodStart: string, periodEnd: string) {
    if (periodEnd < periodStart) {
      throw new AppError(
        "invoicePeriodEnd must be on or after invoicePeriodStart.",
        400,
      );
    }
  }

  private buildRateSnapshot(
    entries: Awaited<ReturnType<EntriesRepository["findUnbilledByHospitalAndPeriod"]>>,
  ) {
    const uniqueRates = new Map<string, { appliedRateId: string | null; calculatedAmount: string | null; finalAmount: string }>();

    for (const entry of entries) {
      uniqueRates.set(entry.id, {
        appliedRateId: entry.appliedRateId,
        calculatedAmount: entry.calculatedAmount,
        finalAmount: entry.finalAmount,
      });
    }

    return Array.from(uniqueRates.values());
  }

  private resolveCurrencyCode(
    _entries: Awaited<ReturnType<EntriesRepository["findUnbilledByHospitalAndPeriod"]>>,
  ) {
    return "ARS";
  }
}
