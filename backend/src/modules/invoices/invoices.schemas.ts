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

export const invoiceParamsSchema = z.object({
  invoiceId: z.uuid(),
});

export const listInvoicesQuerySchema = z.object({
  hospitalId: z.uuid().optional(),
  status: z.string().trim().min(1).max(50).optional(),
  dateFrom: isoDateSchema.optional(),
  dateTo: isoDateSchema.optional(),
});

export const suggestInvoiceSchema = z.object({
  hospitalId: z.uuid(),
  invoicePeriodStart: isoDateSchema,
  invoicePeriodEnd: isoDateSchema,
});

export const createInvoiceSchema = z.object({
  hospitalId: z.uuid(),
  invoicePeriodStart: isoDateSchema,
  invoicePeriodEnd: isoDateSchema,
  entryIds: z.array(z.uuid()).min(1),
  adjustmentsAmount: z.preprocess(
    emptyStringToUndefined,
    decimalStringSchema.optional(),
  ),
  estimatedPaymentDate: isoDateSchema.optional(),
  notes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500).optional(),
  ),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.string().trim().min(1).max(50),
  presentedAt: z.string().datetime({ offset: true }).optional(),
  notes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500).optional(),
  ),
});

export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
export type SuggestInvoiceInput = z.infer<typeof suggestInvoiceSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
