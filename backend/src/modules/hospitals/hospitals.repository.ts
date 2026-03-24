import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { hospitals } from "../../db/schema/index.js";

export type HospitalRecord = typeof hospitals.$inferSelect;
type NewHospitalRecord = typeof hospitals.$inferInsert;

export class HospitalsRepository {
  public async findAll(): Promise<HospitalRecord[]> {
    return db.select().from(hospitals).orderBy(asc(hospitals.name));
  }

  public async findById(id: string): Promise<HospitalRecord | undefined> {
    const [hospital] = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, id))
      .limit(1);

    return hospital;
  }

  public async create(data: NewHospitalRecord): Promise<HospitalRecord> {
    const [hospital] = await db.insert(hospitals).values(data).returning();
    return hospital;
  }

  public async update(
    id: string,
    data: Partial<NewHospitalRecord>,
  ): Promise<HospitalRecord | undefined> {
    const [hospital] = await db
      .update(hospitals)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(hospitals.id, id))
      .returning();

    return hospital;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await db.delete(hospitals).where(eq(hospitals.id, id));
    return Number(result.rowsAffected ?? 0) > 0;
  }
}

