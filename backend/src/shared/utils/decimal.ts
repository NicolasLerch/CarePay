export function multiplyDecimalStrings(
  left: string,
  right: string,
  fractionDigits = 2,
): string {
  const result = Number(left) * Number(right);

  if (!Number.isFinite(result)) {
    throw new Error("Invalid decimal multiplication.");
  }

  return trimTrailingZeros(result.toFixed(fractionDigits));
}

export function normalizeDecimalString(
  value: string,
  fractionDigits = 2,
): string {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Invalid decimal value.");
  }

  return trimTrailingZeros(parsed.toFixed(fractionDigits));
}

function trimTrailingZeros(value: string): string {
  if (!value.includes(".")) {
    return value;
  }

  return value.replace(/\.?0+$/, "");
}

