import type { Request, Response } from "express";

import {
  createHospitalSchema,
  hospitalParamsSchema,
  updateHospitalSchema,
} from "./hospitals.schemas.js";
import { HospitalsService } from "./hospitals.service.js";

const hospitalsService = new HospitalsService();

export async function listHospitals(_request: Request, response: Response) {
  const hospitals = await hospitalsService.list();
  response.status(200).json({ data: hospitals });
}

export async function getHospital(request: Request, response: Response) {
  const { hospitalId } = hospitalParamsSchema.parse(request.params);
  const hospital = await hospitalsService.getById(hospitalId);

  response.status(200).json({ data: hospital });
}

export async function createHospital(request: Request, response: Response) {
  const payload = createHospitalSchema.parse(request.body);
  const hospital = await hospitalsService.create(payload);

  response.status(201).json({ data: hospital });
}

export async function updateHospital(request: Request, response: Response) {
  const { hospitalId } = hospitalParamsSchema.parse(request.params);
  const payload = updateHospitalSchema.parse(request.body);
  const hospital = await hospitalsService.update(hospitalId, payload);

  response.status(200).json({ data: hospital });
}

export async function deleteHospital(request: Request, response: Response) {
  const { hospitalId } = hospitalParamsSchema.parse(request.params);
  await hospitalsService.delete(hospitalId);

  response.status(204).send();
}

