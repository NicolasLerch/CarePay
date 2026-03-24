import { describe, expect, it } from "vitest";

import {
  addToIsoDate,
  getLastBusinessDayOfMonth,
  getPreviousIsoDate,
  setIsoDateDay,
} from "../../../shared/utils/date.js";

describe("date utils", () => {
  it("gets the previous ISO date", () => {
    expect(getPreviousIsoDate("2026-03-01")).toBe("2026-02-28");
  });

  it("adds weeks and days to an ISO date", () => {
    expect(addToIsoDate("2026-03-01", "day", 5)).toBe("2026-03-06");
    expect(addToIsoDate("2026-03-01", "week", 3)).toBe("2026-03-22");
  });

  it("adds months by returning the last day of the target month", () => {
    expect(addToIsoDate("2026-03-31", "month", 1)).toBe("2026-04-30");
  });

  it("returns the last business day of a month", () => {
    expect(getLastBusinessDayOfMonth("2026-03-10")).toBe("2026-03-31");
    expect(getLastBusinessDayOfMonth("2026-05-10")).toBe("2026-05-29");
  });

  it("bounds a day to the last day of the month", () => {
    expect(setIsoDateDay("2026-04-30", 10)).toBe("2026-04-10");
    expect(setIsoDateDay("2026-04-30", 31)).toBe("2026-04-30");
  });
});

