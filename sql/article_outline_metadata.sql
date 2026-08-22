-- Adds richer outline metadata (Target keyword / Angle / evidence quote) matching the
-- Ithica-style outline editor. Run in the Supabase SQL editor after the original
-- article_pipeline_schema.sql has already been applied.

alter table article_outlines add column if not exists target_keyword text;
alter table article_outlines add column if not exists angle text;
alter table article_outlines add column if not exists evidence_quote text;
