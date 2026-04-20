import { enumerateRange } from "./dates";
import type { EventRecord, ResponseRecord } from "./types";

export function eventDates(event: Pick<EventRecord, "type" | "candidate_dates" | "range_start" | "range_end">): string[] {
  if (event.type === "candidates") {
    return event.candidate_dates ?? [];
  }
  if (event.range_start && event.range_end) {
    return enumerateRange(event.range_start, event.range_end);
  }
  return [];
}

export type DateStats = {
  date: string;
  canAttend: number;
  cannotAttend: number;
  isBest: boolean;
};

export function computeDateStats(
  dates: string[],
  responses: ResponseRecord[]
): DateStats[] {
  const total = responses.length;
  const stats = dates.map((date) => {
    const cannot = responses.reduce(
      (n, r) => n + (r.cannot_attend_dates.includes(date) ? 1 : 0),
      0
    );
    return {
      date,
      canAttend: total - cannot,
      cannotAttend: cannot,
      isBest: false,
    };
  });

  if (total === 0) return stats;

  const maxCanAttend = Math.max(...stats.map((s) => s.canAttend));
  if (maxCanAttend === 0) return stats;
  for (const s of stats) {
    if (s.canAttend === maxCanAttend) s.isBest = true;
  }
  return stats;
}
