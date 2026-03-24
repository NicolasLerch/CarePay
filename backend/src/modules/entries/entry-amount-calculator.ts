import { AppError } from "../../app/errors/app-error.js";
import { normalizeDecimalString, multiplyDecimalStrings } from "../../shared/utils/decimal.js";
import { HospitalRatesRepository } from "../hospital-rates/hospital-rates.repository.js";

import type { CalculateEntryAmountInput } from "./entries.schemas.js";

export type CalculatedEntryAmount = {
  calculatedAmount: string | null;
  finalAmount: string;
  appliedRateId: string | null;
};

export class EntryAmountCalculator {
  public constructor(
    private readonly hospitalRatesRepository = new HospitalRatesRepository(),
  ) {}

  public async calculate(
    input: CalculateEntryAmountInput,
  ): Promise<CalculatedEntryAmount> {
    const effectiveDate = input.entryStartDate.slice(0, 10);

    if (input.amountSource === "manual_override") {
      if (!input.finalAmount) {
        throw new AppError(
          "finalAmount is required when amountSource is manual_override.",
          400,
        );
      }

      const applicableRate = await this.hospitalRatesRepository.findApplicableByDate(
        input.hospitalId,
        effectiveDate,
      );

      return {
        calculatedAmount: applicableRate
          ? this.calculateAmount({
              inputType: input.inputType,
              hoursWorked: input.hoursWorked,
              patientsAttended: input.patientsAttended,
              billingMode: applicableRate.billingMode,
              hourlyRate: applicableRate.hourlyRate,
              patientRate: applicableRate.patientRate,
            })
          : null,
        finalAmount: normalizeDecimalString(input.finalAmount),
        appliedRateId: applicableRate?.id ?? null,
      };
    }

    if (input.amountSource !== "calculated") {
      throw new AppError("Unsupported amountSource.", 400);
    }

    const applicableRate = await this.hospitalRatesRepository.findApplicableByDate(
      input.hospitalId,
      effectiveDate,
    );

    if (!applicableRate) {
      throw new AppError("No hospital rate found for the entry start date.", 409);
    }

    const calculatedAmount = this.calculateAmount({
      inputType: input.inputType,
      hoursWorked: input.hoursWorked,
      patientsAttended: input.patientsAttended,
      billingMode: applicableRate.billingMode,
      hourlyRate: applicableRate.hourlyRate,
      patientRate: applicableRate.patientRate,
    });

    return {
      calculatedAmount,
      finalAmount: calculatedAmount,
      appliedRateId: applicableRate.id,
    };
  }

  private calculateAmount(input: {
    inputType: string;
    hoursWorked?: string | null;
    patientsAttended?: number;
    billingMode: string;
    hourlyRate?: string | null;
    patientRate?: string | null;
  }): string {
    if (input.inputType === "hours") {
      if (input.billingMode !== "per_hour_from_shift") {
        throw new AppError(
          "The applicable hospital rate does not support hour-based entries.",
          409,
        );
      }

      if (!input.hoursWorked || !input.hourlyRate) {
        throw new AppError(
          "hoursWorked and an hourly rate are required to calculate this entry.",
          400,
        );
      }

      return multiplyDecimalStrings(input.hoursWorked, input.hourlyRate);
    }

    if (input.inputType === "patients") {
      if (input.billingMode !== "per_patient") {
        throw new AppError(
          "The applicable hospital rate does not support patient-based entries.",
          409,
        );
      }

      if (input.patientsAttended === undefined || !input.patientRate) {
        throw new AppError(
          "patientsAttended and a patient rate are required to calculate this entry.",
          400,
        );
      }

      return multiplyDecimalStrings(String(input.patientsAttended), input.patientRate);
    }

    if (input.inputType === "custom_amount") {
      throw new AppError(
        "custom_amount entries must use amountSource manual_override.",
        400,
      );
    }

    throw new AppError("Unsupported inputType.", 400);
  }
}

