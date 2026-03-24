import { Router } from "express";

import {
  createHospitalBillingRule,
  deleteHospitalBillingRule,
  getHospitalBillingRule,
  listHospitalBillingRules,
  updateHospitalBillingRule,
} from "./hospital-billing-rules.handlers.js";

export const hospitalBillingRulesRouter = Router({ mergeParams: true });

hospitalBillingRulesRouter.get("/", listHospitalBillingRules);
hospitalBillingRulesRouter.get("/:billingRuleId", getHospitalBillingRule);
hospitalBillingRulesRouter.post("/", createHospitalBillingRule);
hospitalBillingRulesRouter.patch("/:billingRuleId", updateHospitalBillingRule);
hospitalBillingRulesRouter.delete("/:billingRuleId", deleteHospitalBillingRule);

