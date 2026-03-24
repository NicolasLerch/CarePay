import { AppError } from "../../app/errors/app-error.js";

export function normalizeInvoiceStatus(status: string): string {
  const normalized = status.trim().toLowerCase();

  if (normalized === "completed") {
    return "presented";
  }

  return normalized;
}

export function assertSupportedInvoiceStatus(status: string): void {
  const normalized = normalizeInvoiceStatus(status);
  const supportedStatuses = new Set([
    "pending",
    "presented",
    "expired",
    "dismissed",
  ]);

  if (!supportedStatuses.has(normalized)) {
    throw new AppError("Unsupported invoice status.", 400);
  }
}

