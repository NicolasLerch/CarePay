import { randomUUID } from "node:crypto";

import { AppError } from "../../app/errors/app-error.js";
import { getPreviousIsoDate } from "../../shared/utils/date.js";
import { HospitalsService } from "../hospitals/hospitals.service.js";

import type {
  CreateHospitalBillingRuleInput,
  UpdateHospitalBillingRuleInput,
} from "./hospital-billing-rules.schemas.js";
import { HospitalBillingRulesRepository } from "./hospital-billing-rules.repository.js";

export class HospitalBillingRulesService {
  public constructor(
    private readonly hospitalBillingRulesRepository = new HospitalBillingRulesRepository(),
    private readonly hospitalsService = new HospitalsService(),
  ) {}

  public async listByHospital(hospitalId: string) {
    await this.hospitalsService.getById(hospitalId);
    return this.hospitalBillingRulesRepository.findAllByHospital(hospitalId);
  }

  public async getById(hospitalId: string, billingRuleId: string) {
    await this.hospitalsService.getById(hospitalId);

    const billingRule = await this.hospitalBillingRulesRepository.findById(
      hospitalId,
      billingRuleId,
    );

    if (!billingRule) {
      throw new AppError("Hospital billing rule not found.", 404);
    }

    return billingRule;
  }

  public async create(
    hospitalId: string,
    input: CreateHospitalBillingRuleInput,
  ) {
    await this.hospitalsService.getById(hospitalId);

    const latestBillingRule =
      await this.hospitalBillingRulesRepository.findLatestByHospital(hospitalId);

    if (latestBillingRule && latestBillingRule.validFrom > input.validFrom) {
      throw new AppError(
        "New hospital billing rules must start on or after the latest existing valid_from.",
        409,
      );
    }

    if (latestBillingRule && !latestBillingRule.validTo) {
      await this.hospitalBillingRulesRepository.update(
        hospitalId,
        latestBillingRule.id,
        {
          validTo: getPreviousIsoDate(input.validFrom),
        },
      );
    }

    return this.hospitalBillingRulesRepository.create({
      id: randomUUID(),
      hospitalId,
      validFrom: input.validFrom,
      validTo: input.validTo ?? null,
      billingFrequencyUnit: input.billingFrequencyUnit,
      billingFrequencyInterval: input.billingFrequencyInterval,
      invoiceIssueAnchor: input.invoiceIssueAnchor ?? null,
      paymentDelayUnit: input.paymentDelayUnit,
      paymentDelayValue: input.paymentDelayValue,
      paymentDateBasis: input.paymentDateBasis,
      paymentBusinessDayPolicy: input.paymentBusinessDayPolicy,
      paymentWindowStartDay: input.paymentWindowStartDay ?? null,
      paymentWindowEndDay: input.paymentWindowEndDay ?? null,
      deadlineOffsetUnit: input.deadlineOffsetUnit,
      deadlineOffsetValue: input.deadlineOffsetValue,
      deadlineOffsetDirection: input.deadlineOffsetDirection,
    });
  }

  public async update(
    hospitalId: string,
    billingRuleId: string,
    input: UpdateHospitalBillingRuleInput,
  ) {
    await this.getById(hospitalId, billingRuleId);

    const billingRule = await this.hospitalBillingRulesRepository.update(
      hospitalId,
      billingRuleId,
      {
        ...(input.validFrom !== undefined ? { validFrom: input.validFrom } : {}),
        ...(input.validTo !== undefined ? { validTo: input.validTo ?? null } : {}),
        ...(input.billingFrequencyUnit !== undefined
          ? { billingFrequencyUnit: input.billingFrequencyUnit }
          : {}),
        ...(input.billingFrequencyInterval !== undefined
          ? { billingFrequencyInterval: input.billingFrequencyInterval }
          : {}),
        ...(input.invoiceIssueAnchor !== undefined
          ? { invoiceIssueAnchor: input.invoiceIssueAnchor ?? null }
          : {}),
        ...(input.paymentDelayUnit !== undefined
          ? { paymentDelayUnit: input.paymentDelayUnit }
          : {}),
        ...(input.paymentDelayValue !== undefined
          ? { paymentDelayValue: input.paymentDelayValue }
          : {}),
        ...(input.paymentDateBasis !== undefined
          ? { paymentDateBasis: input.paymentDateBasis }
          : {}),
        ...(input.paymentBusinessDayPolicy !== undefined
          ? { paymentBusinessDayPolicy: input.paymentBusinessDayPolicy }
          : {}),
        ...(input.paymentWindowStartDay !== undefined
          ? { paymentWindowStartDay: input.paymentWindowStartDay ?? null }
          : {}),
        ...(input.paymentWindowEndDay !== undefined
          ? { paymentWindowEndDay: input.paymentWindowEndDay ?? null }
          : {}),
        ...(input.deadlineOffsetUnit !== undefined
          ? { deadlineOffsetUnit: input.deadlineOffsetUnit }
          : {}),
        ...(input.deadlineOffsetValue !== undefined
          ? { deadlineOffsetValue: input.deadlineOffsetValue }
          : {}),
        ...(input.deadlineOffsetDirection !== undefined
          ? { deadlineOffsetDirection: input.deadlineOffsetDirection }
          : {}),
      },
    );

    if (!billingRule) {
      throw new AppError("Hospital billing rule not found.", 404);
    }

    return billingRule;
  }

  public async delete(hospitalId: string, billingRuleId: string) {
    const deleted = await this.hospitalBillingRulesRepository.delete(
      hospitalId,
      billingRuleId,
    );

    if (!deleted) {
      throw new AppError("Hospital billing rule not found.", 404);
    }
  }
}

