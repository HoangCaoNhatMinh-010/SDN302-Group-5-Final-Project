import { HttpError } from "./errors";

export function requireString(value: unknown, label: string, maxLength = 500): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.trim().length > maxLength) {
    throw new HttpError(400, `${label} không hợp lệ.`, "VALIDATION_ERROR");
  }
  return value.trim();
}

export function requirePhone(value: unknown): string {
  const phone = requireString(value, "Số điện thoại", 20);
  if (!/^\+?[0-9]{8,15}$/.test(phone)) {
    throw new HttpError(400, "Số điện thoại cần có từ 8 đến 15 chữ số.", "VALIDATION_ERROR");
  }
  return phone;
}

export function requirePositiveNumber(value: unknown, label: string, minimum = 0): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum) {
    throw new HttpError(400, `${label} không hợp lệ.`, "VALIDATION_ERROR");
  }
  return number;
}
