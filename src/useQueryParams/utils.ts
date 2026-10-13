const NUMBER_PATTERN = /^-?(0|[1-9]\d*)(\.\d+)?$/;

const toNumber = (value: string) => {
  if (!NUMBER_PATTERN.test(value)) return undefined;

  const number = Number(value);

  // Integers beyond 2^53 lose precision (e.g. long ids), keep them as strings
  if (Number.isInteger(number) && !Number.isSafeInteger(number)) return undefined;

  return number;
};

export const castValue = <T>(value: string) => {
  if (value === "true") return true as T;
  if (value === "false") return false as T;
  if (value === "null") return null as T;
  if (value === "undefined" || value === "") return undefined as T;

  const number = toNumber(value);
  if (number !== undefined) return number as T;

  if (value.startsWith("{") || value.startsWith("[")) {
    try {
      return JSON.parse(value) as T;
    } catch {
      // Not valid JSON, fall through to the raw string
    }
  }

  return value as T;
};

export const serializeValue = (value: unknown) =>
  typeof value === "object" ? JSON.stringify(value) : String(value);
