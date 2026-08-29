-- Adds the "Peach-hosted blog" publish target: a per-account public handle and a
-- per-article URL slug, so published articles are reachable at /blog/:handle/:slug.
alter table profiles add column if not exists public_blog_handle text unique;
alter table articles add column if not exists slug text;
create unique index if not exists idx_articles_user_slug on articles(user_id, slug);
