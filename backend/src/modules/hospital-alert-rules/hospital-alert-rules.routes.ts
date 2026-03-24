import { Router } from "express";

import {
  createHospitalAlertRule,
  deleteHospitalAlertRule,
  getHospitalAlertRule,
  listHospitalAlertRules,
  updateHospitalAlertRule,
} from "./hospital-alert-rules.handlers.js";

export const hospitalAlertRulesRouter = Router({ mergeParams: true });

hospitalAlertRulesRouter.get("/", listHospitalAlertRules);
hospitalAlertRulesRouter.get("/:alertRuleId", getHospitalAlertRule);
hospitalAlertRulesRouter.post("/", createHospitalAlertRule);
hospitalAlertRulesRouter.patch("/:alertRuleId", updateHospitalAlertRule);
hospitalAlertRulesRouter.delete("/:alertRuleId", deleteHospitalAlertRule);

