# date-poll

Pick a date without the email chain. Create an event, share the link, friends mark the days they **can't** attend — the best date surfaces automatically.

No login required for anyone. The creator gets a secret admin link to delete responses or the event.

## Stack

- Next.js 16 (App Router, RSC) + TypeScript
- Tailwind CSS 4
- Supabase Postgres (accessed only from the server via service-role key)
- Deployed on Vercel

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a Supabase project at [supabase.com](https://supabase.com). In the SQL editor, paste and run the contents of `supabase/migrations/001_initial_schema.sql`.

3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → `service_role` secret
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` locally

4. Run the dev server:
   ```bash
   npm run dev
   ```

## Deploy (Vercel)

1. Push the repo to GitHub.
2. Import into Vercel.
3. Set the three environment variables from `.env.example` in the Vercel project settings (set `NEXT_PUBLIC_SITE_URL` to your production URL).
4. Deploy.

## How it works

- Anyone can create an event at `/new`. They receive two URLs: a public one to share and an admin one (contains a 32-byte secret token) to manage the event.
- Respondents visit the public URL, enter a name, and toggle the dates they cannot attend. Re-entering the same name edits the existing response.
- The results view ranks dates by how many people can attend and highlights the best one(s).

## Security notes

All Supabase writes go through Next.js Server Actions using the service-role key — the browser never holds Supabase credentials. Admin actions compare the token with `crypto.timingSafeEqual`.

### Known limitations (MVP)

- The admin token is passed as a URL query parameter (`?token=…`). That means it can appear in browser history, the `Referer` header sent to third-party resources, and server / proxy access logs. Anyone who shares the admin URL — screenshot, pasted link, reverse-proxy log — is effectively sharing control of the event. Treat the admin URL like a password. A post-MVP upgrade would move the token into a POST body or a signed, HttpOnly cookie set from a one-time link.
- There is no rate limiting on event creation or response submission. Add Vercel Edge Middleware throttling before opening this to the public internet at scale.
