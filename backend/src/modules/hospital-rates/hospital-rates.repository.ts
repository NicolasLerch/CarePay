import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";

import { db } from "../../db/index.js";
import { hospitalRates } from "../../db/schema/index.js";

export type HospitalRateRecord = typeof hospitalRates.$inferSelect;
type NewHospitalRateRecord = typeof hospitalRates.$inferInsert;

export class HospitalRatesRepository {
  public async findAllByHospital(hospitalId: string): Promise<HospitalRateRecord[]> {
    return db
      .select()
      .from(hospitalRates)
      .where(eq(hospitalRates.hospitalId, hospitalId))
      .orderBy(asc(hospitalRates.validFrom));
  }

  public async findById(
    hospitalId: string,
    rateId: string,
  ): Promise<HospitalRateRecord | undefined> {
    const [rate] = await db
      .select()
      .from(hospitalRates)
      .where(
        and(
          eq(hospitalRates.hospitalId, hospitalId),
          eq(hospitalRates.id, rateId),
        ),
      )
      .limit(1);

    return rate;
  }

  public async findLatestByHospital(
    hospitalId: string,
  ): Promise<HospitalRateRecord | undefined> {
    const [rate] = await db
      .select()
      .from(hospitalRates)
      .where(eq(hospitalRates.hospitalId, hospitalId))
      .orderBy(desc(hospitalRates.validFrom))
      .limit(1);

    return rate;
  }

  public async findApplicableByDate(
    hospitalId: string,
    isoDate: string,
  ): Promise<HospitalRateRecord | undefined> {
    const [rate] = await db
      .select()
      .from(hospitalRates)
      .where(
        and(
          eq(hospitalRates.hospitalId, hospitalId),
          lte(hospitalRates.validFrom, isoDate),
          or(isNull(hospitalRates.validTo), gte(hospitalRates.validTo, isoDate)),
        ),
      )
      .orderBy(desc(hospitalRates.validFrom))
      .limit(1);

    return rate;
  }

  public async create(data: NewHospitalRateRecord): Promise<HospitalRateRecord> {
    const [rate] = await db.insert(hospitalRates).values(data).returning();
    return rate;
  }

  public async update(
    hospitalId: string,
    rateId: string,
    data: Partial<NewHospitalRateRecord>,
  ): Promise<HospitalRateRecord | undefined> {
    const [rate] = await db
      .update(hospitalRates)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(hospitalRates.hospitalId, hospitalId),
          eq(hospitalRates.id, rateId),
        ),
      )
      .returning();

    return rate;
  }

  public async delete(hospitalId: string, rateId: string): Promise<boolean> {
    const result = await db
      .delete(hospitalRates)
      .where(
        and(
          eq(hospitalRates.hospitalId, hospitalId),
          eq(hospitalRates.id, rateId),
        ),
      );

    return Number(result.rowsAffected ?? 0) > 0;
  }
}
