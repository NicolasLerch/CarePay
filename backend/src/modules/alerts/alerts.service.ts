import { randomUUID } from "node:crypto";

import { AppError } from "../../app/errors/app-error.js";
import { addToIsoDate } from "../../shared/utils/date.js";
import { HospitalAlertRulesRepository } from "../hospital-alert-rules/hospital-alert-rules.repository.js";
import { HospitalsService } from "../hospitals/hospitals.service.js";
import { InvoicesRepository } from "../invoices/invoices.repository.js";
import { InvoicesService } from "../invoices/invoices.service.js";
import { PaymentsRepository } from "../payments/payments.repository.js";

import type {
  GenerateAlertsInput,
  ListAlertsQuery,
  UpdateAlertStatusInput,
} from "./alerts.schemas.js";
import { AlertsRepository } from "./alerts.repository.js";

export class AlertsService {
  public constructor(
    private readonly alertsRepository = new AlertsRepository(),
    private readonly hospitalsService = new HospitalsService(),
    private readonly hospitalAlertRulesRepository = new HospitalAlertRulesRepository(),
    private readonly invoicesRepository = new InvoicesRepository(),
    private readonly invoicesService = new InvoicesService(),
    private readonly paymentsRepository = new PaymentsRepository(),
  ) {}

  public async list(query: ListAlertsQuery) {
    return this.alertsRepository.findAll(query);
  }

  public async getById(alertId: string) {
    const alert = await this.alertsRepository.findById(alertId);

    if (!alert) {
      throw new AppError("Alert not found.", 404);
    }

    return alert;
  }

  public async updateStatus(alertId: string, input: UpdateAlertStatusInput) {
    await this.getById(alertId);

    const alert = await this.alertsRepository.updateStatus(alertId, input.status);

    if (!alert) {
      throw new AppError("Alert not found.", 404);
    }

    return alert;
  }

  public async generate(input: GenerateAlertsInput) {
    const hospital = await this.hospitalsService.getById(input.hospitalId);
    await this.invoicesService.expirePendingInvoices(input.hospitalId);

    const invoices = await this.invoicesRepository.findAll({
      hospitalId: input.hospitalId,
    });
    const payments = await this.paymentsRepository.findAll({
      hospitalId: input.hospitalId,
    });

    const createdAlerts = [];

    for (const invoice of invoices) {
      const applicableRules =
        await this.hospitalAlertRulesRepository.findApplicableByDate(
          input.hospitalId,
          invoice.invoicePeriodEnd,
        );

      for (const rule of applicableRules) {
        const generated = await this.generateForInvoice(
          invoice,
          payments,
          rule,
          hospital.name,
        );

        if (generated) {
          createdAlerts.push(generated);
        }
      }
    }

    return createdAlerts;
  }

