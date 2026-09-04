-- Backing store for the short /api/auth/confirm redirect links used in the custom
-- magic-link email (server.js, POST /api/auth/send-magic-link).
-- Run this in the Supabase SQL editor for project ref olwcmaabbsnqhmbiybsk.
--
-- Originally this was an in-memory Map, which does not work on Vercel serverless:
-- the request that creates the short link and the request that resolves it can land
-- on different, memory-isolated function instances (and every redeploy wipes memory
-- entirely), so links appeared to "expire" immediately. This table makes the mapping
-- durable across instances and deploys.

create table if not exists magic_link_redirects (
  token text primary key,
  url text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
