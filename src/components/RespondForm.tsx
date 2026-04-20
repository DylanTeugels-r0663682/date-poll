"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitResponse } from "@/app/actions/events";
import { formatDateLong, weekdayShort } from "@/lib/dates";
import type { ResponseRecord } from "@/lib/types";

type Props = {
  slug: string;
  eventDates: string[];
  responses: Pick<ResponseRecord, "respondent_name" | "cannot_attend_dates">[];
};

export function RespondForm({ slug, eventDates, responses }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [cannotAttend, setCannotAttend] = useState<Set<string>>(new Set());
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const existingByName = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const r of responses) {
      map.set(r.respondent_name.trim().toLowerCase(), r.cannot_attend_dates);
    }
    return map;
  }, [responses]);

  const matchedExisting = useMemo(() => {
    const key = name.trim().toLowerCase();
    if (!key) return null;
    return existingByName.get(key) ?? null;
  }, [name, existingByName]);

  function onNameChange(v: string) {
    setName(v);
    if (!touched) {
      const key = v.trim().toLowerCase();
      const existing = existingByName.get(key);
      if (existing) setCannotAttend(new Set(existing));
      else setCannotAttend(new Set());
    }
    setSuccess(false);
  }

  function toggleDate(iso: string) {
    setTouched(true);
    setSuccess(false);
    setCannotAttend((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await submitResponse(slug, {
        name,
        cannot_attend_dates: Array.from(cannotAttend),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setTouched(false);
      router.refresh();
    });
  }

  const canSubmit = name.trim().length > 0 && !pending;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="respondent-name" className="text-sm font-medium">
          Your name
        </label>
        <input
          id="respondent-name"
          type="text"
          required
          maxLength={40}
          placeholder="e.g. Alice"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-bg-card px-3 text-base shadow-sm transition focus:border-accent"
        />
        {matchedExisting ? (
          <p className="text-xs text-accent">
            Editing your existing response. Saving will overwrite it.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">
          Tap the dates you <span className="text-danger">can&rsquo;t</span> attend
        </div>
        <div className="flex flex-wrap gap-2">
          {eventDates.map((iso) => {
            const blocked = cannotAttend.has(iso);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => toggleDate(iso)}
                aria-pressed={blocked}
                className={[
                  "rounded-lg border px-3 py-2 text-sm transition",
                  blocked
                    ? "border-danger bg-danger-soft text-danger line-through"
                    : "border-border bg-bg-card hover:bg-bg-hover",
                ].join(" ")}
                title={formatDateLong(iso)}
              >
                <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">
                  {weekdayShort(iso)}
                </span>
                <span className="block font-medium">
                  {shortLabel(iso)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted">
          Leave a date un-toggled if you can make it.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          className="rounded-md border border-success-soft bg-success-soft px-4 py-3 text-sm text-success"
        >
          Response saved. Thanks!
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 items-center rounded-md bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save my availability"}
        </button>
      </div>
    </form>
  );
}

function shortLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: new Date().getUTCFullYear() === y ? undefined : "numeric",
    timeZone: "UTC",
  }).format(dt);
}
