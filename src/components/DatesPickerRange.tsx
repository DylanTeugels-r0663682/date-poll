"use client";

import { todayIso } from "@/lib/dates";

type Props = {
  start: string;
  end: string;
  onChange: (next: { start: string; end: string }) => void;
};

export function DatesPickerRange({ start, end, onChange }: Props) {
  const today = todayIso();
  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Start date</span>
          <input
            type="date"
            required
            min={today}
            value={start}
            onChange={(e) => onChange({ start: e.target.value, end })}
            className="h-11 rounded-md border border-border bg-bg-card px-3 text-sm shadow-sm transition focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">End date</span>
          <input
            type="date"
            required
            min={start || today}
            value={end}
            onChange={(e) => onChange({ start, end: e.target.value })}
            className="h-11 rounded-md border border-border bg-bg-card px-3 text-sm shadow-sm transition focus:border-accent"
          />
        </label>
      </div>
      <p className="mt-3 text-xs text-muted">
        Respondents will see every day between these two dates. Max range: 61 days.
      </p>
    </div>
  );
}
