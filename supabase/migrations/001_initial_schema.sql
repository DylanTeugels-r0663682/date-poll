-- date-poll initial schema
-- Run this once against a fresh Supabase project (SQL editor).

create extension if not exists pgcrypto;

create table events (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  admin_token     text unique not null,
  title           text not null check (char_length(title) between 1 and 120),
  description     text check (char_length(description) <= 2000),
  type            text not null check (type in ('candidates','range')),
  candidate_dates date[],
  range_start     date,
  range_end       date,
  creator_name    text check (char_length(creator_name) <= 60),
  created_at      timestamptz not null default now(),

  constraint candidates_shape check (
    (type = 'candidates'
       and candidate_dates is not null
       and array_length(candidate_dates, 1) between 1 and 31
       and range_start is null
       and range_end is null)
    or
    (type = 'range'
       and range_start is not null
       and range_end is not null
       and range_end >= range_start
       and (range_end - range_start) <= 60
       and candidate_dates is null)
  )
);

create index events_slug_idx on events(slug);

create table responses (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references events(id) on delete cascade,
  respondent_name     text not null check (char_length(respondent_name) between 1 and 40),
  respondent_key      text not null,
  cannot_attend_dates date[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (event_id, respondent_key)
);

create index responses_event_idx on responses(event_id);

-- All writes are gated server-side via the service-role key,
-- so row-level security is not enabled. Do NOT expose the anon key
-- with a client capable of direct writes to these tables.
