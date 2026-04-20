"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createEvent } from "@/app/actions/events";
import { DatesPickerCandidates } from "./DatesPickerCandidates";
import { DatesPickerRange } from "./DatesPickerRange";

type Tab = "candidates" | "range";

export function CreateEventForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("candidates");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [candidateDates, setCandidateDates] = useState<string[]>([]);
  const [range, setRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload =
      tab === "candidates"
        ? {
            type: "candidates" as const,
            title,
            description,
            creator_name: creatorName,
            candidate_dates: candidateDates,
          }
        : {
            type: "range" as const,
            title,
            description,
            creator_name: creatorName,
            range_start: range.start,
            range_end: range.end,
          };

    startTransition(async () => {
      const res = await createEvent(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const params = new URLSearchParams({
        slug: res.slug,
        token: res.admin_token,
      });
      router.push(`/new/success?${params.toString()}`);
    });
  }

  const canSubmit =
    title.trim().length > 0 &&
    !pending &&
    (tab === "candidates"
      ? candidateDates.length > 0
      : range.start && range.end);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Event title
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={120}
          placeholder="Friday board game night"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-bg-card px-3 text-base shadow-sm transition focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-muted font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={2000}
          placeholder="A few words about the event, location, dress code…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-border bg-bg-card px-3 py-2 text-base shadow-sm transition focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="creator-name" className="text-sm font-medium">
          Your name <span className="text-muted font-normal">(optional, shown on the event)</span>
        </label>
        <input
          id="creator-name"
          type="text"
          maxLength={60}
          placeholder="Dylan"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-bg-card px-3 text-base shadow-sm transition focus:border-accent"
        />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Dates</div>
        <div className="inline-flex rounded-lg border border-border bg-bg-muted p-1 text-sm">
          <TabButton active={tab === "candidates"} onClick={() => setTab("candidates")}>
            Specific dates
          </TabButton>
          <TabButton active={tab === "range"} onClick={() => setTab("range")}>
            Date range
          </TabButton>
        </div>
        {tab === "candidates" ? (
          <DatesPickerCandidates
            value={candidateDates}
            onChange={setCandidateDates}
          />
        ) : (
          <DatesPickerRange
            start={range.start}
            end={range.end}
            onChange={setRange}
          />
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create event"}
        </button>
      </div>
    </form>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md px-4 py-1.5 text-sm font-medium transition",
        active
          ? "bg-bg-card text-foreground shadow-sm"
          : "text-muted hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
