import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const hospitalAlertRuleParamsSchema = z.object({
  hospitalId: z.uuid(),
  alertRuleId: z.uuid(),
});

export const hospitalAlertRuleHospitalParamsSchema = z.object({
  hospitalId: z.uuid(),
});

export const createHospitalAlertRuleSchema = z.object({
  validFrom: isoDateSchema,
  validTo: isoDateSchema.optional(),
  alertType: z.string().trim().min(1).max(50),
  triggerOffsetUnit: z.string().trim().min(1).max(50),
  triggerOffsetValue: z.number().int().nonnegative(),
  triggerOffsetDirection: z.string().trim().min(1).max(50),
  isActive: z.boolean().optional(),
});

export const updateHospitalAlertRuleSchema = createHospitalAlertRuleSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message:
      "At least one field is required to update a hospital alert rule.",
  });

export type CreateHospitalAlertRuleInput = z.infer<
  typeof createHospitalAlertRuleSchema
>;
export type UpdateHospitalAlertRuleInput = z.infer<
  typeof updateHospitalAlertRuleSchema
>;

