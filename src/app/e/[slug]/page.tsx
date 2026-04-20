import { notFound } from "next/navigation";
import { ShellHeader } from "@/components/ShellHeader";
import { RespondForm } from "@/components/RespondForm";
import { ResultsGrid } from "@/components/ResultsGrid";
import { createAdminClient } from "@/lib/supabase/admin";
import { eventDates } from "@/lib/event-helpers";
import type { EventRecord, ResponseRecord } from "@/lib/types";

type Params = Promise<{ slug: string }>;

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { event, responses } = await loadEvent(slug);
  if (!event) notFound();

  const dates = eventDates(event);

  return (
    <main className="min-h-dvh">
      <ShellHeader />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="border-b border-border pb-6">
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
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Your availability</h2>
          <p className="mt-1 text-sm text-muted">
            Type your name and tap the dates you can&rsquo;t attend.
          </p>
          <div className="mt-4">
            <RespondForm
              slug={event.slug}
              eventDates={dates}
              responses={responses}
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Results</h2>
          <p className="mt-1 text-sm text-muted">
            {responses.length === 0
              ? "Nobody has answered yet."
              : `${responses.length} ${responses.length === 1 ? "person has" : "people have"} answered.`}
          </p>
          <div className="mt-4">
            <ResultsGrid
              slug={event.slug}
              eventDates={dates}
              responses={responses}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

async function loadEvent(
  slug: string
): Promise<{ event: EventRecord | null; responses: ResponseRecord[] }> {
  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<EventRecord>();
  if (!event) return { event: null, responses: [] };

  const { data: responses } = await supabase
    .from("responses")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  return { event, responses: (responses as ResponseRecord[] | null) ?? [] };
}
