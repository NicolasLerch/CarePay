import { describe, expect, it } from "vitest";

import { AppError } from "../../../app/errors/app-error.js";
import {
  assertSupportedInvoiceStatus,
  normalizeInvoiceStatus,
} from "../../../modules/invoices/invoice-status.js";

describe("invoice status helpers", () => {
  it("normalizes completed to presented", () => {
    expect(normalizeInvoiceStatus("completed")).toBe("presented");
    expect(normalizeInvoiceStatus(" Presented ")).toBe("presented");
  });

  it("accepts the supported statuses", () => {
    expect(() => assertSupportedInvoiceStatus("pending")).not.toThrow();
    expect(() => assertSupportedInvoiceStatus("completed")).not.toThrow();
    expect(() => assertSupportedInvoiceStatus("dismissed")).not.toThrow();
  });

  it("rejects unsupported statuses", () => {
    expect(() => assertSupportedInvoiceStatus("draft")).toThrowError(AppError);
  });
});

