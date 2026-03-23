## Product Overview (v1)
This is currently a personal app. It allows the user to track expected income and avoid missing billing deadlines. The goal is to ensure that invoices for services are issued on time in order to receive payment, and to avoid forgetting them. To achieve this, the system keeps a record of invoices and their statuses, based on the institution and services provided.


## Main Entities

- Hospital: defines billing and payment rules for an institution, including payment method, invoice timing, and rates per type of work. Billing rules defines how a Hospital pays (e.g., per hour or per patient).

- valid_from: defines the start date of a period during which a specific rule (such as price per shift or per patient) is valid.

- valid_to: defines the end date of that period.

- Invoice: represents the final amount to be billed for work done, based on related Entries. A Hospital can have many invoices, but each Invoice belongs to one Hospital.  
  It includes states such as: pending, presented, expired.  
  It also defines an estimated payment date and may include alerts.  
  An Invoice aggregates multiple Entries (hours/patients), including their individual amounts and total sum.
  invoice_period_start and invoice_period_end: define the period over which the invoice should be calculated, and should include and summarize the Entries present on those dates.

- Payment: represents the actual payment of an Invoice. It has a one-to-one relationship with an Invoice.  
  States: pending, paid.  
  Its status depends on the estimated payment date defined in the Invoice.

- Entry: the core entity representing work performed.  
  It belongs to one Hospital and can be associated with one Invoice (many Entries to one Invoice).  
  An Entry can include:
  * Hospital
  * Inputs (e.g., number of patients or hours worked)
  * Amount (automatically calculated based on Hospital rules and inputs, or manually set)
  * entry_start_date and entry_end_date: defines the time when work was done, and can by a day (===) or a period (!==).

  Many Entries can belong to a single Invoice.


- If you think it is necessary, you may suggest other entities, but do not add them without my permission.

## Scope (v1)

### Hospital Management
- Create, read, update, and delete Hospitals.
- Configure billing method:
  - per patient
  - per shift / per hour  
    (if shift-based, the total shift value is divided by 24 to calculate hourly rate)
- Configure billing frequency (e.g., weekly, biweekly, triweekly, monthly, etc), defining when invoices should be issued.
- Configure payment delay, defining when the Hospital is expected to pay (e.g., same week, +2 weeks, +1 month), relative to the invoice_period_start and invoice_period_end.

### Invoices
- View all invoices, with filters by date, hospital, or state.
- Select an Invoice
- Define invoice amount based on Entries. Generate suggested invoices based on related Entries.
- Allow the user to review, accept, or modify the suggested invoice before saving it.
- Define inovice period (date or date range).
- Configure optional reminders:
  - before invoice deadline
  - after deadline (expired)
- Estimated payment date is calculated based on Hospital rules, but can be manually adjusted.
- Allow manual inclusion or exclusion of Entries before finalizing an invoice.

### Entries
- View all Entries, with filters by date, hospital.
- Select an Entry.
- Create, update, or delete work entries.
- Define entry_start_date and entry_end_date
- Define input:
  - number of patients
  - hours worked
  - custom amount
- Automatically calculate amount based on Hospital rules (with option to override).
- Add notes, observations, or reminders.


### Alerts
- Optional notifications:
  - Pending invoice (before deadline)
  - Expired invoice (after deadline)
  - Pending payment
  - Payment due today
- Notifications should include the work period if available.


## Out of Scope

- No integrations with external platforms (Google, Facebook, etc.)
- No integration with banks or financial institutions
- No authentication or login system
- No multi-user support
- No web version
- No data export (PDF, CSV, etc.)



## Business Rules

### Invoice Generation
- Invoices are suggested based on Entries.
- A suggested invoice must aggregate all Entries within a given `invoice_period_start` and `invoice_period_end` for a specific Hospital.
- Entries must be individually selectable and removable before finalizing the Invoice.
- The suggested invoice can be manually edited by the user before being saved.
- Invoice suggestions should follow the billing frequency defined in each Hospital.
  - Example: if billing frequency is weekly, an invoice suggestion should be generated every Sunday based on the previous period.
- If a new Entry is created within the period of an existing Invoice for the same Hospital, the user must be prompted to choose:
  - add the Entry to the existing Invoice
  - or create a new separate Invoice

### Amount Calculation
- Shift-based payments:
  - The user defines a total value for a 24-hour shift at the Hospital level.
  - Hourly rate is calculated as `shift_value / 24`.
  - Entry amount = `hours_worked * hourly_rate`.

- Patient-based payments:
  - The user defines a price per patient at the Hospital level.
  - Entry amount = `patients_attended * price_per_patient`.

- Custom amount:
  - The user can override the calculated amount and define a custom value for any Entry.

### Payment Estimation
- Estimated payment date is defined by Hospital rules.
- It is calculated relative to `invoice_period_end`.
- It can be defined in days, weeks, or months after the period.
- By default, the estimated payment date should fall on the last business day of the corresponding period.
- The estimated payment date can be manually overridden at the Invoice level.

### Invoice Deadlines
- Invoice deadline rules must be defined at the Hospital level.
- Deadlines can be defined relative to the estimated payment date (before or after).
  - Example: 2 days before estimated payment date.
- An invoice is considered "pending" if it has not been marked as completed (done = false).
- An invoice is considered "expired" if the deadline date has passed and the invoice is still pending.

### Alerts
- Alerts are optional and configured per Hospital.
- Multiple alerts can be defined for each Invoice.
- Alerts can be defined in days, weeks, or months relative to key dates.
- Types of alerts:
  - Warning alert:
    - Triggered before the invoice deadline.
    - Applies when invoice status is "pending".
    - Must include the deadline date.
  - Expired alert:
    - Triggered when the deadline has passed.
    - Must include the estimated payment date.
  - Payment alerts:
    - Triggered for pending payment or payment due date.

### Historical Values
- When Hospital rates change, the user must define a `valid_from` date.
- Previous rates must remain unchanged for historical Entries.
- Prices must be applied according to `valid_from` and `valid_to`.
- `valid_to` is optional and can be null.
- When a new rate is created:
  - The previous rate's `valid_to` should be automatically set to the day before the new `valid_from`.


## Database Rules
- Use Turso as the database.
- Use TypeScript in the backend.
- Use Drizzle ORM with libSQL client.
- Keep schema normalized.
- Do not hardcode enum-like business values in code if they belong to hospital configuration.
- Generate migrations for every schema change.
- Propose schema first before applying migrations.
- Preserve historical rates using valid_from and valid_to.


## Development Rules

Use:
- Node.js
- TypeScript
- Express o Fastify
- Turso
- Drizzle ORM

- This is a single-repository application. The root structure should be:

  - backend/
  - frontend/
    - mobile-app/
    - web/

- The web version must not be developed in v1.

- The same backend must be used for both mobile and web clients.

- All business logic must be implemented in the backend.
- Business logic must be centralized and reusable. Avoid duplicating logic across different parts of the system.
- All dates must be handled using a consistent format (e.g., ISO 8601).
- The frontend must only handle UI and user interaction, and must not contain business logic.
- No rules or values should be hardcoded. All logic must be driven by configurable data (e.g., Hospital settings).
- The agent may suggest new rules or features, but must not implement them without explicit user approval.
- The user interface must be in Spanish.