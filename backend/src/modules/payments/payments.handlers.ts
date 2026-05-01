import type { Request, Response } from "express";

import {
  sendListSuccess,
  sendSuccess,
} from "../../shared/http/responses.js";

import {
  invoicePaymentParamsSchema,
  listPaymentsQuerySchema,
  paymentParamsSchema,
  upsertPaymentSchema,
} from "./payments.schemas.js";
import { PaymentsService } from "./payments.service.js";

const paymentsService = new PaymentsService();

export async function listPayments(request: Request, response: Response) {
  const query = listPaymentsQuerySchema.parse(request.query);
  const payments = await paymentsService.list(query);

  return sendListSuccess(response, { data: payments });
}

export async function getPayment(request: Request, response: Response) {
  const { paymentId } = paymentParamsSchema.parse(request.params);
  const payment = await paymentsService.getById(paymentId);

  return sendSuccess(response, { data: payment });
}

export async function getInvoicePayment(request: Request, response: Response) {
  const { invoiceId } = invoicePaymentParamsSchema.parse(request.params);
  const payment = await paymentsService.getByInvoiceId(invoiceId);

  return sendSuccess(response, { data: payment });
}

export async function upsertInvoicePayment(
  request: Request,
  response: Response,
) {
  const { invoiceId } = invoicePaymentParamsSchema.parse(request.params);
  const payload = upsertPaymentSchema.parse(request.body);
  const payment = await paymentsService.upsertByInvoiceId(invoiceId, payload);

  return sendSuccess(response, { data: payment });
}
