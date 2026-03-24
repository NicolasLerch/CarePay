import { Router } from "express";

import {
  calculateEntryAmount,
  createEntry,
  deleteEntry,
  getEntry,
  listHospitalEntries,
  listEntries,
  updateEntry,
} from "./entries.handlers.js";

export const entriesRouter = Router();

entriesRouter.post("/calculate", calculateEntryAmount);
entriesRouter.get("/", listEntries);
entriesRouter.get("/:entryId", getEntry);
entriesRouter.post("/", createEntry);
entriesRouter.patch("/:entryId", updateEntry);
entriesRouter.delete("/:entryId", deleteEntry);

export const hospitalEntriesRouter = Router({ mergeParams: true });

hospitalEntriesRouter.get("/", listHospitalEntries);
