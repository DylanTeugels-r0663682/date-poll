import {
  daysBetweenIso,
  isIsoDate,
  uniqueSortedIso,
} from "./dates";
import type { CreateEventInput } from "./types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function normalizeOptionalString(v: unknown, maxLen: number): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLen) {
    throw new ValidationError(`Value exceeds max length of ${maxLen}`);
  }
  return trimmed;
}

export function normalizeRequiredString(
  v: unknown,
  label: string,
  minLen: number,
  maxLen: number
): string {
  if (typeof v !== "string") {
    throw new ValidationError(`${label} is required`);
  }
  const trimmed = v.trim();
  if (trimmed.length < minLen) {
    throw new ValidationError(`${label} is required`);
  }
  if (trimmed.length > maxLen) {
    throw new ValidationError(`${label} is too long (max ${maxLen} characters)`);
  }
  return trimmed;
}

export function normalizeIsoDateList(v: unknown): string[] {
  if (!Array.isArray(v)) {
    throw new ValidationError("Dates must be a list");
  }
  const cleaned: string[] = [];
  for (const item of v) {
    if (!isIsoDate(item)) {
      throw new ValidationError(`Invalid date: ${String(item)}`);
    }
    cleaned.push(item);
  }
  return uniqueSortedIso(cleaned);
}

export function validateCreateEventInput(raw: unknown): CreateEventInput {
  if (!raw || typeof raw !== "object") {
    throw new ValidationError("Invalid input");
  }
  const obj = raw as Record<string, unknown>;

  const title = normalizeRequiredString(obj.title, "Title", 1, 120);
  const description = normalizeOptionalString(obj.description, 2000) ?? undefined;
  const creator_name = normalizeOptionalString(obj.creator_name, 60) ?? undefined;

  if (obj.type === "candidates") {
    const dates = normalizeIsoDateList(obj.candidate_dates);
    if (dates.length < 1) {
      throw new ValidationError("Pick at least one date");
    }
    if (dates.length > 31) {
      throw new ValidationError("Too many dates (max 31)");
    }
    return {
      type: "candidates",
      title,
      description,
      creator_name,
      candidate_dates: dates,
    };
  }

  if (obj.type === "range") {
    if (!isIsoDate(obj.range_start)) {
      throw new ValidationError("Invalid start date");
    }
    if (!isIsoDate(obj.range_end)) {
      throw new ValidationError("Invalid end date");
    }
    const rs = obj.range_start as string;
    const re = obj.range_end as string;
    const span = daysBetweenIso(rs, re);
    if (span < 0) {
      throw new ValidationError("End date must be on or after start date");
    }
    if (span > 92) {
      throw new ValidationError("Range too long (max 3 months)");
    }
    return {
      type: "range",
      title,
      description,
      creator_name,
      range_start: rs,
      range_end: re,
    };
  }

  throw new ValidationError("Unknown event type");
}

export function normalizeRespondentName(v: unknown): string {
  return normalizeRequiredString(v, "Your name", 1, 40);
}
