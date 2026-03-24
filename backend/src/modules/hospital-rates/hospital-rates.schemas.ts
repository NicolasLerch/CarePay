import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const decimalStringSchema = z.string().regex(/^\d+(\.\d+)?$/);
const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const hospitalRateParamsSchema = z.object({
  hospitalId: z.uuid(),
  rateId: z.uuid(),
});

export const hospitalRateHospitalParamsSchema = z.object({
  hospitalId: z.uuid(),
});

export const createHospitalRateSchema = z.object({
  validFrom: isoDateSchema,
  validTo: isoDateSchema.optional(),
  billingMode: z.string().trim().min(1).max(50),
  shiftValue: z.preprocess(emptyStringToUndefined, decimalStringSchema.optional()),
  hourlyRate: z.preprocess(emptyStringToUndefined, decimalStringSchema.optional()),
  patientRate: z.preprocess(
    emptyStringToUndefined,
    decimalStringSchema.optional(),
  ),
  currencyCode: z.string().trim().min(1).max(10),
  notes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500).optional(),
  ),
});

export const updateHospitalRateSchema = createHospitalRateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required to update a hospital rate.",
  });

export type CreateHospitalRateInput = z.infer<typeof createHospitalRateSchema>;
export type UpdateHospitalRateInput = z.infer<typeof updateHospitalRateSchema>;

