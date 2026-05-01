import { randomUUID } from "node:crypto";

import { AppError } from "../../app/errors/app-error.js";
import {
  amountSourceSchema,
  entryInputTypeSchema,
} from "../../shared/domain/enums.js";
import { HospitalsService } from "../hospitals/hospitals.service.js";

import type {
  CalculateEntryAmountInput,
  CreateEntryInput,
  ListEntriesQuery,
  UpdateEntryInput,
} from "./entries.schemas.js";
import { EntryAmountCalculator } from "./entry-amount-calculator.js";
import { EntriesRepository } from "./entries.repository.js";

export class EntriesService {
  public constructor(
    private readonly entriesRepository = new EntriesRepository(),
    private readonly hospitalsService = new HospitalsService(),
    private readonly entryAmountCalculator = new EntryAmountCalculator(),
  ) {}

  public async list(query: ListEntriesQuery) {
    return this.entriesRepository.findAll(query);
  }

  public async getById(entryId: string) {
    const entry = await this.entriesRepository.findById(entryId);

    if (!entry) {
      throw new AppError("Entry not found.", 404);
    }

    return entry;
  }

  public async calculateAmount(input: CalculateEntryAmountInput) {
    await this.hospitalsService.getById(input.hospitalId);
    return this.entryAmountCalculator.calculate(input);
  }

  public async create(input: CreateEntryInput) {
    await this.hospitalsService.getById(input.hospitalId);
    this.ensureDateRange(input.entryStartDate, input.entryEndDate);

    const resolved = await this.calculateAmount({
      hospitalId: input.hospitalId,
      entryStartDate: input.entryStartDate,
      inputType: input.inputType,
      hoursWorked: input.hoursWorked,
      patientsAttended: input.patientsAttended,
      amountSource: input.amountSource,
      finalAmount: input.finalAmount,
    });

    return this.entriesRepository.create({
      id: randomUUID(),
      hospitalId: input.hospitalId,
      invoiceId: input.invoiceId ?? null,
      entryStartDate: input.entryStartDate,
      entryEndDate: input.entryEndDate,
      inputType: input.inputType,
      hoursWorked: input.hoursWorked ?? null,
      patientsAttended: input.patientsAttended ?? null,
      amountSource: input.amountSource,
      calculatedAmount: resolved.calculatedAmount,
      finalAmount: resolved.finalAmount,
      appliedRateId: resolved.appliedRateId,
      notes: input.notes ?? null,
    });
  }

  public async update(entryId: string, input: UpdateEntryInput) {
    const currentEntry = await this.getById(entryId);

    const nextHospitalId = input.hospitalId ?? currentEntry.hospitalId;
    await this.hospitalsService.getById(nextHospitalId);

    const nextEntryStartDate = input.entryStartDate ?? currentEntry.entryStartDate;
    const nextEntryEndDate = input.entryEndDate ?? currentEntry.entryEndDate;
    this.ensureDateRange(nextEntryStartDate, nextEntryEndDate);

    const nextInputType =
      input.inputType ?? this.parseStoredInputType(currentEntry.inputType);
    const nextHoursWorked =
      input.hoursWorked !== undefined ? input.hoursWorked : currentEntry.hoursWorked ?? undefined;
    const nextPatientsAttended =
      input.patientsAttended !== undefined
        ? input.patientsAttended
        : currentEntry.patientsAttended ?? undefined;
    const nextAmountSource =
      input.amountSource ?? this.parseStoredAmountSource(currentEntry.amountSource);
    const nextFinalAmount =
      input.finalAmount !== undefined ? input.finalAmount : currentEntry.finalAmount;

    const resolved = await this.calculateAmount({
      hospitalId: nextHospitalId,
      entryStartDate: nextEntryStartDate,
      inputType: nextInputType,
      hoursWorked: nextHoursWorked,
      patientsAttended: nextPatientsAttended,
      amountSource: nextAmountSource,
      finalAmount: nextFinalAmount,
    });

    const entry = await this.entriesRepository.update(entryId, {
      hospitalId: nextHospitalId,
      invoiceId: input.invoiceId !== undefined ? input.invoiceId ?? null : currentEntry.invoiceId,
      entryStartDate: nextEntryStartDate,
      entryEndDate: nextEntryEndDate,
      inputType: nextInputType,
      hoursWorked: nextHoursWorked ?? null,
      patientsAttended: nextPatientsAttended ?? null,
      amountSource: nextAmountSource,
      calculatedAmount: resolved.calculatedAmount,
      finalAmount: resolved.finalAmount,
      appliedRateId: resolved.appliedRateId,
      notes: input.notes !== undefined ? input.notes ?? null : currentEntry.notes,
    });

    if (!entry) {
      throw new AppError("Entry not found.", 404);
    }

    return entry;
  }

  public async delete(entryId: string) {
    const deleted = await this.entriesRepository.delete(entryId);

    if (!deleted) {
      throw new AppError("Entry not found.", 404);
    }
  }

  private ensureDateRange(entryStartDate: string, entryEndDate: string) {
    if (entryEndDate < entryStartDate) {
      throw new AppError("entryEndDate must be on or after entryStartDate.", 400);
    }
  }

  private parseStoredInputType(inputType: string) {
    const parsedInputType = entryInputTypeSchema.safeParse(inputType);

    if (!parsedInputType.success) {
      throw new AppError(
        "Stored entry has an invalid inputType.",
        500,
        "INVALID_STORED_ENTRY_INPUT_TYPE",
        { inputType },
      );
    }

    return parsedInputType.data;
  }

  private parseStoredAmountSource(amountSource: string) {
    const parsedAmountSource = amountSourceSchema.safeParse(amountSource);

    if (!parsedAmountSource.success) {
      throw new AppError(
        "Stored entry has an invalid amountSource.",
        500,
        "INVALID_STORED_ENTRY_AMOUNT_SOURCE",
        { amountSource },
      );
    }

    return parsedAmountSource.data;
  }
}
