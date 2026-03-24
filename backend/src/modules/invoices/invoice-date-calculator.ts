import { AppError } from "../../app/errors/app-error.js";
import {
  addToIsoDate,
  getLastBusinessDayOfMonth,
  getLastBusinessDayOfWeek,
  getSameOrPreviousBusinessDay,
  setIsoDateDay,
} from "../../shared/utils/date.js";
import type { HospitalBillingRuleRecord } from "../hospital-billing-rules/hospital-billing-rules.repository.js";

export type InvoiceDateCalculation = {
  estimatedPaymentDate: string;
  deadlineDate: string;
};

export class InvoiceDateCalculator {
  public calculate(input: {
    invoicePeriodStart: string;
    invoicePeriodEnd: string;
    billingRule: HospitalBillingRuleRecord;
  }): InvoiceDateCalculation {
    const basisDate =
      input.billingRule.paymentDateBasis === "invoice_period_start"
        ? input.invoicePeriodStart
        : input.invoicePeriodEnd;

    let estimatedPaymentDate = addToIsoDate(
      basisDate,
      input.billingRule.paymentDelayUnit,
      input.billingRule.paymentDelayValue,
    );

    if (
      input.billingRule.paymentWindowStartDay !== null &&
      input.billingRule.paymentWindowStartDay !== undefined
    ) {
      estimatedPaymentDate = setIsoDateDay(
        estimatedPaymentDate,
        input.billingRule.paymentWindowStartDay,
      );
    } else if (
      input.billingRule.paymentBusinessDayPolicy === "last_business_day"
    ) {
      estimatedPaymentDate = this.resolveLastBusinessDay(
        estimatedPaymentDate,
        input.billingRule.paymentDelayUnit,
      );
    }

    const directionMultiplier =
      input.billingRule.deadlineOffsetDirection === "before" ? -1 : 1;

    if (
      input.billingRule.deadlineOffsetDirection !== "before" &&
      input.billingRule.deadlineOffsetDirection !== "after" &&
      input.billingRule.deadlineOffsetDirection !== "same_day"
    ) {
      throw new AppError("Unsupported deadlineOffsetDirection.", 400);
    }

    const deadlineDate =
      input.billingRule.deadlineOffsetDirection === "same_day"
        ? estimatedPaymentDate
        : addToIsoDate(
            estimatedPaymentDate,
            input.billingRule.deadlineOffsetUnit,
            input.billingRule.deadlineOffsetValue * directionMultiplier,
          );

    return {
      estimatedPaymentDate,
      deadlineDate,
    };
  }

  private resolveLastBusinessDay(isoDate: string, unit: string): string {
    if (unit === "week") {
      return getLastBusinessDayOfWeek(isoDate);
    }

    if (unit === "month") {
      return getLastBusinessDayOfMonth(isoDate);
    }

    return getSameOrPreviousBusinessDay(isoDate);
  }
}
