import { z } from "zod";

export const timeUnitValues = ["day", "week", "month"] as const;
export const timeUnitSchema = z.enum(timeUnitValues);
export type TimeUnit = z.infer<typeof timeUnitSchema>;

export const offsetDirectionValues = ["before", "after", "same_day"] as const;
export const offsetDirectionSchema = z.enum(offsetDirectionValues);
export type OffsetDirection = z.infer<typeof offsetDirectionSchema>;

export const entryInputTypeValues = [
  "hours",
  "patients",
  "custom_amount",
] as const;
export const entryInputTypeSchema = z.enum(entryInputTypeValues);
export type EntryInputType = z.infer<typeof entryInputTypeSchema>;

export const amountSourceValues = ["calculated", "manual_override"] as const;
export const amountSourceSchema = z.enum(amountSourceValues);
export type AmountSource = z.infer<typeof amountSourceSchema>;

export const hospitalRateBillingModeValues = [
  "per_patient",
  "per_hour_from_shift",
] as const;
export const hospitalRateBillingModeSchema = z.enum(
  hospitalRateBillingModeValues,
);
export type HospitalRateBillingMode = z.infer<
  typeof hospitalRateBillingModeSchema
>;

export const invoiceStatusValues = [
  "pending",
  "presented",
  "expired",
  "dismissed",
] as const;
export const invoiceStatusSchema = z.enum(invoiceStatusValues);
export const invoiceStatusInputSchema = z.union([
  invoiceStatusSchema,
  z.literal("completed"),
]);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type InvoiceStatusInput = z.infer<typeof invoiceStatusInputSchema>;

export const paymentStatusValues = ["pending", "paid"] as const;
export const paymentStatusSchema = z.enum(paymentStatusValues);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const alertStatusValues = ["pending", "triggered", "dismissed"] as const;
export const alertStatusSchema = z.enum(alertStatusValues);
export type AlertStatus = z.infer<typeof alertStatusSchema>;

export const hospitalAlertTypeValues = [
  "invoice_pending",
  "invoice_expired",
  "payment_pending",
  "payment_due_today",
] as const;
export const hospitalAlertTypeSchema = z.enum(hospitalAlertTypeValues);
export type HospitalAlertType = z.infer<typeof hospitalAlertTypeSchema>;

export const paymentDateBasisValues = [
  "invoice_period_start",
  "invoice_period_end",
] as const;
export const paymentDateBasisSchema = z.enum(paymentDateBasisValues);
export type PaymentDateBasis = z.infer<typeof paymentDateBasisSchema>;

export const paymentBusinessDayPolicyValues = [
  "same_day",
  "last_business_day",
  "payment_window",
] as const;
export const paymentBusinessDayPolicySchema = z.enum(
  paymentBusinessDayPolicyValues,
);
export type PaymentBusinessDayPolicy = z.infer<
  typeof paymentBusinessDayPolicySchema
>;

export const invoiceIssueAnchorValues = [
  "period_start",
  "period_end",
] as const;
export const invoiceIssueAnchorSchema = z.enum(invoiceIssueAnchorValues);
export type InvoiceIssueAnchor = z.infer<typeof invoiceIssueAnchorSchema>;
