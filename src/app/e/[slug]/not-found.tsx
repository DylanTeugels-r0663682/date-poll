import Link from "next/link";
import { ShellHeader } from "@/components/ShellHeader";

export default function EventNotFound() {
  return (
    <main className="min-h-dvh">
      <ShellHeader />
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-bg-muted text-3xl font-semibold text-muted" aria-hidden>
          ?
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Event not found</h1>
        <p className="mt-2 text-sm text-muted">
          This event may have been deleted, or the link is wrong.
        </p>
        <Link
          href="/new"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Create a new event
        </Link>
      </div>
    </main>
  );
}
