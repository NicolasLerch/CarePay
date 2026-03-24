import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestampColumns = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
};

export const hospitals = sqliteTable("hospitals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestampColumns,
});

export const hospitalBillingRules = sqliteTable(
  "hospital_billing_rules",
  {
    id: text("id").primaryKey(),
    hospitalId: text("hospital_id")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    validFrom: text("valid_from").notNull(),
    validTo: text("valid_to"),
    billingFrequencyUnit: text("billing_frequency_unit").notNull(),
    billingFrequencyInterval: integer("billing_frequency_interval").notNull(),
    invoiceIssueAnchor: text("invoice_issue_anchor"),
    paymentDelayUnit: text("payment_delay_unit").notNull(),
    paymentDelayValue: integer("payment_delay_value").notNull(),
    paymentDateBasis: text("payment_date_basis").notNull(),
    paymentBusinessDayPolicy: text("payment_business_day_policy").notNull(),
    paymentWindowStartDay: integer("payment_window_start_day"),
    paymentWindowEndDay: integer("payment_window_end_day"),
    deadlineOffsetUnit: text("deadline_offset_unit").notNull(),
    deadlineOffsetValue: integer("deadline_offset_value").notNull(),
    deadlineOffsetDirection: text("deadline_offset_direction").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hospital_billing_rules_hospital_id_idx").on(table.hospitalId),
    index("hospital_billing_rules_valid_from_idx").on(
      table.hospitalId,
      table.validFrom,
    ),
    check(
      "hospital_billing_rules_frequency_interval_positive_ck",
      sql`${table.billingFrequencyInterval} > 0`,
    ),
    check(
      "hospital_billing_rules_payment_delay_value_non_negative_ck",
      sql`${table.paymentDelayValue} >= 0`,
    ),
    check(
      "hospital_billing_rules_deadline_offset_value_non_negative_ck",
      sql`${table.deadlineOffsetValue} >= 0`,
    ),
    check(
      "hospital_billing_rules_payment_window_range_ck",
      sql`(
        (${table.paymentWindowStartDay} IS NULL AND ${table.paymentWindowEndDay} IS NULL)
        OR
        (${table.paymentWindowStartDay} BETWEEN 1 AND 31 AND ${table.paymentWindowEndDay} BETWEEN 1 AND 31 AND ${table.paymentWindowStartDay} <= ${table.paymentWindowEndDay})
      )`,
    ),
    check(
      "hospital_billing_rules_valid_range_ck",
      sql`${table.validTo} IS NULL OR ${table.validTo} >= ${table.validFrom}`,
    ),
  ],
);

export const hospitalRates = sqliteTable(
  "hospital_rates",
  {
    id: text("id").primaryKey(),
    hospitalId: text("hospital_id")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    validFrom: text("valid_from").notNull(),
    validTo: text("valid_to"),
    billingMode: text("billing_mode").notNull(),
    shiftValue: text("shift_value"),
    hourlyRate: text("hourly_rate"),
    patientRate: text("patient_rate"),
    currencyCode: text("currency_code").notNull(),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [
    index("hospital_rates_hospital_id_idx").on(table.hospitalId),
    index("hospital_rates_valid_from_idx").on(table.hospitalId, table.validFrom),
    check(
      "hospital_rates_valid_range_ck",
      sql`${table.validTo} IS NULL OR ${table.validTo} >= ${table.validFrom}`,
    ),
  ],
);

export const hospitalAlertRules = sqliteTable(
  "hospital_alert_rules",
  {
    id: text("id").primaryKey(),
    hospitalId: text("hospital_id")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    validFrom: text("valid_from").notNull(),
    validTo: text("valid_to"),
    alertType: text("alert_type").notNull(),
    triggerOffsetUnit: text("trigger_offset_unit").notNull(),
    triggerOffsetValue: integer("trigger_offset_value").notNull(),
    triggerOffsetDirection: text("trigger_offset_direction").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    index("hospital_alert_rules_hospital_id_idx").on(table.hospitalId),
    index("hospital_alert_rules_valid_from_idx").on(table.hospitalId, table.validFrom),
    check(
      "hospital_alert_rules_trigger_offset_value_non_negative_ck",
      sql`${table.triggerOffsetValue} >= 0`,
    ),
    check(
      "hospital_alert_rules_valid_range_ck",
      sql`${table.validTo} IS NULL OR ${table.validTo} >= ${table.validFrom}`,
    ),
  ],
);

export const invoices = sqliteTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    hospitalId: text("hospital_id")
      .notNull()
      .references(() => hospitals.id, { onDelete: "restrict" }),
    appliedBillingRuleId: text("applied_billing_rule_id").references(
      () => hospitalBillingRules.id,
      { onDelete: "set null" },
    ),
    status: text("status").notNull(),
    invoicePeriodStart: text("invoice_period_start").notNull(),
    invoicePeriodEnd: text("invoice_period_end").notNull(),
    subtotalAmount: text("subtotal_amount").notNull(),
    adjustmentsAmount: text("adjustments_amount").notNull().default("0"),
    totalAmount: text("total_amount").notNull(),
    currencyCode: text("currency_code").notNull(),
    estimatedPaymentDate: text("estimated_payment_date").notNull(),
    estimatedPaymentDateOverridden: integer("estimated_payment_date_overridden", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    deadlineDate: text("deadline_date").notNull(),
    presentedAt: text("presented_at"),
    notes: text("notes"),
    rateSnapshotJson: text("rate_snapshot_json", { mode: "json" }).notNull(),
    billingRuleSnapshotJson: text("billing_rule_snapshot_json", {
      mode: "json",
    }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("invoices_hospital_id_idx").on(table.hospitalId),
    index("invoices_status_idx").on(table.status),
    index("invoices_period_idx").on(table.hospitalId, table.invoicePeriodStart, table.invoicePeriodEnd),
    check(
      "invoices_period_range_ck",
      sql`${table.invoicePeriodEnd} >= ${table.invoicePeriodStart}`,
    ),
  ],
);

export const entries = sqliteTable(
  "entries",
  {
    id: text("id").primaryKey(),
    hospitalId: text("hospital_id")
      .notNull()
      .references(() => hospitals.id, { onDelete: "restrict" }),
    invoiceId: text("invoice_id").references(() => invoices.id, {
      onDelete: "set null",
    }),
    entryStartDate: text("entry_start_date").notNull(),
    entryEndDate: text("entry_end_date").notNull(),
    inputType: text("input_type").notNull(),
    hoursWorked: text("hours_worked"),
    patientsAttended: integer("patients_attended"),
    amountSource: text("amount_source").notNull(),
    calculatedAmount: text("calculated_amount"),
    finalAmount: text("final_amount").notNull(),
    appliedRateId: text("applied_rate_id").references(() => hospitalRates.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [
    index("entries_hospital_id_idx").on(table.hospitalId),
    index("entries_invoice_id_idx").on(table.invoiceId),
    index("entries_period_idx").on(table.hospitalId, table.entryStartDate, table.entryEndDate),
    check(
      "entries_period_range_ck",
      sql`${table.entryEndDate} >= ${table.entryStartDate}`,
    ),
  ],
);

export const payments = sqliteTable(
  "payments",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "restrict" }),
    status: text("status").notNull(),
    paidAmount: text("paid_amount"),
    paidAt: text("paid_at"),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("payments_invoice_id_uidx").on(table.invoiceId),
    index("payments_status_idx").on(table.status),
  ],
);

