-- Adds a personal first-name column to profiles, for the onboarding-email personalization work.
-- Run this in the Supabase SQL editor for project ref olwcmaabbsnqhmbiybsk before the
-- first-name capture in Login.jsx / Onboarding.jsx / POST /api/profile/save will persist anything.

alter table profiles add column if not exists first_name text;
