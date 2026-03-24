import type { Request, Response } from "express";

import {
  alertParamsSchema,
  generateAlertsSchema,
  listAlertsQuerySchema,
  updateAlertStatusSchema,
} from "./alerts.schemas.js";
import { AlertsService } from "./alerts.service.js";

const alertsService = new AlertsService();

export async function listAlerts(request: Request, response: Response) {
  const query = listAlertsQuerySchema.parse(request.query);
  const alerts = await alertsService.list(query);

  response.status(200).json({ data: alerts });
}

export async function getAlert(request: Request, response: Response) {
  const { alertId } = alertParamsSchema.parse(request.params);
  const alert = await alertsService.getById(alertId);

  response.status(200).json({ data: alert });
}

export async function generateAlerts(request: Request, response: Response) {
  const payload = generateAlertsSchema.parse(request.body);
  const alerts = await alertsService.generate(payload);

  response.status(201).json({ data: alerts });
}

export async function updateAlertStatus(
  request: Request,
  response: Response,
) {
  const { alertId } = alertParamsSchema.parse(request.params);
  const payload = updateAlertStatusSchema.parse(request.body);
  const alert = await alertsService.updateStatus(alertId, payload);

  response.status(200).json({ data: alert });
}

