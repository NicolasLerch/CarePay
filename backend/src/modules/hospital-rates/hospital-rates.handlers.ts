import type { Request, Response } from "express";

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

  response.status(200).json({ data: rates });
}

export async function getHospitalRate(request: Request, response: Response) {
  const { hospitalId, rateId } = hospitalRateParamsSchema.parse(request.params);
  const rate = await hospitalRatesService.getById(hospitalId, rateId);

  response.status(200).json({ data: rate });
}

export async function createHospitalRate(request: Request, response: Response) {
  const { hospitalId } = hospitalRateHospitalParamsSchema.parse(request.params);
  const payload = createHospitalRateSchema.parse(request.body);
  const rate = await hospitalRatesService.create(hospitalId, payload);

  response.status(201).json({ data: rate });
}

export async function updateHospitalRate(request: Request, response: Response) {
  const { hospitalId, rateId } = hospitalRateParamsSchema.parse(request.params);
  const payload = updateHospitalRateSchema.parse(request.body);
  const rate = await hospitalRatesService.update(hospitalId, rateId, payload);

  response.status(200).json({ data: rate });
}

export async function deleteHospitalRate(request: Request, response: Response) {
  const { hospitalId, rateId } = hospitalRateParamsSchema.parse(request.params);
  await hospitalRatesService.delete(hospitalId, rateId);

  response.status(204).send();
}

