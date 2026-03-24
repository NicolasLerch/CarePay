export function getPreviousIsoDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().slice(0, 10);
}

export function addToIsoDate(
  isoDate: string,
  unit: string,
  value: number,
): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);

  if (unit === "day") {
    date.setUTCDate(date.getUTCDate() + value);
    return toIsoDate(date);
  }

  if (unit === "week") {
    date.setUTCDate(date.getUTCDate() + value * 7);
    return toIsoDate(date);
  }

  if (unit === "month") {
    const targetMonth = date.getUTCMonth() + value;
    date.setUTCMonth(targetMonth + 1, 0);
    return toIsoDate(date);
  }

  throw new Error(`Unsupported date unit: ${unit}`);
}

export function getLastBusinessDayOfMonth(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  );

  while (lastDay.getUTCDay() === 0 || lastDay.getUTCDay() === 6) {
    lastDay.setUTCDate(lastDay.getUTCDate() - 1);
  }

  return toIsoDate(lastDay);
}

export function getLastBusinessDayOfWeek(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const dayOfWeek = date.getUTCDay();
  const distanceToFriday =
    dayOfWeek === 0 ? -2 : dayOfWeek === 6 ? -1 : 5 - dayOfWeek;

  date.setUTCDate(date.getUTCDate() + distanceToFriday);

  return toIsoDate(date);
}

export function getSameOrPreviousBusinessDay(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);

  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date.setUTCDate(date.getUTCDate() - 1);
  }

  return toIsoDate(date);
}

export function setIsoDateDay(isoDate: string, day: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const boundedDay = Math.min(day, lastDayOfMonth);

  return toIsoDate(new Date(Date.UTC(year, month, boundedDay)));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
