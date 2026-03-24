import { randomUUID } from "node:crypto";

import { AppError } from "../../app/errors/app-error.js";
import { getPreviousIsoDate } from "../../shared/utils/date.js";
import { HospitalsService } from "../hospitals/hospitals.service.js";

import type {
  CreateHospitalRateInput,
  UpdateHospitalRateInput,
} from "./hospital-rates.schemas.js";
import { HospitalRatesRepository } from "./hospital-rates.repository.js";

export class HospitalRatesService {
  public constructor(
    private readonly hospitalRatesRepository = new HospitalRatesRepository(),
    private readonly hospitalsService = new HospitalsService(),
  ) {}

  public async listByHospital(hospitalId: string) {
    await this.hospitalsService.getById(hospitalId);
    return this.hospitalRatesRepository.findAllByHospital(hospitalId);
  }

  public async getById(hospitalId: string, rateId: string) {
    await this.hospitalsService.getById(hospitalId);

    const rate = await this.hospitalRatesRepository.findById(hospitalId, rateId);

    if (!rate) {
      throw new AppError("Hospital rate not found.", 404);
    }

    return rate;
  }

  public async create(hospitalId: string, input: CreateHospitalRateInput) {
    await this.hospitalsService.getById(hospitalId);

    const latestRate =
      await this.hospitalRatesRepository.findLatestByHospital(hospitalId);

    if (latestRate && latestRate.validFrom > input.validFrom) {
      throw new AppError(
        "New hospital rates must start on or after the latest existing valid_from.",
        409,
      );
    }

    if (latestRate && !latestRate.validTo) {
      await this.hospitalRatesRepository.update(hospitalId, latestRate.id, {
        validTo: getPreviousIsoDate(input.validFrom),
      });
    }

    return this.hospitalRatesRepository.create({
      id: randomUUID(),
      hospitalId,
      validFrom: input.validFrom,
      validTo: input.validTo ?? null,
      billingMode: input.billingMode,
      shiftValue: input.shiftValue ?? null,
      hourlyRate: input.hourlyRate ?? null,
      patientRate: input.patientRate ?? null,
      currencyCode: input.currencyCode,
      notes: input.notes ?? null,
    });
  }

  public async update(
    hospitalId: string,
    rateId: string,
    input: UpdateHospitalRateInput,
  ) {
    await this.getById(hospitalId, rateId);

    const rate = await this.hospitalRatesRepository.update(hospitalId, rateId, {
      ...(input.validFrom !== undefined ? { validFrom: input.validFrom } : {}),
      ...(input.validTo !== undefined ? { validTo: input.validTo ?? null } : {}),
      ...(input.billingMode !== undefined
        ? { billingMode: input.billingMode }
        : {}),
      ...(input.shiftValue !== undefined ? { shiftValue: input.shiftValue } : {}),
      ...(input.hourlyRate !== undefined ? { hourlyRate: input.hourlyRate } : {}),
      ...(input.patientRate !== undefined
        ? { patientRate: input.patientRate }
        : {}),
      ...(input.currencyCode !== undefined
        ? { currencyCode: input.currencyCode }
        : {}),
      ...(input.notes !== undefined ? { notes: input.notes ?? null } : {}),
    });

    if (!rate) {
      throw new AppError("Hospital rate not found.", 404);
    }

    return rate;
  }

  public async delete(hospitalId: string, rateId: string) {
    const deleted = await this.hospitalRatesRepository.delete(hospitalId, rateId);

    if (!deleted) {
      throw new AppError("Hospital rate not found.", 404);
    }
  }
}

