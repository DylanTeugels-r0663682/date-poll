import { deleteResponseAction } from "@/app/actions/events";
import { formatDateLong, weekdayShort } from "@/lib/dates";
import { computeDateStats } from "@/lib/event-helpers";
import type { ResponseRecord } from "@/lib/types";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

type Props = {
  slug: string;
  adminToken?: string;
  eventDates: string[];
  responses: ResponseRecord[];
};

export function ResultsGrid({ slug, adminToken, eventDates, responses }: Props) {
  const stats = computeDateStats(eventDates, responses);
  const total = responses.length;

  if (total === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-bg-muted px-6 py-10 text-center">
        <p className="text-sm text-muted">
          No responses yet. Be the first to chime in.
        </p>
      </div>
    );
  }

  const bestDates = stats.filter((s) => s.isBest).map((s) => s.date);

  return (
    <div className="space-y-6">
      {bestDates.length > 0 ? (
        <div className="rounded-lg border border-success/30 bg-success-soft px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-success">
            <svg
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>
              Best {bestDates.length === 1 ? "date" : "dates"}:{" "}
              {bestDates.map(formatDateLong).join(", ")}
            </span>
          </div>
          <div className="mt-1 text-xs text-success/80">
            {stats.find((s) => s.isBest)!.canAttend} of {total} can make it.
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border bg-bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-muted">
              <th className="sticky left-0 bg-bg-muted px-3 py-2 text-left font-semibold">
                Who
              </th>
              {stats.map((s) => (
                <th
                  key={s.date}
                  className={[
                    "px-3 py-2 text-center font-semibold",
                    s.isBest ? "bg-success-soft text-success" : "",
                  ].join(" ")}
                  title={formatDateLong(s.date)}
                >
                  <div className="text-[11px] uppercase tracking-wide text-muted">
                    {weekdayShort(s.date)}
                  </div>
                  <div>{shortLabel(s.date)}</div>
                  {s.isBest ? (
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider" aria-hidden>
                      Best
                    </div>
                  ) : null}
                </th>
              ))}
              {adminToken ? <th className="px-3 py-2" /> : null}
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => {
              const blocked = new Set(r.cannot_attend_dates);
              return (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="sticky left-0 bg-bg-card px-3 py-2 font-medium">
                    {r.respondent_name}
                  </td>
                  {stats.map((s) => {
                    const cannot = blocked.has(s.date);
                    return (
                      <td
                        key={s.date}
                        className={[
                          "px-3 py-2 text-center",
                          s.isBest ? "bg-success-soft/60" : "",
                        ].join(" ")}
                      >
                        {cannot ? (
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-danger-soft text-danger"
                            aria-label="Cannot attend"
                          >
                            ✗
                          </span>
                        ) : (
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success-soft text-success"
                            aria-label="Can attend"
                          >
                            ✓
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {adminToken ? (
                    <td className="px-3 py-2 text-right">
                      <form action={deleteResponseAction}>
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="token" value={adminToken} />
                        <input type="hidden" name="response_id" value={r.id} />
                        <ConfirmSubmitButton
                          confirmText={`Delete ${r.respondent_name}'s response?`}
                          className="rounded-md border border-border px-2 py-1 text-xs text-muted transition hover:border-danger hover:text-danger"
                        >
                          Remove
                        </ConfirmSubmitButton>
                      </form>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-bg-muted">
              <td className="sticky left-0 bg-bg-muted px-3 py-2 text-xs uppercase tracking-wide text-muted">
                Can attend
              </td>
              {stats.map((s) => (
                <td
                  key={s.date}
                  className={[
                    "px-3 py-2 text-center text-sm",
                    s.isBest ? "bg-success-soft font-semibold text-success" : "text-muted",
                  ].join(" ")}
                >
                  {s.canAttend}/{total}
                </td>
              ))}
              {adminToken ? <td /> : null}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function shortLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(dt);
}
