-- Article pipeline schema.
-- Run this in the Supabase SQL editor for project ref olwcmaabbsnqhmbiybsk.
--
-- NOTE: confirmed via the Table Editor that `articles` does not exist yet in this project
-- (only `profiles` and `runs` do) — the original /api/articles/generate insert has been
-- silently failing all along (fire-and-forget, error only logged server-side). This script
-- creates `articles` fresh with the full column set the app needs, matching the existing
-- `profiles`/`runs` convention of RLS disabled (the backend's service-role key is the sole
-- gatekeeper — every route already checks req.user server-side before touching these tables).
--
-- `article_topics.run_id` is stored as `text` rather than `uuid`/a FK, since `runs.id`'s exact
-- type wasn't visible from the Table Editor list view — text safely accepts either a uuid or a
-- bigint-style id without a type-mismatch insert error, at the cost of no FK constraint.

-- Cadence cache on the existing runs table
alter table runs add column if not exists cadence_json jsonb;

-- The articles table the app has always tried to write to (never existed until now)
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  h1 text,
  target_query text,
  content_markdown text,
  content_html text,
  brand text,
  outline_id uuid,
  quality_json jsonb,
  quality_status text default 'pending' check (quality_status in ('pass', 'flagged', 'pending')),
  word_count integer,
  publish_status text default 'unpublished' check (publish_status in ('unpublished', 'published')),
  published_target text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
-- Safety net in case `articles` already existed with only the original subset of columns
alter table articles add column if not exists outline_id uuid;
alter table articles add column if not exists content_html text;
alter table articles add column if not exists quality_json jsonb;
alter table articles add column if not exists quality_status text default 'pending'
  check (quality_status in ('pass', 'flagged', 'pending'));
alter table articles add column if not exists word_count integer;
alter table articles add column if not exists publish_status text default 'unpublished'
  check (publish_status in ('unpublished', 'published'));
alter table articles add column if not exists published_target text;
alter table articles add column if not exists published_at timestamptz;
create index if not exists idx_articles_user on articles(user_id);

-- Stage 1: proposed/approved article topics
create table if not exists article_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_id text,
  brand text not null,
  title text not null,
  reasoning text not null,
  target_query text,
  source text not null default 'generated' check (source in ('generated', 'user_added')),
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected')),
  month_key text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_article_topics_user_month on article_topics(user_id, month_key);

-- Stage 2: editable outlines, one per approved topic
create table if not exists article_outlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references article_topics(id) on delete cascade,
  h1 text not null,
  outline_json jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_article_outlines_topic on article_outlines(topic_id);

-- articles.outline_id is intentionally a loose uuid reference (no FK constraint) rather than a
-- hard foreign key — keeps this script safely re-runnable without a "constraint already exists"
-- failure on a second pass.

-- Publish-target adapter architecture. WordPress keeps using its existing client-side
-- localStorage-credentials flow for now; this table exists for future connectors whose
-- APIs require server-held OAuth tokens.
create table if not exists publish_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  config_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS: defense-in-depth on the new tables (service-role key used by the backend bypasses this
-- regardless — same model as the existing `profiles`/`runs` tables, which have RLS disabled
-- because the backend is the sole gatekeeper; enabling it here costs nothing extra).
alter table article_topics enable row level security;
alter table article_outlines enable row level security;
alter table publish_targets enable row level security;

-- Postgres has no "create policy if not exists" — drop-then-create is the standard idiom
-- for a safely re-runnable policy.
drop policy if exists "Users manage their own article_topics" on article_topics;
create policy "Users manage their own article_topics" on article_topics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own article_outlines" on article_outlines;
create policy "Users manage their own article_outlines" on article_outlines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own publish_targets" on publish_targets;
create policy "Users manage their own publish_targets" on publish_targets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- articles: RLS enabled per the SQL editor's own warning (anon key is public in the frontend
-- bundle; only server.js's service-role client should touch this table, so no policy is needed
-- for legitimate access — RLS with zero policies simply blocks all non-service-role access).
alter table articles enable row level security;
