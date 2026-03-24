import type { Request, Response } from "express";

import {
  createHospitalBillingRuleSchema,
  hospitalBillingRuleHospitalParamsSchema,
  hospitalBillingRuleParamsSchema,
  updateHospitalBillingRuleSchema,
} from "./hospital-billing-rules.schemas.js";
import { HospitalBillingRulesService } from "./hospital-billing-rules.service.js";

const hospitalBillingRulesService = new HospitalBillingRulesService();

export async function listHospitalBillingRules(
  request: Request,
  response: Response,
) {
  const { hospitalId } = hospitalBillingRuleHospitalParamsSchema.parse(
    request.params,
  );
  const billingRules =
    await hospitalBillingRulesService.listByHospital(hospitalId);

  response.status(200).json({ data: billingRules });
}

export async function getHospitalBillingRule(
  request: Request,
  response: Response,
) {
  const { hospitalId, billingRuleId } = hospitalBillingRuleParamsSchema.parse(
    request.params,
  );
  const billingRule = await hospitalBillingRulesService.getById(
    hospitalId,
    billingRuleId,
  );

  response.status(200).json({ data: billingRule });
}

export async function createHospitalBillingRule(
  request: Request,
  response: Response,
) {
  const { hospitalId } = hospitalBillingRuleHospitalParamsSchema.parse(
    request.params,
  );
  const payload = createHospitalBillingRuleSchema.parse(request.body);
  const billingRule = await hospitalBillingRulesService.create(
    hospitalId,
    payload,
  );

  response.status(201).json({ data: billingRule });
}

export async function updateHospitalBillingRule(
  request: Request,
  response: Response,
) {
  const { hospitalId, billingRuleId } = hospitalBillingRuleParamsSchema.parse(
    request.params,
  );
  const payload = updateHospitalBillingRuleSchema.parse(request.body);
  const billingRule = await hospitalBillingRulesService.update(
    hospitalId,
    billingRuleId,
    payload,
  );

  response.status(200).json({ data: billingRule });
}

export async function deleteHospitalBillingRule(
  request: Request,
  response: Response,
) {
  const { hospitalId, billingRuleId } = hospitalBillingRuleParamsSchema.parse(
    request.params,
  );
  await hospitalBillingRulesService.delete(hospitalId, billingRuleId);

  response.status(204).send();
}

