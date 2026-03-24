import { randomUUID } from "node:crypto";

import { AppError } from "../../app/errors/app-error.js";
import { getPreviousIsoDate } from "../../shared/utils/date.js";
import { HospitalsService } from "../hospitals/hospitals.service.js";

import type {
  CreateHospitalAlertRuleInput,
  UpdateHospitalAlertRuleInput,
} from "./hospital-alert-rules.schemas.js";
import { HospitalAlertRulesRepository } from "./hospital-alert-rules.repository.js";

export class HospitalAlertRulesService {
  public constructor(
    private readonly hospitalAlertRulesRepository = new HospitalAlertRulesRepository(),
    private readonly hospitalsService = new HospitalsService(),
  ) {}

  public async listByHospital(hospitalId: string) {
    await this.hospitalsService.getById(hospitalId);
    return this.hospitalAlertRulesRepository.findAllByHospital(hospitalId);
  }

  public async getById(hospitalId: string, alertRuleId: string) {
    await this.hospitalsService.getById(hospitalId);

    const alertRule = await this.hospitalAlertRulesRepository.findById(
      hospitalId,
      alertRuleId,
    );

    if (!alertRule) {
      throw new AppError("Hospital alert rule not found.", 404);
    }

    return alertRule;
  }

  public async create(
    hospitalId: string,
    input: CreateHospitalAlertRuleInput,
  ) {
    await this.hospitalsService.getById(hospitalId);

    const latestAlertRule =
      await this.hospitalAlertRulesRepository.findLatestByHospital(hospitalId);

    if (latestAlertRule && latestAlertRule.validFrom > input.validFrom) {
      throw new AppError(
        "New hospital alert rules must start on or after the latest existing valid_from.",
        409,
      );
    }

    if (latestAlertRule && !latestAlertRule.validTo) {
      await this.hospitalAlertRulesRepository.update(
        hospitalId,
        latestAlertRule.id,
        {
          validTo: getPreviousIsoDate(input.validFrom),
        },
      );
    }

    return this.hospitalAlertRulesRepository.create({
      id: randomUUID(),
      hospitalId,
      validFrom: input.validFrom,
      validTo: input.validTo ?? null,
      alertType: input.alertType,
      triggerOffsetUnit: input.triggerOffsetUnit,
      triggerOffsetValue: input.triggerOffsetValue,
      triggerOffsetDirection: input.triggerOffsetDirection,
      isActive: input.isActive ?? true,
    });
  }

  public async update(
    hospitalId: string,
    alertRuleId: string,
    input: UpdateHospitalAlertRuleInput,
  ) {
    await this.getById(hospitalId, alertRuleId);

    const alertRule = await this.hospitalAlertRulesRepository.update(
      hospitalId,
      alertRuleId,
      {
        ...(input.validFrom !== undefined ? { validFrom: input.validFrom } : {}),
        ...(input.validTo !== undefined ? { validTo: input.validTo ?? null } : {}),
        ...(input.alertType !== undefined ? { alertType: input.alertType } : {}),
        ...(input.triggerOffsetUnit !== undefined
          ? { triggerOffsetUnit: input.triggerOffsetUnit }
          : {}),
        ...(input.triggerOffsetValue !== undefined
          ? { triggerOffsetValue: input.triggerOffsetValue }
          : {}),
        ...(input.triggerOffsetDirection !== undefined
          ? { triggerOffsetDirection: input.triggerOffsetDirection }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    );

    if (!alertRule) {
      throw new AppError("Hospital alert rule not found.", 404);
    }

    return alertRule;
  }

  public async delete(hospitalId: string, alertRuleId: string) {
    const deleted = await this.hospitalAlertRulesRepository.delete(
      hospitalId,
      alertRuleId,
    );

    if (!deleted) {
      throw new AppError("Hospital alert rule not found.", 404);
    }
  }
}

