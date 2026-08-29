-- Custom domain support for Peach-hosted blogs (Growth/Enterprise only).
-- Run this in the Supabase SQL editor for project ref olwcmaabbsnqhmbiybsk.
-- Lets a customer connect their own domain (e.g. blog.interactlabs.ai) so
-- their Peach-hosted articles serve at that domain instead of
-- gotopeach.com/blog/:handle/:slug.

alter table profiles add column if not exists custom_domain text unique;
alter table profiles add column if not exists custom_domain_verified boolean not null default false;
alter table profiles add column if not exists custom_domain_verification_token text;
alter table profiles add column if not exists custom_domain_added_at timestamptz;

-- ── Rollback (run manually only if reverting this feature) ──────────────────
-- alter table profiles drop column if exists custom_domain;
-- alter table profiles drop column if exists custom_domain_verified;
-- alter table profiles drop column if exists custom_domain_verification_token;
-- alter table profiles drop column if exists custom_domain_added_at;
