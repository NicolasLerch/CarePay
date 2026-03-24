import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../../app/errors/app-error.js";
import { InvoicesService } from "../../../modules/invoices/invoices.service.js";

describe("InvoicesService", () => {
  const invoice = {
    id: "invoice-1",
    hospitalId: "hospital-1",
    appliedBillingRuleId: "rule-1",
    status: "expired",
    invoicePeriodStart: "2026-03-01",
    invoicePeriodEnd: "2026-03-31",
    subtotalAmount: "450000",
    adjustmentsAmount: "0",
    totalAmount: "450000",
    currencyCode: "ARS",
    estimatedPaymentDate: "2026-04-10",
    estimatedPaymentDateOverridden: false,
    deadlineDate: "2026-04-08",
    presentedAt: null,
    notes: null,
    rateSnapshotJson: [],
    billingRuleSnapshotJson: {},
    createdAt: "2026-03-31T00:00:00.000Z",
    updatedAt: "2026-03-31T00:00:00.000Z",
  };

  let invoicesRepository: {
    findPendingExpiredByDate: ReturnType<typeof vi.fn>;
    markExpiredByIds: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
  };
  let alertsRepository: { dismissByInvoiceId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    invoicesRepository = {
      findPendingExpiredByDate: vi.fn().mockResolvedValue([]),
      markExpiredByIds: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(invoice),
      updateStatus: vi.fn(),
      findAll: vi.fn().mockResolvedValue([]),
    };

    alertsRepository = {
      dismissByInvoiceId: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("marks an expired invoice as presented and dismisses its alerts", async () => {
    invoicesRepository.updateStatus.mockResolvedValue({
      ...invoice,
      status: "presented",
      presentedAt: "2026-04-15T12:00:00.000Z",
      notes: "Presentada fuera de termino.",
    });

    const service = new InvoicesService(
      invoicesRepository as never,
      alertsRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.updateStatus("invoice-1", {
      status: "completed",
    });

    expect(invoicesRepository.updateStatus).toHaveBeenCalledWith("invoice-1", {
      status: "presented",
      presentedAt: expect.any(String),
      notes: "Presentada fuera de termino.",
    });
    expect(alertsRepository.dismissByInvoiceId).toHaveBeenCalledWith("invoice-1");
    expect(result.status).toBe("presented");
  });

  it("does not allow manual transition to expired", async () => {
    const service = new InvoicesService(
      invoicesRepository as never,
      alertsRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.updateStatus("invoice-1", {
        status: "expired",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("marks pending invoices as expired automatically", async () => {
    invoicesRepository.findPendingExpiredByDate.mockResolvedValue([
      { id: "invoice-1" },
      { id: "invoice-2" },
    ]);

    const service = new InvoicesService(
      invoicesRepository as never,
      alertsRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await service.expirePendingInvoices("hospital-1");

    expect(invoicesRepository.findPendingExpiredByDate).toHaveBeenCalled();
    expect(invoicesRepository.markExpiredByIds).toHaveBeenCalledWith([
      "invoice-1",
      "invoice-2",
    ]);
  });
});
