import { inArray } from "drizzle-orm";

import { db } from "../index.js";
import {
  entries,
  hospitalBillingRules,
  hospitalRates,
  hospitals,
} from "../schema/index.js";

const seedIds = {
  sanatorioMayoHospital: "11111111-1111-4111-8111-111111111111",
  sanatorioMayoBillingRule: "11111111-1111-4111-8111-111111111112",
  sanatorioMayoRate: "11111111-1111-4111-8111-111111111113",
  sanatorioMayoEntryWeekOne: "11111111-1111-4111-8111-111111111114",
  sanatorioMayoEntryWeekTwo: "11111111-1111-4111-8111-111111111115",
  velezHospital: "22222222-2222-4222-8222-222222222221",
  velezBillingRule: "22222222-2222-4222-8222-222222222222",
  velezRate: "22222222-2222-4222-8222-222222222223",
  velezEntryOne: "22222222-2222-4222-8222-222222222224",
  velezEntryTwo: "22222222-2222-4222-8222-222222222225",
} as const;

const legacySeedIds = {
  hospitals: [
    "seed-hospital-sanatorio-mayo",
    "seed-hospital-velez-sarsfield",
  ],
  billingRules: [
    "seed-billing-rule-sanatorio-mayo-2026-01-01",
    "seed-billing-rule-velez-sarsfield-2026-01-01",
  ],
  rates: [
    "seed-rate-sanatorio-mayo-2026-01-01",
    "seed-rate-velez-sarsfield-2026-01-01",
  ],
  entries: [
    "seed-entry-sanatorio-mayo-2026-02-23",
    "seed-entry-sanatorio-mayo-2026-03-02",
    "seed-entry-velez-sarsfield-2026-03-02",
    "seed-entry-velez-sarsfield-2026-03-07",
  ],
} as const;

async function cleanupLegacySeedData(): Promise<void> {
  await db.delete(entries).where(inArray(entries.id, legacySeedIds.entries));
  await db
    .delete(hospitalBillingRules)
    .where(inArray(hospitalBillingRules.id, legacySeedIds.billingRules));
  await db
    .delete(hospitalRates)
    .where(inArray(hospitalRates.id, legacySeedIds.rates));
  await db
    .delete(hospitals)
    .where(inArray(hospitals.id, legacySeedIds.hospitals));
}

async function seedHospitals(): Promise<void> {
  await db
    .insert(hospitals)
    .values([
      {
        id: seedIds.sanatorioMayoHospital,
        name: "Sanatorio Mayo",
        description: "Seed de desarrollo para flujo semanal por horas.",
      },
      {
        id: seedIds.velezHospital,
        name: "Velez Sarsfield",
        description: "Seed de desarrollo para flujo mensual por paciente.",
      },
    ])
    .onConflictDoNothing();
}

async function seedBillingRules(): Promise<void> {
  await db
    .insert(hospitalBillingRules)
    .values([
      {
        id: seedIds.sanatorioMayoBillingRule,
        hospitalId: seedIds.sanatorioMayoHospital,
        validFrom: "2026-01-01",
        billingFrequencyUnit: "week",
        billingFrequencyInterval: 1,
        invoiceIssueAnchor: "period_end",
        paymentDelayUnit: "week",
        paymentDelayValue: 3,
        paymentDateBasis: "invoice_period_end",
        paymentBusinessDayPolicy: "last_business_day",
        deadlineOffsetUnit: "day",
        deadlineOffsetValue: 1,
        deadlineOffsetDirection: "before",
      },
      {
        id: seedIds.velezBillingRule,
        hospitalId: seedIds.velezHospital,
        validFrom: "2026-01-01",
        billingFrequencyUnit: "month",
        billingFrequencyInterval: 1,
        invoiceIssueAnchor: "period_end",
        paymentDelayUnit: "month",
        paymentDelayValue: 1,
        paymentDateBasis: "invoice_period_end",
        paymentBusinessDayPolicy: "window",
        paymentWindowStartDay: 10,
        paymentWindowEndDay: 20,
        deadlineOffsetUnit: "day",
        deadlineOffsetValue: 0,
        deadlineOffsetDirection: "same_day",
      },
    ])
    .onConflictDoNothing();
}

async function seedRates(): Promise<void> {
  await db
    .insert(hospitalRates)
    .values([
      {
        id: seedIds.sanatorioMayoRate,
        hospitalId: seedIds.sanatorioMayoHospital,
        validFrom: "2026-01-01",
        billingMode: "per_hour_from_shift",
        shiftValue: "270000",
        hourlyRate: "11250",
        currencyCode: "ARS",
        notes: "Valor por guardia de 24h.",
      },
      {
        id: seedIds.velezRate,
        hospitalId: seedIds.velezHospital,
        validFrom: "2026-01-01",
        billingMode: "per_patient",
        patientRate: "10000",
        currencyCode: "ARS",
        notes: "Valor de ejemplo por paciente para desarrollo.",
      },
    ])
    .onConflictDoNothing();
}

async function seedEntries(): Promise<void> {
  await db
    .insert(entries)
    .values([
      {
        id: seedIds.sanatorioMayoEntryWeekOne,
        hospitalId: seedIds.sanatorioMayoHospital,
        entryStartDate: "2026-02-23T00:00:00.000Z",
        entryEndDate: "2026-03-01T23:59:59.999Z",
        inputType: "hours",
        hoursWorked: "44",
        amountSource: "calculated",
        calculatedAmount: "495000",
        finalAmount: "495000",
        appliedRateId: seedIds.sanatorioMayoRate,
        notes: "Entry seed semanal 44 horas.",
      },
      {
        id: seedIds.sanatorioMayoEntryWeekTwo,
        hospitalId: seedIds.sanatorioMayoHospital,
        entryStartDate: "2026-03-02T00:00:00.000Z",
        entryEndDate: "2026-03-08T23:59:59.999Z",
        inputType: "hours",
        hoursWorked: "36",
        amountSource: "calculated",
        calculatedAmount: "405000",
        finalAmount: "405000",
        appliedRateId: seedIds.sanatorioMayoRate,
        notes: "Entry seed semanal 36 horas.",
      },
      {
        id: seedIds.velezEntryOne,
        hospitalId: seedIds.velezHospital,
        entryStartDate: "2026-03-02T00:00:00.000Z",
        entryEndDate: "2026-03-02T23:59:59.999Z",
        inputType: "patients",
        patientsAttended: 20,
        amountSource: "calculated",
        calculatedAmount: "200000",
        finalAmount: "200000",
        appliedRateId: seedIds.velezRate,
        notes: "Entry seed mensual 20 pacientes.",
      },
      {
        id: seedIds.velezEntryTwo,
        hospitalId: seedIds.velezHospital,
        entryStartDate: "2026-03-07T00:00:00.000Z",
        entryEndDate: "2026-03-07T23:59:59.999Z",
        inputType: "patients",
        patientsAttended: 25,
        amountSource: "calculated",
        calculatedAmount: "250000",
        finalAmount: "250000",
        appliedRateId: seedIds.velezRate,
        notes: "Entry seed mensual 25 pacientes.",
      },
    ])
    .onConflictDoNothing();
}

async function main(): Promise<void> {
  await cleanupLegacySeedData();
  await seedHospitals();
  await seedBillingRules();
  await seedRates();
  await seedEntries();

  console.log("Seed aplicado correctamente.");
}

main().catch((error) => {
  console.error("Error aplicando seed.", error);
  process.exit(1);
});
