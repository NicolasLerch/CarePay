import { z } from "zod";

import {
  amountSourceSchema,
  entryInputTypeSchema,
} from "../../shared/domain/enums.js";

const isoDateTimeSchema = z.string().datetime({ offset: true });
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const decimalStringSchema = z.string().regex(/^\d+(\.\d+)?$/);
const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const entryParamsSchema = z.object({
  entryId: z.uuid(),
});

export const hospitalEntriesParamsSchema = z.object({
  hospitalId: z.uuid(),
});

export const listEntriesQuerySchema = z.object({
  hospitalId: z.uuid().optional(),
  entryDateFrom: isoDateSchema.optional(),
  entryDateTo: isoDateSchema.optional(),
});

export const createEntrySchema = z.object({
  hospitalId: z.uuid(),
  invoiceId: z.uuid().optional(),
  entryStartDate: isoDateTimeSchema,
  entryEndDate: isoDateTimeSchema,
  inputType: entryInputTypeSchema,
  hoursWorked: z.preprocess(
    emptyStringToUndefined,
    decimalStringSchema.optional(),
  ),
  patientsAttended: z.number().int().nonnegative().optional(),
  amountSource: amountSourceSchema,
  finalAmount: z.preprocess(
    emptyStringToUndefined,
    decimalStringSchema.optional(),
  ),
  notes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500).optional(),
  ),
});

export const updateEntrySchema = createEntrySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required to update an entry.",
  });

export const calculateEntryAmountSchema = z.object({
  hospitalId: z.uuid(),
  entryStartDate: isoDateTimeSchema,
  inputType: entryInputTypeSchema,
  hoursWorked: z.preprocess(
    emptyStringToUndefined,
    decimalStringSchema.optional(),
  ),
  patientsAttended: z.number().int().nonnegative().optional(),
  amountSource: amountSourceSchema,
  finalAmount: z.preprocess(
    emptyStringToUndefined,
    decimalStringSchema.optional(),
  ),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type ListEntriesQuery = z.infer<typeof listEntriesQuerySchema>;
export type CalculateEntryAmountInput = z.infer<typeof calculateEntryAmountSchema>;
