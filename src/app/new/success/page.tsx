import Link from "next/link";
import { notFound } from "next/navigation";
import { ShellHeader } from "@/components/ShellHeader";
import { CopyLinkCard } from "@/components/CopyLinkCard";
import { getSiteUrl } from "@/lib/site-url";

export const metadata = {
  title: "Event created — date-poll",
};

type SearchParams = Promise<{ slug?: string; token?: string }>;

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { slug, token } = await searchParams;
  if (!slug || !token) notFound();

  const base = getSiteUrl();
  const publicUrl = `${base}/e/${slug}`;
  const adminUrl = `${base}/e/${slug}/admin?token=${encodeURIComponent(token)}`;

  return (
    <main className="min-h-dvh">
      <ShellHeader />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-success-soft bg-success-soft px-4 py-3 text-sm text-success">
          Event created. Share the link below.
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Your event is ready</h1>
        <p className="mt-2 text-sm text-muted">
          Copy these two links. You won&rsquo;t see them again — we don&rsquo;t email them.
        </p>
        <div className="mt-8 space-y-4">
          <CopyLinkCard
            label="Public link"
            url={publicUrl}
            tone="public"
            help="Share this with everyone who should respond."
          />
          <CopyLinkCard
            label="Admin link"
            url={adminUrl}
            tone="admin"
            help="Keep this. It lets you delete responses or the whole event."
          />
        </div>
        <div className="mt-8 flex gap-3">
          <Link
            href={`/e/${slug}`}
            className="inline-flex h-11 items-center rounded-md border border-border bg-bg-card px-5 text-sm font-medium transition hover:bg-bg-hover"
          >
            Open event
          </Link>
          <Link
            href="/new"
            className="inline-flex h-11 items-center rounded-md px-4 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Create another
          </Link>
        </div>
      </div>
    </main>
  );
}
