import { Router } from "express";

import {
  getInvoicePayment,
  getPayment,
  listPayments,
  upsertInvoicePayment,
} from "./payments.handlers.js";

export const paymentsRouter = Router();

paymentsRouter.get("/", listPayments);
paymentsRouter.get("/:paymentId", getPayment);

export const invoicePaymentsRouter = Router({ mergeParams: true });

invoicePaymentsRouter.get("/", getInvoicePayment);
invoicePaymentsRouter.put("/", upsertInvoicePayment);
