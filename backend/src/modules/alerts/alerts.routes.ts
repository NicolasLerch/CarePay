import { Router } from "express";

import {
  generateAlerts,
  getAlert,
  listAlerts,
  updateAlertStatus,
} from "./alerts.handlers.js";

export const alertsRouter = Router();

alertsRouter.get("/", listAlerts);
alertsRouter.get("/:alertId", getAlert);
alertsRouter.post("/generate", generateAlerts);
alertsRouter.patch("/:alertId/status", updateAlertStatus);

