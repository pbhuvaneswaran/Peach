-- Records the live URL after a server-side publish (GitHub, WordPress.com).
alter table articles add column if not exists published_url text;
