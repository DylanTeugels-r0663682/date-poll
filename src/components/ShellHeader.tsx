import Link from "next/link";

export function ShellHeader() {
  return (
    <header className="border-b border-border bg-bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
        >
          <span aria-hidden className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
              <path d="M8 3v4" />
              <path d="M16 3v4" />
            </svg>
          </span>
          <span>date-poll</span>
        </Link>
        <Link
          href="/new"
          className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          New event
        </Link>
      </div>
    </header>
  );
}
