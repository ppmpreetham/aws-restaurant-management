import { HttpError } from '../errors';

export function requireString(value: unknown, field: string, maxLength = 255): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required`);
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new HttpError(400, `${field} must be ${maxLength} characters or fewer`);
  }

  return normalized;
}

export function optionalString(value: unknown, field: string, maxLength = 1000): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return requireString(value, field, maxLength);
}

export function positiveInteger(value: unknown, field: string): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new HttpError(400, `${field} must be a positive integer`);
  }
  return n;
}

export function optionalPositiveInteger(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return positiveInteger(value, field);
}

export function normalizeDate(value: unknown, field: string): string {
  const raw = requireString(value, field, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new HttpError(400, `${field} must be in YYYY-MM-DD format`);
  }

  const date = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) {
    throw new HttpError(400, `${field} must be a valid calendar date`);
  }

  return raw;
}

export function normalizeTime(value: unknown, field: string): string {
  const raw = requireString(value, field, 8);
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(raw);
  if (!match) {
    throw new HttpError(400, `${field} must be in HH:MM or HH:MM:SS format`);
  }

  return `${match[1]}:${match[2]}:${match[3] ?? '00'}`;
}

export function validateEmail(value: unknown): string {
  const email = requireString(value, 'customerEmail', 255).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'customerEmail must be a valid email address');
  }
  return email;
}

export function assertSlotOrder(slotStart: string, slotEnd: string): void {
  if (slotEnd <= slotStart) {
    throw new HttpError(400, 'slotEnd must be after slotStart');
  }
}
