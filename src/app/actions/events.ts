"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAdminToken, generateSlug, tokensMatch } from "@/lib/slug";
import {
  ValidationError,
  normalizeIsoDateList,
  normalizeRespondentName,
  validateCreateEventInput,
} from "@/lib/validate";
import { eventDates } from "@/lib/event-helpers";
import type { CreateEventInput, EventRecord } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createEvent(
  input: CreateEventInput
): Promise<{ ok: true; slug: string; admin_token: string } | { ok: false; error: string }> {
  let validated: CreateEventInput;
  try {
    validated = validateCreateEventInput(input);
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, error: err.message };
    throw err;
  }

  const supabase = createAdminClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    const admin_token = generateAdminToken();

    const row = {
      slug,
      admin_token,
      title: validated.title,
      description: validated.description ?? null,
      creator_name: validated.creator_name ?? null,
      type: validated.type,
      candidate_dates:
        validated.type === "candidates" ? validated.candidate_dates : null,
      range_start: validated.type === "range" ? validated.range_start : null,
      range_end: validated.type === "range" ? validated.range_end : null,
    };

    const { error } = await supabase.from("events").insert(row);
    if (!error) return { ok: true, slug, admin_token };
    if (error.code === "23505") continue; // slug collision, regenerate
    return { ok: false, error: error.message };
  }

  return { ok: false, error: "Could not generate a unique link. Try again." };
}

export async function submitResponse(
  slug: string,
  input: { name: string; cannot_attend_dates: unknown }
): Promise<ActionResult> {
  if (typeof slug !== "string" || slug.length === 0) {
    return { ok: false, error: "Missing event reference" };
  }

  let respondentName: string;
  let dates: string[];
  try {
    respondentName = normalizeRespondentName(input.name);
    dates = normalizeIsoDateList(input.cannot_attend_dates ?? []);
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, error: err.message };
    throw err;
  }

  const supabase = createAdminClient();

  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<EventRecord>();
  if (eventErr) return { ok: false, error: eventErr.message };
  if (!event) return { ok: false, error: "Event not found" };

  const allowed = new Set(eventDates(event));
  const filtered = dates.filter((d) => allowed.has(d));

  const { error: upsertErr } = await supabase
    .from("responses")
    .upsert(
      {
        event_id: event.id,
        respondent_name: respondentName,
        respondent_key: respondentName.toLowerCase(),
        cannot_attend_dates: filtered,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id,respondent_key" }
    );

  if (upsertErr) return { ok: false, error: upsertErr.message };

  revalidatePath(`/e/${slug}`);
  revalidatePath(`/e/${slug}/admin`);
  return { ok: true };
}

async function loadEventWithToken(
  slug: string,
  token: string
): Promise<EventRecord | null> {
  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<EventRecord>();
  if (!event) return null;
  if (!tokensMatch(event.admin_token, token)) return null;
  return event;
}

export async function deleteResponseAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const token = String(formData.get("token") ?? "");
  const responseId = String(formData.get("response_id") ?? "");
  if (!slug || !token || !responseId) return;

  const event = await loadEventWithToken(slug, token);
  if (!event) return;

  const supabase = createAdminClient();
  await supabase
    .from("responses")
    .delete()
    .eq("id", responseId)
    .eq("event_id", event.id);

  revalidatePath(`/e/${slug}`);
  revalidatePath(`/e/${slug}/admin`);
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const token = String(formData.get("token") ?? "");
  if (!slug || !token) return;

  const event = await loadEventWithToken(slug, token);
  if (!event) return;

  const supabase = createAdminClient();
  await supabase.from("events").delete().eq("id", event.id);

  redirect("/");
}
