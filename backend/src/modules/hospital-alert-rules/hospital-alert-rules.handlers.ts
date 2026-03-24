import type { Request, Response } from "express";

import {
  createHospitalAlertRuleSchema,
  hospitalAlertRuleHospitalParamsSchema,
  hospitalAlertRuleParamsSchema,
  updateHospitalAlertRuleSchema,
} from "./hospital-alert-rules.schemas.js";
import { HospitalAlertRulesService } from "./hospital-alert-rules.service.js";

const hospitalAlertRulesService = new HospitalAlertRulesService();

export async function listHospitalAlertRules(
  request: Request,
  response: Response,
) {
  const { hospitalId } = hospitalAlertRuleHospitalParamsSchema.parse(
    request.params,
  );
  const alertRules = await hospitalAlertRulesService.listByHospital(hospitalId);

  response.status(200).json({ data: alertRules });
}

export async function getHospitalAlertRule(
  request: Request,
  response: Response,
) {
  const { hospitalId, alertRuleId } = hospitalAlertRuleParamsSchema.parse(
    request.params,
  );
  const alertRule = await hospitalAlertRulesService.getById(
    hospitalId,
    alertRuleId,
  );

  response.status(200).json({ data: alertRule });
}

export async function createHospitalAlertRule(
  request: Request,
  response: Response,
) {
  const { hospitalId } = hospitalAlertRuleHospitalParamsSchema.parse(
    request.params,
  );
  const payload = createHospitalAlertRuleSchema.parse(request.body);
  const alertRule = await hospitalAlertRulesService.create(hospitalId, payload);

  response.status(201).json({ data: alertRule });
}

export async function updateHospitalAlertRule(
  request: Request,
  response: Response,
) {
  const { hospitalId, alertRuleId } = hospitalAlertRuleParamsSchema.parse(
    request.params,
  );
  const payload = updateHospitalAlertRuleSchema.parse(request.body);
  const alertRule = await hospitalAlertRulesService.update(
    hospitalId,
    alertRuleId,
    payload,
  );

  response.status(200).json({ data: alertRule });
}

export async function deleteHospitalAlertRule(
  request: Request,
  response: Response,
) {
  const { hospitalId, alertRuleId } = hospitalAlertRuleParamsSchema.parse(
    request.params,
  );
  await hospitalAlertRulesService.delete(hospitalId, alertRuleId);

  response.status(204).send();
}

