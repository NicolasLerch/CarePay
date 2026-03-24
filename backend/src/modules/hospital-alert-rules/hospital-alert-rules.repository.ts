import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";

import { db } from "../../db/index.js";
import { hospitalAlertRules } from "../../db/schema/index.js";

export type HospitalAlertRuleRecord = typeof hospitalAlertRules.$inferSelect;
type NewHospitalAlertRuleRecord = typeof hospitalAlertRules.$inferInsert;

export class HospitalAlertRulesRepository {
  public async findAllByHospital(
    hospitalId: string,
  ): Promise<HospitalAlertRuleRecord[]> {
    return db
      .select()
      .from(hospitalAlertRules)
      .where(eq(hospitalAlertRules.hospitalId, hospitalId))
      .orderBy(asc(hospitalAlertRules.validFrom));
  }

  public async findById(
    hospitalId: string,
    alertRuleId: string,
  ): Promise<HospitalAlertRuleRecord | undefined> {
    const [alertRule] = await db
      .select()
      .from(hospitalAlertRules)
      .where(
        and(
          eq(hospitalAlertRules.hospitalId, hospitalId),
          eq(hospitalAlertRules.id, alertRuleId),
        ),
      )
      .limit(1);

    return alertRule;
  }

  public async findLatestByHospital(
    hospitalId: string,
  ): Promise<HospitalAlertRuleRecord | undefined> {
    const [alertRule] = await db
      .select()
      .from(hospitalAlertRules)
      .where(eq(hospitalAlertRules.hospitalId, hospitalId))
      .orderBy(desc(hospitalAlertRules.validFrom))
      .limit(1);

    return alertRule;
  }

  public async findApplicableByDate(
    hospitalId: string,
    isoDate: string,
  ): Promise<HospitalAlertRuleRecord[]> {
    return db
      .select()
      .from(hospitalAlertRules)
      .where(
        and(
          eq(hospitalAlertRules.hospitalId, hospitalId),
          eq(hospitalAlertRules.isActive, true),
          lte(hospitalAlertRules.validFrom, isoDate),
          or(
            isNull(hospitalAlertRules.validTo),
            gte(hospitalAlertRules.validTo, isoDate),
          ),
        ),
      )
      .orderBy(asc(hospitalAlertRules.validFrom), asc(hospitalAlertRules.id));
  }

  public async create(
    data: NewHospitalAlertRuleRecord,
  ): Promise<HospitalAlertRuleRecord> {
    const [alertRule] = await db
      .insert(hospitalAlertRules)
      .values(data)
      .returning();

    return alertRule;
  }

  public async update(
    hospitalId: string,
    alertRuleId: string,
    data: Partial<NewHospitalAlertRuleRecord>,
  ): Promise<HospitalAlertRuleRecord | undefined> {
    const [alertRule] = await db
      .update(hospitalAlertRules)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(hospitalAlertRules.hospitalId, hospitalId),
          eq(hospitalAlertRules.id, alertRuleId),
        ),
      )
      .returning();

    return alertRule;
  }

  public async delete(hospitalId: string, alertRuleId: string): Promise<boolean> {
    const result = await db
      .delete(hospitalAlertRules)
      .where(
        and(
          eq(hospitalAlertRules.hospitalId, hospitalId),
          eq(hospitalAlertRules.id, alertRuleId),
        ),
      );

    return Number(result.rowsAffected ?? 0) > 0;
  }
}

