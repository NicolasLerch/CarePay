import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { invoices, payments } from "../../db/schema/index.js";

export type PaymentRecord = typeof payments.$inferSelect;
type NewPaymentRecord = typeof payments.$inferInsert;

type PaymentFilters = {
  invoiceId?: string;
  hospitalId?: string;
  status?: string;
};

export class PaymentsRepository {
  public async findAll(filters: PaymentFilters): Promise<PaymentRecord[]> {
    const conditions = [];

    if (filters.invoiceId) {
      conditions.push(eq(payments.invoiceId, filters.invoiceId));
    }

    if (filters.hospitalId) {
      conditions.push(eq(invoices.hospitalId, filters.hospitalId));
    }

    if (filters.status) {
      conditions.push(eq(payments.status, filters.status));
    }

    const rows = await db
      .select({ payment: payments })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(payments.createdAt), asc(payments.id));

    return rows.map((row) => row.payment);
  }

  public async findById(paymentId: string): Promise<PaymentRecord | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    return payment;
  }

  public async findByInvoiceId(
    invoiceId: string,
  ): Promise<PaymentRecord | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .limit(1);

    return payment;
  }

  public async create(data: NewPaymentRecord): Promise<PaymentRecord> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  public async update(
    paymentId: string,
    data: Partial<NewPaymentRecord>,
  ): Promise<PaymentRecord | undefined> {
    const [payment] = await db
      .update(payments)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    return payment;
  }
}

