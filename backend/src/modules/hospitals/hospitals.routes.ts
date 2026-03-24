import { Router } from "express";

import { hospitalEntriesRouter } from "../entries/entries.routes.js";
import { hospitalAlertRulesRouter } from "../hospital-alert-rules/hospital-alert-rules.routes.js";
import { hospitalBillingRulesRouter } from "../hospital-billing-rules/hospital-billing-rules.routes.js";
import { hospitalRatesRouter } from "../hospital-rates/hospital-rates.routes.js";
import {
  createHospital,
  deleteHospital,
  getHospital,
  listHospitals,
  updateHospital,
} from "./hospitals.handlers.js";

export const hospitalsRouter = Router();

hospitalsRouter.get("/", listHospitals);
hospitalsRouter.get("/:hospitalId", getHospital);
hospitalsRouter.post("/", createHospital);
hospitalsRouter.patch("/:hospitalId", updateHospital);
hospitalsRouter.delete("/:hospitalId", deleteHospital);
hospitalsRouter.use("/:hospitalId/entries", hospitalEntriesRouter);
hospitalsRouter.use("/:hospitalId/alert-rules", hospitalAlertRulesRouter);
hospitalsRouter.use("/:hospitalId/rates", hospitalRatesRouter);
hospitalsRouter.use("/:hospitalId/billing-rules", hospitalBillingRulesRouter);
