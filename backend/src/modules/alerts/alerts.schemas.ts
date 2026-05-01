import { z } from "zod";

import {
  alertStatusSchema,
  hospitalAlertTypeSchema,
} from "../../shared/domain/enums.js";

export const alertParamsSchema = z.object({
  alertId: z.uuid(),
});

export const listAlertsQuerySchema = z.object({
  hospitalId: z.uuid().optional(),
  invoiceId: z.uuid().optional(),
  paymentId: z.uuid().optional(),
  status: alertStatusSchema.optional(),
  alertType: hospitalAlertTypeSchema.optional(),
});

export const generateAlertsSchema = z.object({
  hospitalId: z.uuid(),
});

export const updateAlertStatusSchema = z.object({
  status: alertStatusSchema,
});

export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;
export type GenerateAlertsInput = z.infer<typeof generateAlertsSchema>;
export type UpdateAlertStatusInput = z.infer<typeof updateAlertStatusSchema>;
