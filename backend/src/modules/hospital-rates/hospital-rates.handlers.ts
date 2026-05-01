import type { Request, Response } from "express";

import {
  sendListSuccess,
  sendSuccess,
} from "../../shared/http/responses.js";

import {
  createHospitalRateSchema,
  hospitalRateHospitalParamsSchema,
  hospitalRateParamsSchema,
  updateHospitalRateSchema,
} from "./hospital-rates.schemas.js";
import { HospitalRatesService } from "./hospital-rates.service.js";

const hospitalRatesService = new HospitalRatesService();

export async function listHospitalRates(request: Request, response: Response) {
  const { hospitalId } = hospitalRateHospitalParamsSchema.parse(request.params);
  const rates = await hospitalRatesService.listByHospital(hospitalId);

  return sendListSuccess(response, { data: rates });
}

export async function getHospitalRate(request: Request, response: Response) {
  const { hospitalId, rateId } = hospitalRateParamsSchema.parse(request.params);
  const rate = await hospitalRatesService.getById(hospitalId, rateId);

  return sendSuccess(response, { data: rate });
}

export async function createHospitalRate(request: Request, response: Response) {
  const { hospitalId } = hospitalRateHospitalParamsSchema.parse(request.params);
  const payload = createHospitalRateSchema.parse(request.body);
  const rate = await hospitalRatesService.create(hospitalId, payload);

  return sendSuccess(response, { statusCode: 201, data: rate });
}

export async function updateHospitalRate(request: Request, response: Response) {
  const { hospitalId, rateId } = hospitalRateParamsSchema.parse(request.params);
  const payload = updateHospitalRateSchema.parse(request.body);
  const rate = await hospitalRatesService.update(hospitalId, rateId, payload);

  return sendSuccess(response, { data: rate });
}

export async function deleteHospitalRate(request: Request, response: Response) {
  const { hospitalId, rateId } = hospitalRateParamsSchema.parse(request.params);
  await hospitalRatesService.delete(hospitalId, rateId);

  return sendSuccess(response, { data: null });
}