  private async generateForInvoice(
    invoice: Awaited<ReturnType<InvoicesRepository["findAll"]>>[number],
    payments: Awaited<ReturnType<PaymentsRepository["findAll"]>>,
    rule: Awaited<
      ReturnType<HospitalAlertRulesRepository["findApplicableByDate"]>
    >[number],
    hospitalName: string,
  ) {
    const payment = payments.find((item) => item.invoiceId === invoice.id);

    if (rule.alertType === "invoice_pending") {
      if (invoice.status !== "pending") {
        return null;
      }

      return this.createAlertIfMissing({
        hospitalId: invoice.hospitalId,
        invoiceId: invoice.id,
        paymentId: null,
        hospitalAlertRuleId: rule.id,
        alertType: rule.alertType,
        scheduledFor: this.calculateScheduledDate(
          invoice.deadlineDate,
          rule.triggerOffsetUnit,
          rule.triggerOffsetValue,
          rule.triggerOffsetDirection,
        ),
        message: this.buildInvoiceAlertMessage({
          prefix: "Factura pendiente",
          hospitalName,
          amount: invoice.totalAmount,
          invoicePeriodStart: invoice.invoicePeriodStart,
          invoicePeriodEnd: invoice.invoicePeriodEnd,
          trailing: `Vence el ${invoice.deadlineDate}.`,
        }),
      });
    }

    if (rule.alertType === "invoice_expired") {
      if (invoice.status !== "expired") {
        return null;
      }

      return this.createAlertIfMissing({
        hospitalId: invoice.hospitalId,
        invoiceId: invoice.id,
        paymentId: null,
        hospitalAlertRuleId: rule.id,
        alertType: rule.alertType,
        scheduledFor: this.calculateScheduledDate(
          invoice.deadlineDate,
          rule.triggerOffsetUnit,
          rule.triggerOffsetValue,
          rule.triggerOffsetDirection,
        ),
        message: this.buildInvoiceAlertMessage({
          prefix: "Factura vencida",
          hospitalName,
          amount: invoice.totalAmount,
          invoicePeriodStart: invoice.invoicePeriodStart,
          invoicePeriodEnd: invoice.invoicePeriodEnd,
          trailing: `Cobro estimado ${invoice.estimatedPaymentDate}.`,
        }),
      });
    }

    if (rule.alertType === "payment_pending") {
      if (invoice.status === "presented" || invoice.status === "dismissed") {
        return null;
      }

      if (!payment || payment.status !== "pending") {
        return null;
      }

      return this.createAlertIfMissing({
        hospitalId: invoice.hospitalId,
        invoiceId: invoice.id,
        paymentId: payment.id,
        hospitalAlertRuleId: rule.id,
        alertType: rule.alertType,
        scheduledFor: this.calculateScheduledDate(
          invoice.estimatedPaymentDate,
          rule.triggerOffsetUnit,
          rule.triggerOffsetValue,
          rule.triggerOffsetDirection,
        ),
        message: this.buildInvoiceAlertMessage({
          prefix: "Recordatorio de pago",
          hospitalName,
          amount: invoice.totalAmount,
          invoicePeriodStart: invoice.invoicePeriodStart,
          invoicePeriodEnd: invoice.invoicePeriodEnd,
          trailing: `Fecha estimada de pago ${invoice.estimatedPaymentDate}.`,
        }),
      });
    }

    if (rule.alertType === "payment_due_today") {
      if (invoice.status === "presented" || invoice.status === "dismissed") {
        return null;
      }

      if (!payment || payment.status !== "pending") {
        return null;
      }

      return this.createAlertIfMissing({
        hospitalId: invoice.hospitalId,
        invoiceId: invoice.id,
        paymentId: payment.id,
        hospitalAlertRuleId: rule.id,
        alertType: rule.alertType,
        scheduledFor: this.calculateScheduledDate(
          invoice.estimatedPaymentDate,
          rule.triggerOffsetUnit,
          rule.triggerOffsetValue,
          rule.triggerOffsetDirection,
        ),
        message: this.buildInvoiceAlertMessage({
          prefix: "Pago esperado",
          hospitalName,
          amount: invoice.totalAmount,
          invoicePeriodStart: invoice.invoicePeriodStart,
          invoicePeriodEnd: invoice.invoicePeriodEnd,
          trailing: `Fecha estimada de pago ${invoice.estimatedPaymentDate}.`,
        }),
      });
    }

    return null;
  }

  private calculateScheduledDate(
    baseDate: string,
    unit: string,
    value: number,
    direction: string,
  ) {
    if (direction === "same_day") {
      return `${baseDate}T09:00:00.000Z`;
    }

    const multiplier = direction === "before" ? -1 : 1;
    const scheduledDate = addToIsoDate(baseDate, unit, value * multiplier);
    return `${scheduledDate}T09:00:00.000Z`;
  }

  private buildInvoiceAlertMessage(input: {
    prefix: string;
    hospitalName: string;
    amount: string;
    invoicePeriodStart: string;
    invoicePeriodEnd: string;
    trailing: string;
  }) {
    return `${input.prefix}: ${input.hospitalName}. Monto ${input.amount}. Periodo ${input.invoicePeriodStart} a ${input.invoicePeriodEnd}. ${input.trailing}`;
  }

  private async createAlertIfMissing(input: {
    hospitalId: string;
    invoiceId: string | null;
    paymentId: string | null;
    hospitalAlertRuleId: string | null;
    alertType: string;
    scheduledFor: string;
    message: string;
  }) {
    const existingAlert = await this.alertsRepository.findExisting({
      hospitalAlertRuleId: input.hospitalAlertRuleId,
      invoiceId: input.invoiceId,
      paymentId: input.paymentId,
      scheduledFor: input.scheduledFor,
      alertType: input.alertType,
    });

    if (existingAlert) {
      return null;
    }

    return this.alertsRepository.create({
      id: randomUUID(),
      hospitalId: input.hospitalId,
      invoiceId: input.invoiceId,
      paymentId: input.paymentId,
      hospitalAlertRuleId: input.hospitalAlertRuleId,
      alertType: input.alertType,
      scheduledFor: input.scheduledFor,
      triggeredAt: null,
      status: "pending",
      message: input.message,
    });
  }
}
