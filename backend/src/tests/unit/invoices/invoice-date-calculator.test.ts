import { describe, expect, it } from "vitest";

import { InvoiceDateCalculator } from "../../../modules/invoices/invoice-date-calculator.js";

describe("InvoiceDateCalculator", () => {
  it("calculates payment and deadline dates from invoice_period_end", () => {
    const calculator = new InvoiceDateCalculator();

    const result = calculator.calculate({
      invoicePeriodStart: "2026-02-23",
      invoicePeriodEnd: "2026-03-01",
      billingRule: {
        id: "rule-1",
        hospitalId: "hospital-1",
        validFrom: "2026-01-01",
        validTo: null,
        billingFrequencyUnit: "week",
        billingFrequencyInterval: 1,
        invoiceIssueAnchor: "period_end",
        paymentDelayUnit: "week",
        paymentDelayValue: 3,
        paymentDateBasis: "invoice_period_end",
        paymentBusinessDayPolicy: "last_business_day",
        paymentWindowStartDay: null,
        paymentWindowEndDay: null,
        deadlineOffsetUnit: "day",
        deadlineOffsetValue: 1,
        deadlineOffsetDirection: "before",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(result).toEqual({
      estimatedPaymentDate: "2026-03-20",
      deadlineDate: "2026-03-19",
    });
  });

  it("uses payment windows when configured", () => {
    const calculator = new InvoiceDateCalculator();

    const result = calculator.calculate({
      invoicePeriodStart: "2026-03-01",
      invoicePeriodEnd: "2026-03-31",
      billingRule: {
        id: "rule-2",
        hospitalId: "hospital-2",
        validFrom: "2026-01-01",
        validTo: null,
        billingFrequencyUnit: "month",
        billingFrequencyInterval: 1,
        invoiceIssueAnchor: "period_end",
        paymentDelayUnit: "month",
        paymentDelayValue: 1,
        paymentDateBasis: "invoice_period_end",
        paymentBusinessDayPolicy: "window",
        paymentWindowStartDay: 10,
        paymentWindowEndDay: 20,
        deadlineOffsetUnit: "day",
        deadlineOffsetValue: 0,
        deadlineOffsetDirection: "same_day",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(result).toEqual({
      estimatedPaymentDate: "2026-04-10",
      deadlineDate: "2026-04-10",
    });
  });
});

