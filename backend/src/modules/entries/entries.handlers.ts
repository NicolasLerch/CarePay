import type { Request, Response } from "express";

import {
  sendListSuccess,
  sendSuccess,
} from "../../shared/http/responses.js";

import {
  calculateEntryAmountSchema,
  createEntrySchema,
  entryParamsSchema,
  hospitalEntriesParamsSchema,
  listEntriesQuerySchema,
  updateEntrySchema,
} from "./entries.schemas.js";
import { EntriesService } from "./entries.service.js";

const entriesService = new EntriesService();

export async function listEntries(request: Request, response: Response) {
  const query = listEntriesQuerySchema.parse(request.query);
  const entries = await entriesService.list(query);

  return sendListSuccess(response, { data: entries });
}

export async function listHospitalEntries(request: Request, response: Response) {
  const { hospitalId } = hospitalEntriesParamsSchema.parse(request.params);
  const query = listEntriesQuerySchema.parse({
    ...request.query,
    hospitalId,
  });
  const entries = await entriesService.list(query);

  return sendListSuccess(response, { data: entries });
}

export async function getEntry(request: Request, response: Response) {
  const { entryId } = entryParamsSchema.parse(request.params);
  const entry = await entriesService.getById(entryId);

  return sendSuccess(response, { data: entry });
}

export async function createEntry(request: Request, response: Response) {
  const payload = createEntrySchema.parse(request.body);
  const entry = await entriesService.create(payload);

  return sendSuccess(response, { statusCode: 201, data: entry });
}

export async function calculateEntryAmount(
  request: Request,
  response: Response,
) {
  const payload = calculateEntryAmountSchema.parse(request.body);
  const calculation = await entriesService.calculateAmount(payload);

  return sendSuccess(response, { data: calculation });
}

export async function updateEntry(request: Request, response: Response) {
  const { entryId } = entryParamsSchema.parse(request.params);
  const payload = updateEntrySchema.parse(request.body);
  const entry = await entriesService.update(entryId, payload);

  return sendSuccess(response, { data: entry });
}

export async function deleteEntry(request: Request, response: Response) {
  const { entryId } = entryParamsSchema.parse(request.params);
  await entriesService.delete(entryId);

  return sendSuccess(response, { data: null });
}
