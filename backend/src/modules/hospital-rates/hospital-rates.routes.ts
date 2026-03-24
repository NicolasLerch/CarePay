import { Router } from "express";

import {
  createHospitalRate,
  deleteHospitalRate,
  getHospitalRate,
  listHospitalRates,
  updateHospitalRate,
} from "./hospital-rates.handlers.js";

export const hospitalRatesRouter = Router({ mergeParams: true });

hospitalRatesRouter.get("/", listHospitalRates);
hospitalRatesRouter.get("/:rateId", getHospitalRate);
hospitalRatesRouter.post("/", createHospitalRate);
hospitalRatesRouter.patch("/:rateId", updateHospitalRate);
hospitalRatesRouter.delete("/:rateId", deleteHospitalRate);

