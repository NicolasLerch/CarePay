import { z } from "zod";

import {
  invoiceIssueAnchorSchema,
  offsetDirectionSchema,
  paymentBusinessDayPolicySchema,
  paymentDateBasisSchema,
  timeUnitSchema,
} from "../../shared/domain/enums.js";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const hospitalBillingRuleParamsSchema = z.object({
  hospitalId: z.uuid(),
  billingRuleId: z.uuid(),
});

export const hospitalBillingRuleHospitalParamsSchema = z.object({
  hospitalId: z.uuid(),
});

export const createHospitalBillingRuleSchema = z.object({
  validFrom: isoDateSchema,
  validTo: isoDateSchema.optional(),
  billingFrequencyUnit: z.string().trim().min(1).max(50),
  billingFrequencyInterval: z.number().int().positive(),
  invoiceIssueAnchor: z.preprocess(
    emptyStringToUndefined,
    invoiceIssueAnchorSchema.optional(),
  ),
  paymentDelayUnit: timeUnitSchema,
  paymentDelayValue: z.number().int().nonnegative(),
  paymentDateBasis: paymentDateBasisSchema,
  paymentBusinessDayPolicy: paymentBusinessDayPolicySchema,
  paymentWindowStartDay: z.number().int().min(1).max(31).optional(),
  paymentWindowEndDay: z.number().int().min(1).max(31).optional(),
  deadlineOffsetUnit: timeUnitSchema,
  deadlineOffsetValue: z.number().int().nonnegative(),
  deadlineOffsetDirection: offsetDirectionSchema,
});

export const updateHospitalBillingRuleSchema = createHospitalBillingRuleSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message:
      "At least one field is required to update a hospital billing rule.",
  });

export type CreateHospitalBillingRuleInput = z.infer<
  typeof createHospitalBillingRuleSchema
>;
export type UpdateHospitalBillingRuleInput = z.infer<
  typeof updateHospitalBillingRuleSchema
>;
