import type { Request, Response } from "express";

import {
  sendListSuccess,
  sendSuccess,
} from "../../shared/http/responses.js";

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

  return sendListSuccess(response, { data: billingRules });
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

  return sendSuccess(response, { data: billingRule });
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

  return sendSuccess(response, { statusCode: 201, data: billingRule });
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

  return sendSuccess(response, { data: billingRule });
}

export async function deleteHospitalBillingRule(
  request: Request,
  response: Response,
) {
  const { hospitalId, billingRuleId } = hospitalBillingRuleParamsSchema.parse(
    request.params,
  );
  await hospitalBillingRulesService.delete(hospitalId, billingRuleId);

  return sendSuccess(response, { data: null });
}
