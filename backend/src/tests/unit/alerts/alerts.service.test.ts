import { describe, expect, it, vi } from "vitest";

import { AlertsService } from "../../../modules/alerts/alerts.service.js";

describe("AlertsService", () => {
  it("generates payment reminder alerts including hospital, amount and period", async () => {
    const alertsRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      findExisting: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockImplementation(async (payload) => payload),
    };

    const service = new AlertsService(
      alertsRepository as never,
      {
        getById: vi.fn().mockResolvedValue({
          id: "hospital-1",
          name: "Sanatorio Mayo",
        }),
      } as never,
      {
        findApplicableByDate: vi.fn().mockResolvedValue([
          {
            id: "rule-1",
            hospitalId: "hospital-1",
            validFrom: "2026-01-01",
            validTo: null,
            alertType: "payment_pending",
            triggerOffsetUnit: "day",
            triggerOffsetValue: 2,
            triggerOffsetDirection: "before",
            isActive: true,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]),
      } as never,
      {
        findAll: vi.fn().mockResolvedValue([
          {
            id: "invoice-1",
            hospitalId: "hospital-1",
            status: "pending",
            invoicePeriodStart: "2026-03-01",
            invoicePeriodEnd: "2026-03-31",
            totalAmount: "450000",
            estimatedPaymentDate: "2026-04-10",
            deadlineDate: "2026-04-08",
          },
        ]),
      } as never,
      {
        expirePendingInvoices: vi.fn().mockResolvedValue(undefined),
      } as never,
      {
        findAll: vi.fn().mockResolvedValue([
          {
            id: "payment-1",
            invoiceId: "invoice-1",
            status: "pending",
          },
        ]),
      } as never,
    );

    const result = await service.generate({ hospitalId: "hospital-1" });

    expect(result).toHaveLength(1);
    expect(result[0]?.message).toContain("Sanatorio Mayo");
    expect(result[0]?.message).toContain("450000");
    expect(result[0]?.message).toContain("2026-03-01 a 2026-03-31");
  });

  it("does not generate expired alerts for pending invoices", async () => {
    const alertsRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      findExisting: vi.fn().mockResolvedValue(undefined),
      create: vi.fn(),
    };

    const service = new AlertsService(
      alertsRepository as never,
      {
        getById: vi.fn().mockResolvedValue({
          id: "hospital-1",
          name: "Sanatorio Mayo",
        }),
      } as never,
      {
        findApplicableByDate: vi.fn().mockResolvedValue([
          {
            id: "rule-1",
            hospitalId: "hospital-1",
            validFrom: "2026-01-01",
            validTo: null,
            alertType: "invoice_expired",
            triggerOffsetUnit: "day",
            triggerOffsetValue: 0,
            triggerOffsetDirection: "same_day",
            isActive: true,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]),
      } as never,
      {
        findAll: vi.fn().mockResolvedValue([
          {
            id: "invoice-1",
            hospitalId: "hospital-1",
            status: "pending",
            invoicePeriodStart: "2026-03-01",
            invoicePeriodEnd: "2026-03-31",
            totalAmount: "450000",
            estimatedPaymentDate: "2026-04-10",
            deadlineDate: "2026-04-08",
          },
        ]),
      } as never,
      {
        expirePendingInvoices: vi.fn().mockResolvedValue(undefined),
      } as never,
      {
        findAll: vi.fn().mockResolvedValue([]),
      } as never,
    );

    const result = await service.generate({ hospitalId: "hospital-1" });

    expect(result).toHaveLength(0);
    expect(alertsRepository.create).not.toHaveBeenCalled();
  });
});
