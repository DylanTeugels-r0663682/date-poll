"use client";

import { useMemo, useState } from "react";
import { todayIso, weekdayShort } from "@/lib/dates";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  maxCount?: number;
};

export function DatesPickerCandidates({ value, onChange, maxCount = 31 }: Props) {
  const today = todayIso();
  const [cursor, setCursor] = useState<{ y: number; m: number }>(() => {
    const [y, m] = today.split("-").map(Number);
    return { y, m };
  });

  const monthLabel = useMemo(() => {
    const dt = new Date(Date.UTC(cursor.y, cursor.m - 1, 1));
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(dt);
  }, [cursor]);

  const grid = useMemo(() => buildMonthGrid(cursor.y, cursor.m), [cursor]);

  const selected = useMemo(() => new Set(value), [value]);

  function toggle(iso: string) {
    if (iso < today) return;
    if (selected.has(iso)) {
      onChange(value.filter((d) => d !== iso));
    } else {
      if (value.length >= maxCount) return;
      onChange([...value, iso].sort());
    }
  }

  function shiftMonth(delta: number) {
    let y = cursor.y;
    let m = cursor.m + delta;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    setCursor({ y, m });
  }

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:bg-bg-hover"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-sm font-semibold">{monthLabel}</div>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:bg-bg-hover"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {grid.map((cell, i) => {
          if (!cell) return <div key={i} aria-hidden />;
          const isPast = cell.iso < today;
          const isSelected = selected.has(cell.iso);
          const capped = !isSelected && value.length >= maxCount;
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={isPast || capped}
              onClick={() => toggle(cell.iso)}
              title={
                isPast
                  ? "Past dates can't be selected"
                  : capped
                  ? `Max ${maxCount} dates`
                  : cell.iso
              }
              className={[
                "flex h-10 items-center justify-center rounded-md text-sm transition",
                isSelected
                  ? "bg-accent text-white shadow-sm"
                  : isPast
                  ? "text-muted-soft line-through"
                  : capped
                  ? "text-muted-soft"
                  : "text-foreground hover:bg-bg-hover",
              ].join(" ")}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted">
          {value.length} of {maxCount} selected
        </span>
        {value.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-muted transition hover:text-foreground"
          >
            Clear
          </button>
        ) : null}
      </div>

      {value.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((iso) => (
            <button
              key={iso}
              type="button"
              onClick={() => toggle(iso)}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent transition hover:bg-accent/10"
              aria-label={`Remove ${iso}`}
            >
              <span>
                {weekdayShort(iso)}, {iso}
              </span>
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type Cell = { iso: string; day: number } | null;

function buildMonthGrid(year: number, month: number): Cell[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstDow = (first.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  const cells: Cell[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    cells.push({ iso: `${year}-${mm}-${dd}`, day: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
