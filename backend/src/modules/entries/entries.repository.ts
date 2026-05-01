import { and, asc, eq, gte, inArray, isNull, lte } from "drizzle-orm";

import { db } from "../../db/index.js";
import { entries } from "../../db/schema/index.js";

export type EntryRecord = typeof entries.$inferSelect;
type NewEntryRecord = typeof entries.$inferInsert;

type EntryFilters = {
  hospitalId?: string;
  entryDateFrom?: string;
  entryDateTo?: string;
};

export class EntriesRepository {
  public async findAll(filters: EntryFilters): Promise<EntryRecord[]> {
    const conditions = [];

    if (filters.hospitalId) {
      conditions.push(eq(entries.hospitalId, filters.hospitalId));
    }

    if (filters.entryDateFrom) {
      conditions.push(gte(entries.entryStartDate, filters.entryDateFrom));
    }

    if (filters.entryDateTo) {
      conditions.push(lte(entries.entryEndDate, filters.entryDateTo));
    }

    return db
      .select()
      .from(entries)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(entries.entryStartDate), asc(entries.id));
  }

  public async findById(id: string): Promise<EntryRecord | undefined> {
    const [entry] = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
    return entry;
  }

  public async findUnbilledByHospitalAndPeriod(input: {
    hospitalId: string;
    periodStart: string;
    periodEnd: string;
  }): Promise<EntryRecord[]> {
    return db
      .select()
      .from(entries)
      .where(
        and(
          eq(entries.hospitalId, input.hospitalId),
          isNull(entries.invoiceId),
          gte(entries.entryStartDate, `${input.periodStart}T00:00:00.000Z`),
          lte(entries.entryEndDate, `${input.periodEnd}T23:59:59.999Z`),
        ),
      )
      .orderBy(asc(entries.entryStartDate), asc(entries.id));
  }

  public async assignInvoice(entryIds: string[], invoiceId: string): Promise<void> {
    if (entryIds.length === 0) {
      return;
    }

    await db
      .update(entries)
      .set({
        invoiceId,
        updatedAt: new Date().toISOString(),
      })
      .where(inArray(entries.id, entryIds));
  }

  public async create(data: NewEntryRecord): Promise<EntryRecord> {
    const [entry] = await db.insert(entries).values(data).returning();
    return entry;
  }

  public async update(
    id: string,
    data: Partial<NewEntryRecord>,
  ): Promise<EntryRecord | undefined> {
    const [entry] = await db
      .update(entries)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(entries.id, id))
      .returning();

    return entry;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await db.delete(entries).where(eq(entries.id, id));
    return Number(result.rowsAffected ?? 0) > 0;
  }
}
