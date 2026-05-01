import type { Request, Response } from "express";

import {
  sendListSuccess,
  sendSuccess,
} from "../../shared/http/responses.js";

import {
  createHospitalSchema,
  hospitalParamsSchema,
  updateHospitalSchema,
} from "./hospitals.schemas.js";
import { HospitalsService } from "./hospitals.service.js";

const hospitalsService = new HospitalsService();

export async function listHospitals(_request: Request, response: Response) {
  const hospitals = await hospitalsService.list();
  return sendListSuccess(response, { data: hospitals });
}

export async function getHospital(request: Request, response: Response) {
  const { hospitalId } = hospitalParamsSchema.parse(request.params);
  const hospital = await hospitalsService.getById(hospitalId);

  return sendSuccess(response, { data: hospital });
}

export async function createHospital(request: Request, response: Response) {
  const payload = createHospitalSchema.parse(request.body);
  const hospital = await hospitalsService.create(payload);

  return sendSuccess(response, { statusCode: 201, data: hospital });
}

export async function updateHospital(request: Request, response: Response) {
  const { hospitalId } = hospitalParamsSchema.parse(request.params);
  const payload = updateHospitalSchema.parse(request.body);
  const hospital = await hospitalsService.update(hospitalId, payload);

  return sendSuccess(response, { data: hospital });
}

export async function deleteHospital(request: Request, response: Response) {
  const { hospitalId } = hospitalParamsSchema.parse(request.params);
  await hospitalsService.delete(hospitalId);

  return sendSuccess(response, { data: null });
}
