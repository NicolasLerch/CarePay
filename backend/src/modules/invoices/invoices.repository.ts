import { and, asc, eq, gte, inArray, lt, lte } from "drizzle-orm";

import { db } from "../../db/index.js";
import { invoices } from "../../db/schema/index.js";

export type InvoiceRecord = typeof invoices.$inferSelect;
type NewInvoiceRecord = typeof invoices.$inferInsert;

type InvoiceFilters = {
  hospitalId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export class InvoicesRepository {
  public async findAll(filters: InvoiceFilters): Promise<InvoiceRecord[]> {
    const conditions = [];

    if (filters.hospitalId) {
      conditions.push(eq(invoices.hospitalId, filters.hospitalId));
    }

    if (filters.status) {
      conditions.push(eq(invoices.status, filters.status));
    }

    if (filters.dateFrom) {
      conditions.push(gte(invoices.invoicePeriodStart, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(invoices.invoicePeriodEnd, filters.dateTo));
    }

    return db
      .select()
      .from(invoices)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(invoices.invoicePeriodStart), asc(invoices.id));
  }

  public async findById(id: string): Promise<InvoiceRecord | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    return invoice;
  }

  public async create(data: NewInvoiceRecord): Promise<InvoiceRecord> {
    const [invoice] = await db.insert(invoices).values(data).returning();
    return invoice;
  }

  public async updateStatus(
    invoiceId: string,
    input: {
      status: string;
      presentedAt?: string | null;
      notes?: string | null;
    },
  ): Promise<InvoiceRecord | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set({
        status: input.status,
        presentedAt: input.presentedAt,
        notes: input.notes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return invoice;
  }

  public async findPendingExpiredByDate(
    isoDate: string,
    hospitalId?: string,
  ): Promise<InvoiceRecord[]> {
    const conditions = [
      eq(invoices.status, "pending"),
      lt(invoices.deadlineDate, isoDate),
    ];

    if (hospitalId) {
      conditions.push(eq(invoices.hospitalId, hospitalId));
    }

    return db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(asc(invoices.deadlineDate), asc(invoices.id));
  }

  public async markExpiredByIds(invoiceIds: string[]): Promise<void> {
    if (invoiceIds.length === 0) {
      return;
    }

    await db
      .update(invoices)
      .set({
        status: "expired",
        updatedAt: new Date().toISOString(),
      })
      .where(inArray(invoices.id, invoiceIds));
  }
}
