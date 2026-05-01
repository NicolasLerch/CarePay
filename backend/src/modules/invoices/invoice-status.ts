import { AppError } from "../../app/errors/app-error.js";
import {
  invoiceStatusSchema,
  invoiceStatusValues,
} from "../../shared/domain/enums.js";

import type { InvoiceStatus } from "../../shared/domain/enums.js";

export function normalizeInvoiceStatus(status: string): InvoiceStatus {
  const normalized = status.trim().toLowerCase();

  const canonicalStatus = normalized === "completed" ? "presented" : normalized;
  const parsedStatus = invoiceStatusSchema.safeParse(canonicalStatus);

  if (!parsedStatus.success) {
    throw new AppError("Unsupported invoice status.", 400);
  }

  return parsedStatus.data;
}

export function assertSupportedInvoiceStatus(status: string): void {
  const normalized = normalizeInvoiceStatus(status);
  const supportedStatuses = new Set(invoiceStatusValues);

  if (!supportedStatuses.has(normalized)) {
    throw new AppError("Unsupported invoice status.", 400);
  }
}
