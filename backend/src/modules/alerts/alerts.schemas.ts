import { z } from "zod";

export const alertParamsSchema = z.object({
  alertId: z.uuid(),
});

export const listAlertsQuerySchema = z.object({
  hospitalId: z.uuid().optional(),
  invoiceId: z.uuid().optional(),
  paymentId: z.uuid().optional(),
  status: z.string().trim().min(1).max(50).optional(),
  alertType: z.string().trim().min(1).max(50).optional(),
});

export const generateAlertsSchema = z.object({
  hospitalId: z.uuid(),
});

export const updateAlertStatusSchema = z.object({
  status: z.string().trim().min(1).max(50),
});

export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;
export type GenerateAlertsInput = z.infer<typeof generateAlertsSchema>;
export type UpdateAlertStatusInput = z.infer<typeof updateAlertStatusSchema>;

