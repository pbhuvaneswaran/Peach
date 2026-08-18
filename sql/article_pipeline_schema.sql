-- Article pipeline schema additions.
-- Run this in the Supabase SQL editor for project ref olwcmaabbsnqhmbiybsk.
--
-- Before running: confirm the actual type of `runs.id` (uuid vs bigint) in the Supabase
-- dashboard's table editor. `article_topics.run_id` below is left as a loose `uuid` reference
-- (no FK constraint) rather than guessing the type wrong and breaking this script.
--
-- Also confirm `articles` already has a `uuid primary key default gen_random_uuid()` column
-- named `id` — the original insert path never selected one back, so this hasn't been verified
-- to exist. If missing, add it before running the `alter table articles` statements below:
--   alter table articles add column if not exists id uuid primary key default gen_random_uuid();

-- Cadence cache on the existing runs table
alter table runs add column if not exists cadence_json jsonb;

-- Stage 1: proposed/approved article topics
create table if not exists article_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid,
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

-- Stage 3: extend the existing articles table
alter table articles add column if not exists outline_id uuid references article_outlines(id);
alter table articles add column if not exists content_html text;
alter table articles add column if not exists quality_json jsonb;
alter table articles add column if not exists quality_status text default 'pending'
  check (quality_status in ('pass', 'flagged', 'pending'));
alter table articles add column if not exists word_count integer;
alter table articles add column if not exists publish_status text default 'unpublished'
  check (publish_status in ('unpublished', 'published'));
alter table articles add column if not exists published_target text;
alter table articles add column if not exists published_at timestamptz;

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

-- RLS: match the pattern already used on `articles`/`runs`/`profiles` (service-role key bypasses
-- RLS entirely, which is how server.js's supabaseAdmin client operates today — enable RLS here
-- for defense-in-depth in case these tables are ever queried with a non-admin client).
alter table article_topics enable row level security;
alter table article_outlines enable row level security;
alter table publish_targets enable row level security;

create policy if not exists "Users manage their own article_topics" on article_topics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users manage their own article_outlines" on article_outlines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users manage their own publish_targets" on publish_targets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
