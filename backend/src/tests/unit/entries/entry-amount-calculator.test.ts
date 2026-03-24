import { describe, expect, it } from "vitest";

import { AppError } from "../../../app/errors/app-error.js";
import { EntryAmountCalculator } from "../../../modules/entries/entry-amount-calculator.js";

describe("EntryAmountCalculator", () => {
  it("calculates hour-based amounts with the applicable rate", async () => {
    const calculator = new EntryAmountCalculator({
      findApplicableByDate: async () => ({
        id: "rate-1",
        hospitalId: "hospital-1",
        validFrom: "2026-01-01",
        validTo: null,
        billingMode: "per_hour_from_shift",
        shiftValue: "270000",
        hourlyRate: "11250",
        patientRate: null,
        currencyCode: "ARS",
        notes: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    } as never);

    const result = await calculator.calculate({
      hospitalId: "hospital-1",
      entryStartDate: "2026-03-02T00:00:00.000Z",
      inputType: "hours",
      hoursWorked: "36",
      amountSource: "calculated",
    });

    expect(result).toEqual({
      calculatedAmount: "405000",
      finalAmount: "405000",
      appliedRateId: "rate-1",
    });
  });

  it("calculates patient-based amounts with the applicable rate", async () => {
    const calculator = new EntryAmountCalculator({
      findApplicableByDate: async () => ({
        id: "rate-2",
        hospitalId: "hospital-2",
        validFrom: "2026-01-01",
        validTo: null,
        billingMode: "per_patient",
        shiftValue: null,
        hourlyRate: null,
        patientRate: "10000",
        currencyCode: "ARS",
        notes: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    } as never);

    const result = await calculator.calculate({
      hospitalId: "hospital-2",
      entryStartDate: "2026-03-07T00:00:00.000Z",
      inputType: "patients",
      patientsAttended: 25,
      amountSource: "calculated",
    });

    expect(result.finalAmount).toBe("250000");
  });

  it("allows manual override and still normalizes the final amount", async () => {
    const calculator = new EntryAmountCalculator({
      findApplicableByDate: async () => undefined,
    } as never);

    const result = await calculator.calculate({
      hospitalId: "hospital-1",
      entryStartDate: "2026-03-02T00:00:00.000Z",
      inputType: "custom_amount",
      amountSource: "manual_override",
      finalAmount: "5000.00",
    });

    expect(result).toEqual({
      calculatedAmount: null,
      finalAmount: "5000",
      appliedRateId: null,
    });
  });

  it("throws when no applicable rate exists for calculated amounts", async () => {
    const calculator = new EntryAmountCalculator({
      findApplicableByDate: async () => undefined,
    } as never);

    await expect(
      calculator.calculate({
        hospitalId: "hospital-1",
        entryStartDate: "2026-03-02T00:00:00.000Z",
        inputType: "hours",
        hoursWorked: "10",
        amountSource: "calculated",
      }),
    ).rejects.toMatchObject({
      message: "No hospital rate found for the entry start date.",
      statusCode: 409,
    });
  });
});
