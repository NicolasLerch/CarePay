import { z } from "zod";

const isoDateTimeSchema = z.string().datetime({ offset: true });
const decimalStringSchema = z.string().regex(/^\d+(\.\d+)?$/);
const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const paymentParamsSchema = z.object({
  paymentId: z.uuid(),
});

export const invoicePaymentParamsSchema = z.object({
  invoiceId: z.uuid(),
});

export const listPaymentsQuerySchema = z.object({
  invoiceId: z.uuid().optional(),
  hospitalId: z.uuid().optional(),
  status: z.string().trim().min(1).max(50).optional(),
});

export const upsertPaymentSchema = z.object({
  status: z.string().trim().min(1).max(50),
  paidAmount: z.preprocess(
    emptyStringToUndefined,
    decimalStringSchema.optional(),
  ),
  paidAt: z.preprocess(
    emptyStringToUndefined,
    isoDateTimeSchema.optional(),
  ),
  notes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500).optional(),
  ),
});

export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
export type UpsertPaymentInput = z.infer<typeof upsertPaymentSchema>;

