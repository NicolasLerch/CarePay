import { randomUUID } from "node:crypto";

import { AppError } from "../../app/errors/app-error.js";

import type {
  CreateHospitalInput,
  UpdateHospitalInput,
} from "./hospitals.schemas.js";
import { HospitalsRepository } from "./hospitals.repository.js";

export class HospitalsService {
  public constructor(
    private readonly hospitalsRepository = new HospitalsRepository(),
  ) {}

  public async list() {
    return this.hospitalsRepository.findAll();
  }

  public async getById(id: string) {
    const hospital = await this.hospitalsRepository.findById(id);

    if (!hospital) {
      throw new AppError("Hospital not found.", 404);
    }

    return hospital;
  }

  public async create(input: CreateHospitalInput) {
    return this.hospitalsRepository.create({
      id: randomUUID(),
      name: input.name,
      description: input.description ?? null,
      isActive: input.isActive ?? true,
    });
  }

  public async update(id: string, input: UpdateHospitalInput) {
    await this.getById(id);

    const hospital = await this.hospitalsRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description ?? null }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    if (!hospital) {
      throw new AppError("Hospital not found.", 404);
    }

    return hospital;
  }

  public async delete(id: string) {
    const deleted = await this.hospitalsRepository.delete(id);

    if (!deleted) {
      throw new AppError("Hospital not found.", 404);
    }
  }
}

