import type { Request, Response } from "express";

import {
  sendListSuccess,
  sendSuccess,
} from "../../shared/http/responses.js";

import {
  createInvoiceSchema,
  invoiceParamsSchema,
  listInvoicesQuerySchema,
  suggestInvoiceSchema,
  updateInvoiceStatusSchema,
} from "./invoices.schemas.js";
import { InvoicesService } from "./invoices.service.js";

const invoicesService = new InvoicesService();

export async function listInvoices(request: Request, response: Response) {
  const query = listInvoicesQuerySchema.parse(request.query);
  const invoices = await invoicesService.list(query);

  return sendListSuccess(response, { data: invoices });
}

export async function getInvoice(request: Request, response: Response) {
  const { invoiceId } = invoiceParamsSchema.parse(request.params);
  const invoice = await invoicesService.getById(invoiceId);

  return sendSuccess(response, { data: invoice });
}

export async function suggestInvoice(request: Request, response: Response) {
  const payload = suggestInvoiceSchema.parse(request.body);
  const suggestion = await invoicesService.suggest(payload);

  return sendSuccess(response, { data: suggestion });
}

export async function createInvoice(request: Request, response: Response) {
  const payload = createInvoiceSchema.parse(request.body);
  const invoice = await invoicesService.create(payload);

  return sendSuccess(response, { statusCode: 201, data: invoice });
}

export async function updateInvoiceStatus(
  request: Request,
  response: Response,
) {
  const { invoiceId } = invoiceParamsSchema.parse(request.params);
  const payload = updateInvoiceStatusSchema.parse(request.body);
  const invoice = await invoicesService.updateStatus(invoiceId, payload);

  return sendSuccess(response, { data: invoice });
}
