import { z } from "zod";

import {
  hospitalAlertTypeSchema,
  offsetDirectionSchema,
  timeUnitSchema,
} from "../../shared/domain/enums.js";

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
  alertType: hospitalAlertTypeSchema,
  triggerOffsetUnit: timeUnitSchema,
  triggerOffsetValue: z.number().int().nonnegative(),
  triggerOffsetDirection: offsetDirectionSchema,
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
