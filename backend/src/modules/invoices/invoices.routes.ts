import { Router } from "express";

import { invoicePaymentsRouter } from "../payments/payments.routes.js";
import {
  createInvoice,
  getInvoice,
  listInvoices,
  suggestInvoice,
  updateInvoiceStatus,
} from "./invoices.handlers.js";

export const invoicesRouter = Router();

invoicesRouter.get("/", listInvoices);
invoicesRouter.get("/:invoiceId", getInvoice);
invoicesRouter.post("/", createInvoice);
invoicesRouter.post("/suggestions", suggestInvoice);
invoicesRouter.patch("/:invoiceId/status", updateInvoiceStatus);
invoicesRouter.use("/:invoiceId/payment", invoicePaymentsRouter);
