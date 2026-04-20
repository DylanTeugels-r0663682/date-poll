import Link from "next/link";
import { notFound } from "next/navigation";
import { ShellHeader } from "@/components/ShellHeader";
import { ResultsGrid } from "@/components/ResultsGrid";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { deleteEventAction } from "@/app/actions/events";
import { createAdminClient } from "@/lib/supabase/admin";
import { eventDates } from "@/lib/event-helpers";
import { tokensMatch } from "@/lib/slug";
import type { EventRecord, ResponseRecord } from "@/lib/types";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ token?: string }>;

export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { token } = await searchParams;
  if (!token) notFound();

  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<EventRecord>();
  if (!event) notFound();
  if (!tokensMatch(event.admin_token, token)) notFound();

  const { data: responsesRaw } = await supabase
    .from("responses")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });
  const responses = (responsesRaw as ResponseRecord[] | null) ?? [];

  const dates = eventDates(event);

  return (
    <main className="min-h-dvh">
      <ShellHeader />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-lg border border-warn/40 bg-warn/5 px-4 py-3 text-sm">
          <span className="font-semibold text-warn">Admin view.</span>{" "}
          <span className="text-foreground/80">
            You can delete responses or this event. The link is secret — don&rsquo;t share it.
          </span>
        </div>

        <div className="mt-6 border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          {event.creator_name ? (
            <p className="mt-1 text-sm text-muted">
              Created by {event.creator_name}
            </p>
          ) : null}
          {event.description ? (
            <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/80">
              {event.description}
            </p>
          ) : null}
          <div className="mt-4">
            <Link
              href={`/e/${slug}`}
              className="inline-flex h-9 items-center rounded-md border border-border bg-bg-card px-3 text-xs font-medium transition hover:bg-bg-hover"
            >
              Open public page ↗
            </Link>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Responses</h2>
          <p className="mt-1 text-sm text-muted">
            {responses.length === 0
              ? "No responses yet."
              : `${responses.length} ${responses.length === 1 ? "response" : "responses"}.`}
          </p>
          <div className="mt-4">
            <ResultsGrid
              slug={event.slug}
              adminToken={token}
              eventDates={dates}
              responses={responses}
            />
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-danger/30 bg-danger-soft/40 p-6">
          <h2 className="text-base font-semibold text-danger">Danger zone</h2>
          <p className="mt-1 text-sm text-danger/90">
            Deleting the event removes all responses. This can&rsquo;t be undone.
          </p>
          <form action={deleteEventAction} className="mt-4">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="token" value={token} />
            <ConfirmSubmitButton
              confirmText={`Delete "${event.title}" and all its responses? This cannot be undone.`}
              className="inline-flex h-10 items-center rounded-md bg-danger px-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Delete event
            </ConfirmSubmitButton>
          </form>
        </section>
      </div>
    </main>
  );
}
