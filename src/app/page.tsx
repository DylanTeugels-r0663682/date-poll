import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="px-6 py-5 md:px-10">
        <Link
          href="/"
          className="group inline-flex flex-col items-start text-foreground"
          aria-label="Dydle — home"
        >
          <span className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-sm transition group-hover:bg-accent-hover"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
                <path d="M8 3v4" />
                <path d="M16 3v4" />
              </svg>
            </span>
            <span className="text-xl font-semibold tracking-tight">Dydle</span>
          </span>
          <span className="mt-1 text-xs italic leading-none text-muted">
            a free tool by Dylan Teugels
          </span>
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:py-24">
        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Pick a date without the <span className="text-accent">email chain</span>.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base text-muted md:text-lg">
          Share a link. Friends mark the days they <span className="font-semibold text-foreground">can&rsquo;t</span> make it.
          The best date surfaces automatically — no logins, no hassle.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/new"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-semibold text-white shadow-sm transition hover:bg-accent-hover"
          >
            Create an event
          </Link>
          <span className="text-sm text-muted">Takes under a minute. No signup.</span>
        </div>
      </section>

      <section className="border-t border-border bg-bg-card px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          <Step
            n={1}
            title="Create an event"
            body="Name it. Pick specific dates or a whole range — whatever fits."
          />
          <Step
            n={2}
            title="Share the link"
            body="Everyone opens it. They type a name and tap the days they can't do."
          />
          <Step
            n={3}
            title="Pick the winner"
            body="The date that works for the most people lights up as the winner."
          />
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted">
        Built for the group chat that can&rsquo;t decide on a Friday.
      </footer>
    </main>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
        {n}
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted">{body}</p>
      </div>
    </div>
  );
}
