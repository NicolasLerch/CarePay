import type { Request, Response } from "express";

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

  response.status(200).json({ data: invoices });
}

export async function getInvoice(request: Request, response: Response) {
  const { invoiceId } = invoiceParamsSchema.parse(request.params);
  const invoice = await invoicesService.getById(invoiceId);

  response.status(200).json({ data: invoice });
}

export async function suggestInvoice(request: Request, response: Response) {
  const payload = suggestInvoiceSchema.parse(request.body);
  const suggestion = await invoicesService.suggest(payload);

  response.status(200).json({ data: suggestion });
}

export async function createInvoice(request: Request, response: Response) {
  const payload = createInvoiceSchema.parse(request.body);
  const invoice = await invoicesService.create(payload);

  response.status(201).json({ data: invoice });
}

export async function updateInvoiceStatus(
  request: Request,
  response: Response,
) {
  const { invoiceId } = invoiceParamsSchema.parse(request.params);
  const payload = updateInvoiceStatusSchema.parse(request.body);
  const invoice = await invoicesService.updateStatus(invoiceId, payload);

  response.status(200).json({ data: invoice });
}