export const alerts = sqliteTable(
  "alerts",
  {
    id: text("id").primaryKey(),
    hospitalId: text("hospital_id")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    invoiceId: text("invoice_id").references(() => invoices.id, {
      onDelete: "cascade",
    }),
    paymentId: text("payment_id").references(() => payments.id, {
      onDelete: "cascade",
    }),
    hospitalAlertRuleId: text("hospital_alert_rule_id").references(
      () => hospitalAlertRules.id,
      { onDelete: "set null" },
    ),
    alertType: text("alert_type").notNull(),
    scheduledFor: text("scheduled_for").notNull(),
    triggeredAt: text("triggered_at"),
    status: text("status").notNull(),
    message: text("message").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("alerts_hospital_id_idx").on(table.hospitalId),
    index("alerts_invoice_id_idx").on(table.invoiceId),
    index("alerts_payment_id_idx").on(table.paymentId),
    index("alerts_status_idx").on(table.status),
  ],
);

export const hospitalsRelations = relations(hospitals, ({ many }) => ({
  billingRules: many(hospitalBillingRules),
  rates: many(hospitalRates),
  alertRules: many(hospitalAlertRules),
  entries: many(entries),
  invoices: many(invoices),
  alerts: many(alerts),
}));

export const hospitalBillingRulesRelations = relations(
  hospitalBillingRules,
  ({ one, many }) => ({
    hospital: one(hospitals, {
      fields: [hospitalBillingRules.hospitalId],
      references: [hospitals.id],
    }),
    invoices: many(invoices),
  }),
);

export const hospitalRatesRelations = relations(hospitalRates, ({ one, many }) => ({
  hospital: one(hospitals, {
    fields: [hospitalRates.hospitalId],
    references: [hospitals.id],
  }),
  entries: many(entries),
}));

export const hospitalAlertRulesRelations = relations(
  hospitalAlertRules,
  ({ one, many }) => ({
    hospital: one(hospitals, {
      fields: [hospitalAlertRules.hospitalId],
      references: [hospitals.id],
    }),
    alerts: many(alerts),
  }),
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  hospital: one(hospitals, {
    fields: [invoices.hospitalId],
    references: [hospitals.id],
  }),
  appliedBillingRule: one(hospitalBillingRules, {
    fields: [invoices.appliedBillingRuleId],
    references: [hospitalBillingRules.id],
  }),
  entries: many(entries),
  payment: many(payments),
  alerts: many(alerts),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  hospital: one(hospitals, {
    fields: [entries.hospitalId],
    references: [hospitals.id],
  }),
  invoice: one(invoices, {
    fields: [entries.invoiceId],
    references: [invoices.id],
  }),
  appliedRate: one(hospitalRates, {
    fields: [entries.appliedRateId],
    references: [hospitalRates.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  alerts: many(alerts),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  hospital: one(hospitals, {
    fields: [alerts.hospitalId],
    references: [hospitals.id],
  }),
  invoice: one(invoices, {
    fields: [alerts.invoiceId],
    references: [invoices.id],
  }),
  payment: one(payments, {
    fields: [alerts.paymentId],
    references: [payments.id],
  }),
  hospitalAlertRule: one(hospitalAlertRules, {
    fields: [alerts.hospitalAlertRuleId],
    references: [hospitalAlertRules.id],
  }),
}));
