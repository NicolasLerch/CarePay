import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";

import { db } from "../../db/index.js";
import { hospitalBillingRules } from "../../db/schema/index.js";

export type HospitalBillingRuleRecord = typeof hospitalBillingRules.$inferSelect;
type NewHospitalBillingRuleRecord = typeof hospitalBillingRules.$inferInsert;

export class HospitalBillingRulesRepository {
  public async findAllByHospital(
    hospitalId: string,
  ): Promise<HospitalBillingRuleRecord[]> {
    return db
      .select()
      .from(hospitalBillingRules)
      .where(eq(hospitalBillingRules.hospitalId, hospitalId))
      .orderBy(asc(hospitalBillingRules.validFrom));
  }

  public async findById(
    hospitalId: string,
    billingRuleId: string,
  ): Promise<HospitalBillingRuleRecord | undefined> {
    const [billingRule] = await db
      .select()
      .from(hospitalBillingRules)
      .where(
        and(
          eq(hospitalBillingRules.hospitalId, hospitalId),
          eq(hospitalBillingRules.id, billingRuleId),
        ),
      )
      .limit(1);

    return billingRule;
  }

  public async findLatestByHospital(
    hospitalId: string,
  ): Promise<HospitalBillingRuleRecord | undefined> {
    const [billingRule] = await db
      .select()
      .from(hospitalBillingRules)
      .where(eq(hospitalBillingRules.hospitalId, hospitalId))
      .orderBy(desc(hospitalBillingRules.validFrom))
      .limit(1);

    return billingRule;
  }

  public async findApplicableByDate(
    hospitalId: string,
    isoDate: string,
  ): Promise<HospitalBillingRuleRecord | undefined> {
    const [billingRule] = await db
      .select()
      .from(hospitalBillingRules)
      .where(
        and(
          eq(hospitalBillingRules.hospitalId, hospitalId),
          lte(hospitalBillingRules.validFrom, isoDate),
          or(
            isNull(hospitalBillingRules.validTo),
            gte(hospitalBillingRules.validTo, isoDate),
          ),
        ),
      )
      .orderBy(desc(hospitalBillingRules.validFrom))
      .limit(1);

    return billingRule;
  }

  public async create(
    data: NewHospitalBillingRuleRecord,
  ): Promise<HospitalBillingRuleRecord> {
    const [billingRule] = await db
      .insert(hospitalBillingRules)
      .values(data)
      .returning();

    return billingRule;
  }

  public async update(
    hospitalId: string,
    billingRuleId: string,
    data: Partial<NewHospitalBillingRuleRecord>,
  ): Promise<HospitalBillingRuleRecord | undefined> {
    const [billingRule] = await db
      .update(hospitalBillingRules)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(hospitalBillingRules.hospitalId, hospitalId),
          eq(hospitalBillingRules.id, billingRuleId),
        ),
      )
      .returning();

    return billingRule;
  }

  public async delete(hospitalId: string, billingRuleId: string): Promise<boolean> {
    const result = await db
      .delete(hospitalBillingRules)
      .where(
        and(
          eq(hospitalBillingRules.hospitalId, hospitalId),
          eq(hospitalBillingRules.id, billingRuleId),
        ),
      );

    return Number(result.rowsAffected ?? 0) > 0;
  }
}
