import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { alerts } from "../../db/schema/index.js";

export type AlertRecord = typeof alerts.$inferSelect;
type NewAlertRecord = typeof alerts.$inferInsert;

type AlertFilters = {
  hospitalId?: string;
  invoiceId?: string;
  paymentId?: string;
  status?: string;
  alertType?: string;
};

export class AlertsRepository {
  public async findAll(filters: AlertFilters): Promise<AlertRecord[]> {
    const conditions = [];

    if (filters.hospitalId) {
      conditions.push(eq(alerts.hospitalId, filters.hospitalId));
    }

    if (filters.invoiceId) {
      conditions.push(eq(alerts.invoiceId, filters.invoiceId));
    }

    if (filters.paymentId) {
      conditions.push(eq(alerts.paymentId, filters.paymentId));
    }

    if (filters.status) {
      conditions.push(eq(alerts.status, filters.status));
    }

    if (filters.alertType) {
      conditions.push(eq(alerts.alertType, filters.alertType));
    }

    return db
      .select()
      .from(alerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(alerts.scheduledFor), asc(alerts.id));
  }

  public async findById(alertId: string): Promise<AlertRecord | undefined> {
    const [alert] = await db
      .select()
      .from(alerts)
      .where(eq(alerts.id, alertId))
      .limit(1);

    return alert;
  }

  public async findExisting(input: {
    hospitalAlertRuleId: string | null;
    invoiceId: string | null;
    paymentId: string | null;
    scheduledFor: string;
    alertType: string;
  }): Promise<AlertRecord | undefined> {
    const conditions = [
      eq(alerts.scheduledFor, input.scheduledFor),
      eq(alerts.alertType, input.alertType),
    ];

    if (input.hospitalAlertRuleId) {
      conditions.push(eq(alerts.hospitalAlertRuleId, input.hospitalAlertRuleId));
    }

    if (input.invoiceId) {
      conditions.push(eq(alerts.invoiceId, input.invoiceId));
    }

    if (input.paymentId) {
      conditions.push(eq(alerts.paymentId, input.paymentId));
    }

    const [alert] = await db
      .select()
      .from(alerts)
      .where(and(...conditions))
      .limit(1);

    return alert;
  }

  public async create(data: NewAlertRecord): Promise<AlertRecord> {
    const [alert] = await db.insert(alerts).values(data).returning();
    return alert;
  }

  public async updateStatus(
    alertId: string,
    status: string,
  ): Promise<AlertRecord | undefined> {
    const [alert] = await db
      .update(alerts)
      .set({
        status,
        updatedAt: new Date().toISOString(),
        triggeredAt: status === "triggered" ? new Date().toISOString() : null,
      })
      .where(eq(alerts.id, alertId))
      .returning();

    return alert;
  }

  public async dismissByInvoiceId(invoiceId: string): Promise<void> {
    await db
      .update(alerts)
      .set({
        status: "dismissed",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(alerts.invoiceId, invoiceId));
  }
}
