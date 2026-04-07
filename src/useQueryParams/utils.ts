export const castValue = <T>(value: string) => {
  if (value === "true") return true as T;
  if (value === "false") return false as T;
  if (value === "null") return null as T;
  if (value === "undefined" || value === "") return undefined as T;
  if (!isNaN(Number(value))) return Number(value) as T;
  try {
    return JSON.parse(value) as T;
  } catch (e) {}
  return value as T;
};
