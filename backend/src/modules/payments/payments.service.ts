import { randomUUID } from "node:crypto";

import { AppError } from "../../app/errors/app-error.js";
import { normalizeDecimalString } from "../../shared/utils/decimal.js";
import { InvoicesService } from "../invoices/invoices.service.js";

import type { ListPaymentsQuery, UpsertPaymentInput } from "./payments.schemas.js";
import { PaymentsRepository } from "./payments.repository.js";

export class PaymentsService {
  public constructor(
    private readonly paymentsRepository = new PaymentsRepository(),
    private readonly invoicesService = new InvoicesService(),
  ) {}

  public async list(query: ListPaymentsQuery) {
    return this.paymentsRepository.findAll(query);
  }

  public async getById(paymentId: string) {
    const payment = await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new AppError("Payment not found.", 404);
    }

    return payment;
  }

  public async getByInvoiceId(invoiceId: string) {
    await this.invoicesService.getById(invoiceId);

    const payment = await this.paymentsRepository.findByInvoiceId(invoiceId);

    if (!payment) {
      throw new AppError("Payment not found for invoice.", 404);
    }

    return payment;
  }

  public async upsertByInvoiceId(invoiceId: string, input: UpsertPaymentInput) {
    const invoice = await this.invoicesService.getById(invoiceId);
    const existingPayment = await this.paymentsRepository.findByInvoiceId(invoiceId);

    if (input.status === "paid" && !input.paidAt) {
      throw new AppError("paidAt is required when payment status is paid.", 400);
    }

    const paidAmount =
      input.status === "paid"
        ? normalizeDecimalString(input.paidAmount ?? invoice.totalAmount)
        : input.paidAmount !== undefined
          ? normalizeDecimalString(input.paidAmount)
          : null;

    if (existingPayment) {
      const payment = await this.paymentsRepository.update(existingPayment.id, {
        status: input.status,
        paidAmount,
        paidAt: input.paidAt ?? null,
        notes: input.notes ?? null,
      });

      if (!payment) {
        throw new AppError("Payment not found.", 404);
      }

      return payment;
    }

    return this.paymentsRepository.create({
      id: randomUUID(),
      invoiceId,
      status: input.status,
      paidAmount,
      paidAt: input.paidAt ?? null,
      notes: input.notes ?? null,
    });
  }
}

