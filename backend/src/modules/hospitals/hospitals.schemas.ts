import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const hospitalParamsSchema = z.object({
  hospitalId: z.uuid(),
});

export const createHospitalSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500).optional(),
  ),
  isActive: z.boolean().optional(),
});

export const updateHospitalSchema = createHospitalSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required to update a hospital.",
  });

export type CreateHospitalInput = z.infer<typeof createHospitalSchema>;
export type UpdateHospitalInput = z.infer<typeof updateHospitalSchema>;

