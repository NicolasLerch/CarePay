CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`hospital_id` text NOT NULL,
	`invoice_id` text,
	`payment_id` text,
	`hospital_alert_rule_id` text,
	`alert_type` text NOT NULL,
	`scheduled_for` text NOT NULL,
	`triggered_at` text,
	`status` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`hospital_alert_rule_id`) REFERENCES `hospital_alert_rules`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `alerts_hospital_id_idx` ON `alerts` (`hospital_id`);--> statement-breakpoint
CREATE INDEX `alerts_invoice_id_idx` ON `alerts` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `alerts_payment_id_idx` ON `alerts` (`payment_id`);--> statement-breakpoint
CREATE INDEX `alerts_status_idx` ON `alerts` (`status`);--> statement-breakpoint
CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`hospital_id` text NOT NULL,
	`invoice_id` text,
	`entry_start_date` text NOT NULL,
	`entry_end_date` text NOT NULL,
	`input_type` text NOT NULL,
	`hours_worked` text,
	`patients_attended` integer,
	`amount_source` text NOT NULL,
	`calculated_amount` text,
	`final_amount` text NOT NULL,
	`applied_rate_id` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`applied_rate_id`) REFERENCES `hospital_rates`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "entries_period_range_ck" CHECK("entries"."entry_end_date" >= "entries"."entry_start_date")
);
--> statement-breakpoint
CREATE INDEX `entries_hospital_id_idx` ON `entries` (`hospital_id`);--> statement-breakpoint
CREATE INDEX `entries_invoice_id_idx` ON `entries` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `entries_period_idx` ON `entries` (`hospital_id`,`entry_start_date`,`entry_end_date`);--> statement-breakpoint
CREATE TABLE `hospital_alert_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`hospital_id` text NOT NULL,
	`valid_from` text NOT NULL,
	`valid_to` text,
	`alert_type` text NOT NULL,
	`trigger_offset_unit` text NOT NULL,
	`trigger_offset_value` integer NOT NULL,
	`trigger_offset_direction` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "hospital_alert_rules_trigger_offset_value_non_negative_ck" CHECK("hospital_alert_rules"."trigger_offset_value" >= 0),
	CONSTRAINT "hospital_alert_rules_valid_range_ck" CHECK("hospital_alert_rules"."valid_to" IS NULL OR "hospital_alert_rules"."valid_to" >= "hospital_alert_rules"."valid_from")
);
--> statement-breakpoint
CREATE INDEX `hospital_alert_rules_hospital_id_idx` ON `hospital_alert_rules` (`hospital_id`);--> statement-breakpoint
CREATE INDEX `hospital_alert_rules_valid_from_idx` ON `hospital_alert_rules` (`hospital_id`,`valid_from`);--> statement-breakpoint
CREATE TABLE `hospital_billing_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`hospital_id` text NOT NULL,
	`valid_from` text NOT NULL,
	`valid_to` text,
	`billing_frequency_unit` text NOT NULL,
	`billing_frequency_interval` integer NOT NULL,
	`invoice_issue_anchor` text,
	`payment_delay_unit` text NOT NULL,
	`payment_delay_value` integer NOT NULL,
	`payment_date_basis` text NOT NULL,
	`payment_business_day_policy` text NOT NULL,
	`payment_window_start_day` integer,
	`payment_window_end_day` integer,
	`deadline_offset_unit` text NOT NULL,
	`deadline_offset_value` integer NOT NULL,
	`deadline_offset_direction` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "hospital_billing_rules_frequency_interval_positive_ck" CHECK("hospital_billing_rules"."billing_frequency_interval" > 0),
	CONSTRAINT "hospital_billing_rules_payment_delay_value_non_negative_ck" CHECK("hospital_billing_rules"."payment_delay_value" >= 0),
	CONSTRAINT "hospital_billing_rules_deadline_offset_value_non_negative_ck" CHECK("hospital_billing_rules"."deadline_offset_value" >= 0),
	CONSTRAINT "hospital_billing_rules_payment_window_range_ck" CHECK((
        ("hospital_billing_rules"."payment_window_start_day" IS NULL AND "hospital_billing_rules"."payment_window_end_day" IS NULL)
        OR
        ("hospital_billing_rules"."payment_window_start_day" BETWEEN 1 AND 31 AND "hospital_billing_rules"."payment_window_end_day" BETWEEN 1 AND 31 AND "hospital_billing_rules"."payment_window_start_day" <= "hospital_billing_rules"."payment_window_end_day")
      )),
	CONSTRAINT "hospital_billing_rules_valid_range_ck" CHECK("hospital_billing_rules"."valid_to" IS NULL OR "hospital_billing_rules"."valid_to" >= "hospital_billing_rules"."valid_from")
);
--> statement-breakpoint
CREATE INDEX `hospital_billing_rules_hospital_id_idx` ON `hospital_billing_rules` (`hospital_id`);--> statement-breakpoint
CREATE INDEX `hospital_billing_rules_valid_from_idx` ON `hospital_billing_rules` (`hospital_id`,`valid_from`);--> statement-breakpoint
CREATE TABLE `hospital_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`hospital_id` text NOT NULL,
	`valid_from` text NOT NULL,
	`valid_to` text,
	`billing_mode` text NOT NULL,
	`shift_value` text,
	`hourly_rate` text,
	`patient_rate` text,
	`currency_code` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "hospital_rates_valid_range_ck" CHECK("hospital_rates"."valid_to" IS NULL OR "hospital_rates"."valid_to" >= "hospital_rates"."valid_from")
);
--> statement-breakpoint
CREATE INDEX `hospital_rates_hospital_id_idx` ON `hospital_rates` (`hospital_id`);--> statement-breakpoint
CREATE INDEX `hospital_rates_valid_from_idx` ON `hospital_rates` (`hospital_id`,`valid_from`);--> statement-breakpoint
CREATE TABLE `hospitals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`hospital_id` text NOT NULL,
	`applied_billing_rule_id` text,
	`status` text NOT NULL,
	`invoice_period_start` text NOT NULL,
	`invoice_period_end` text NOT NULL,
	`subtotal_amount` text NOT NULL,
	`adjustments_amount` text DEFAULT '0' NOT NULL,
	`total_amount` text NOT NULL,
	`currency_code` text NOT NULL,
	`estimated_payment_date` text NOT NULL,
	`estimated_payment_date_overridden` integer DEFAULT false NOT NULL,
	`deadline_date` text NOT NULL,
	`presented_at` text,
	`notes` text,
	`rate_snapshot_json` text NOT NULL,
	`billing_rule_snapshot_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`applied_billing_rule_id`) REFERENCES `hospital_billing_rules`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "invoices_period_range_ck" CHECK("invoices"."invoice_period_end" >= "invoices"."invoice_period_start")
);
--> statement-breakpoint
CREATE INDEX `invoices_hospital_id_idx` ON `invoices` (`hospital_id`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `invoices_period_idx` ON `invoices` (`hospital_id`,`invoice_period_start`,`invoice_period_end`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`status` text NOT NULL,
	`paid_amount` text,
	`paid_at` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_invoice_id_uidx` ON `payments` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`);