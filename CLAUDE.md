# Project Instructions — Peach (AI Visibility Tool)

> New instructions are added at the top of this file. Older context follows below.

---

## Latest Instructions (2026-08-24)

- **Dodo Payments is live and working end-to-end for checkout + email.** `DODO_ENV=live`, `DODO_WEBHOOK_SECRET` and `RESEND_API_KEY` are all set on Vercel Production and verified working (webhook endpoint registered at `https://www.gotopeach.com/api/webhooks/dodo`; Resend domain verified via GoDaddy DNS records — TXT `resend._domainkey`, MX `send`, TXT `send`). Checkout is locked to USD only (`feature_flags: { allow_currency_selection: false }` on `checkoutSessions.create`, `server.js`). **Not yet verified:** a real payment through Peach's own `/pricing` → checkout flow — only a Dodo-dashboard-only test payment was run, which doesn't exercise `/api/checkout` or the webhook at all (confirmed via Supabase `profiles` + Vercel logs — no hits). Deferred by user for now, not fixed.
- **Live pricing on `/pricing`** — `GET /api/pricing` fetches the current Starter/Growth price directly from Dodo (60s in-memory cache) so the marketing page never drifts from what Dodo actually charges. `client/src/pages/Pricing.jsx` fetches on load, falls back to hardcoded defaults only if the fetch fails.
- **Competitor identification is now grounded in live web search, not just training data.** `analyzePageAndPrepare` and `findDirectCompetitors` (`src/competitorExtractor.js`) both switched from plain `client.chat.completions.create()` to `client.responses.create({ tools: [{ type: 'web_search_preview' }], ... })` — the model can search the live web instead of only recalling what it memorized during training. This was the fix for competitor results looking nothing like what ChatGPT.com itself returns for the same question. Note: OpenAI rejects combining web search with JSON mode (`400 Web Search cannot be used with JSON mode`), so structured output relies on a "return ONLY valid JSON" prompt instruction + regex extraction, not `response_format`.
  - **Cost/latency tradeoff, explicitly accepted but flagged as a watchpoint:** adds ~$0.023–0.025 extra OpenAI cost per call (flat $25/1,000-call fee for `web_search_preview` on gpt-4o dominates — search-result tokens themselves are free) and full analyze runs went from ~21s to ~42s. **User said Peach may need to revert this if real OpenAI spend grows too much** — if asked to revert, this is the change to undo (go back to plain `chat.completions.create()`, no tools), but that reintroduces the "doesn't match ChatGPT.com" problem it fixed, so check actual billing numbers first.
  - Also fixed in the same pipeline: crawled `pageData.metaDesc` was captured but never fed into the prompt (now is); total crawl failures on JS-heavy sites (e.g. vercel.com returning zero content) now fall back to `web_search_preview` for the page description too, instead of GPT inventing a category from nothing.
  - The old unguarded 0%-score fallback (`extractCompetitors()`, which extracted brand names straight out of biased LLM-answer text) was removed entirely — replaced by reusing `findDirectCompetitors()` with the same web-search grounding.
- **`gpt-4o` + `gpt-4o-mini` are the only OpenAI models actually in use.** Some files reference `claude-sonnet-4-6` / `claude-haiku-4-5-20251001` (`actionGenerator.js`, `blogAnalyzer.js`, `gapRecommender.js`, `questionGenerator.js`, `claudeClient_aeo.js`) and `llama-3.1-sonar-small-128k-online` (`perplexityClient.js`) but those paths are dead code — `ANTHROPIC_API_KEY` and `PERPLEXITY_API_KEY` are both empty in `.env`.

---

## Latest Instructions (2026-08-18)

- **Article pipeline rebuilt as a 3-stage editorial workflow** — Topics (with 2-line reasoning per topic, approve/reject/add) → Outlines (AI-generated H1/H2/H3, user-editable — add/remove headings) → Article (full draft + deterministic quality checks + Google-Docs-style rich-text editor via TipTap). Lives in a new "Articles" tab on `/dashboard` (`client/src/pages/v3/ArticlesTab.jsx`) — `Dashboard.jsx` previously had no route; `/dashboard` is now wired in `AppV3.jsx`.
- **Article quota corrected to 20/40** — Starter is 20 articles/month, Growth is 40/month (was 15/30 everywhere — `server.js`, `Pricing.jsx`, and this file's pricing table are now consistent).
- **Topics are grounded, not generic** — a new `src/blogCadenceAnalyzer.js` crawls the analyzed site's sitemap/blog index to estimate posts/month over the last 6 months; this drives an advisory-only "recommended pace" banner (never a hard cap — the full plan quota is always generatable) so a site posting ~10/month isn't told to suddenly publish 40. When the site's own content is too thin to ground topics in, `searchWeb()` (`src/googleAIOClient.js`, reuses the existing Serper key) pulls competitor blog research instead.
- **Quality checks are deterministic, not a second LLM call** — `src/qualityChecks.js` checks word count, banned phrases (shared list with the generation prompt — no more drift), full outline-heading coverage, CTA presence, and brand-name stuffing. Runs on every generation AND on every manual edit save (`PATCH /api/articles/:id`).
- **Publishing integrations use an adapter architecture** — `src/publishers/` defines the connector contract; only WordPress is registered (client-side, using the existing `localStorage`-cached Application Password flow). Webflow/Notion/HubSpot/Contentful are explicitly deferred, not built.
- **New Supabase tables needed** — `sql/article_pipeline_schema.sql` has the full DDL (`article_topics`, `article_outlines`, `publish_targets`, plus new columns on `runs`/`articles`) with RLS policies. **Must be run manually in the Supabase SQL editor before the new endpoints will work** — check the comments at the top of that file for two things to confirm first (the real type of `runs.id`, and whether `articles` already has a uuid primary key).
- **`ContentBriefModal`'s export/publish logic was extracted** into `client/src/components/ArticleExportBar.jsx`, now shared with the new Articles tab — the ad-hoc single-topic flow from the Growth Actions tab still works exactly as before, just via the shared component instead of duplicated code.

---

## Latest Instructions (2026-07-22)

- **Competitor identification logic fixed** — `src/competitorExtractor.js` prompt now uses "The Buyer Test": *if someone is actively evaluating this product, which other vendors would they have also requested a demo from in the same week?* This fixes B2B tools (e.g. Prudent AI) returning their customers (Blend, Zillow) instead of actual software competitors (Ocrolus, Laminr, Tidalwave). Key rule: competitors are other VENDORS, never the companies that BUY the product.
- **Auth gate** — `/app` redirects to `/login` before running analysis (gate currently commented out for local testing — re-enable before deploying: search for "Auth gate disabled" in VisibilityFlow.jsx).
- **Supabase project** — correct project is `olwcmaabbsnqhmbiybsk.supabase.co` (not `arkwwkqepnnrpzsnqdra`, not `yilldvpntyvpjnaiczjx`). `client/.env` must use `VITE_SUPABASE_URL=https://olwcmaabbsnqhmbiybsk.supabase.co` and `VITE_SUPABASE_ANON_KEY=sb_publishable_...`.

---

## Latest Instructions (2026-07-08)

- **Results page tabs redesigned** — 6 tabs: Overview · Prompts · Competitors · Citations · Growth Actions · Site Audit (was 4 tabs: Overview · AI Answers · Site Audit · Action plan).
- **Prompts tab** — Prompt library table with LLM status dots (cited/not cited per platform), visibility %, source count, pagination. "+ Add prompt" modal (fields: text, intent, priority, persona). "⚡ Generate prompts" modal. Brand keywords section with chip input, stored in `localStorage` keys `peach_custom_prompts` and `peach_brand_keywords`.
- **Competitors tab** — Per-competitor citation rate cards with evidence quotes from LLM answers.
- **Citations tab** — KPI row (influential domains, cited URLs, competitor citations, third-party opportunities), platform citation mix stacked bars, citation source split bar, top cited domains table (paginated), top cited prompts table. All data derived client-side from `result.visibility.perLLM`.
- **Growth Actions tab** — Renamed from "Action plan", same content.
- **JSON/markdown guard** — Frontend fetch now reads response as text first, JSON.parse in try/catch, shows clean error on server failures. 90s AbortController timeout.
- **Per-question LLM timeout** — 15s timeout on each GPT + Gemini question call to prevent stalling the full request.
- **CTA buttons** — All "Check your AI visibility" CTAs go directly to `/app`, no login wall. Sign in links still point to `/login`.
- **Google OAuth** — Wired via `supabase.auth.signInWithOAuth({ provider: 'google' })`. Supabase project: `arkwwkqepnnrpzsnqdra.supabase.co`. Vercel env needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (VITE_ prefix required for frontend).

---

## Latest Instructions (2026-07-07)

- **Domain is `gotopeach.com`** (was `trypeachx` Vercel subdomain). All email/URL references use `gotopeach.com`. Contact email: `hello@gotopeach.com`.
- **Auto-save rule:** After every user prompt in a Claude Code session, append the prompt + a short summary of the response to `PROMPTS.md` in the project root, and update `CLAUDE.md` with any new decisions or instructions.

---

## Latest Instructions (2026-07-04)

- **Product name is "Peach"** (was Visibility.ai). Navbar + Footer show "Peach", no AEO badge.
- **URL-only input.** Keyword mode was removed. `/app` only accepts website URLs.
- **One version only.** Version toggle (V1/V2/V3) has been removed. `main.jsx` renders AppV3 directly.
- **8 prompts per run** — covers best-of, comparison, use-case, audience-specific angles. 16 LLM calls total (8 GPT + 8 Gemini).
- **1 combined OpenAI prep call** returns description + competitors + prompts together (was 3 separate calls).
- **Gemini p-limit = 2** to avoid rate limit cascades on the 5 RPM free tier key.
- **Google AIO is a 3rd platform** via Serper API (`SERPER_API_KEY` already set). Chip in UI, opt-in.
- **Run logging** saves every run to `output/runs/<timestamp>.json` for fine-tuning.
- **localStorage persistence** — results survive navigation. Cleared only when user clicks "← New report".
- **Competitor prompt uses sub-category approach** — GPT must identify the specific sub-category before listing competitors, explicitly blocking Notion/ClickUp/Miro/Airtable/Asana/Trello/Fiverr/Upwork and other non-software platforms.
- **Prompt generation is software-specific** — GPT is instructed that buyer queries must reflect searching for SOFTWARE/AI tools, not generic business advice (fixes Fiverr showing up for AI tools).
- **Action generation uses OpenAI** (gpt-4o-mini), not Anthropic. No Anthropic key needed for any core feature.
- **Action cards include blog outlines** — each action has `blogs` array with 2 blog post ideas, each with title + H1 + H2/H3 outline. Toggle reveals them in the UI.
- **GEMINI_MODEL must be `gemini-2.5-flash`** — key is Google Gemini Advanced format, not AI Studio.
- **Pricing page built** — 3 tiers (Starter $89 / Growth $199 / Scale $349) + Enterprise + free section. Annual toggle. Real LLM logo SVGs.
- **Features page built** — `/features` — 12 square cards showing actual product capabilities.
- **Login page built** — `/login` — email magic link (Supabase OTP) + Google OAuth stub. No Navbar, standalone page.
- **Export buttons** — Share (copy URL), CSV download, PDF (modal → pricing), Print. In results header.
- **"Where AI doesn't mention you"** section shows answers from ALL queried LLMs per prompt (not just one).

---

## Product Overview

**Name:** Peach  
**Purpose:** AEO/GEO AI Visibility Checker — shows why a brand isn't cited by ChatGPT, Gemini, and Google AI Overviews, and gives a specific content action plan.

**Stack:** Node.js/Express backend (port 3001), React + Vite + Tailwind v4 frontend (port 5173, proxies /api to 3001).

**Repo:** github.com/pbhuvaneswaran/VisibilityAI

**Dev commands:**
- `npm run dev` — starts server + React client concurrently
- `node server.js` — server only (use this, not `npm run server`)
- `cd client && npm run dev` — React only

---

## Current Build State (active)

### URL Mode Flow — `POST /api/v3/analyze`

```
1. readWebPage(url) + checkCrawlerAccess(url)     → parallel (~1-2s)
2. analyzePageAndPrepare(pageData)                 → 1 GPT call returns:
   - categoryDescription (no brand name)
   - competitors[] (4 direct, sub-category specific)
   - prompts[] (8 buyer-intent queries, varied angles, no brand names)
3. queryAllQuestionsGPT + queryAllQuestionsGemini  → parallel, p-limit 5 / 2
   + queryAllQuestionsGoogleAIO (if SERPER_API_KEY set, opt-in chip)
4. scoreVisibility(llmResults, brand, competitors) → scores
5. generateActionsOpenAI(gaps, brand, llmResults)  → 3 action cards (if gaps exist)
6. saveRun(...)                                    → output/runs/<timestamp>.json
```

### Results Page — Diagnostic Flow (VisibilityFlow.jsx URL mode)

1. **Score Overview** — stat cards (your %, missed prompts, top competitor, platforms) + per-LLM grid
2. **Why You're Not Ranking** — shows actual LLM answers per prompt. If gaps exist: shows competitor quotes. If all 0%: shows what AI said instead (full answer snippets).
3. **Why Competitors Rank** — for top competitors with >0%, quotes the LLM answer that cited them
4. **What To Do** — action cards if gaps; prompt-based recommendations if all 0%
5. **Prompt-by-Prompt Breakdown** — expandable table with all LLM answers (PromptTable component)
6. **Technical Checks** (collapsible) — robots.txt crawler check + blog gaps

### Dashboard — `/dashboard`

5 tabs: **Overview · AI Answers · Content Gaps · Action Plan · Site Audit**

- Overview: stat cards + Recharts line chart (URL runs for same brand only) + leaderboard (latest run's brands only — no cross-run mixing)
- AI Answers: PromptTable from latest run
- Content Gaps: BlogAnalysis from latest URL run
- Action Plan: ActionCards from latest URL run
- Site Audit: CrawlerCheck + BlogAnalysis

Dashboard accessed via "View Dashboard →" link in results header (not in main navbar).

---

## Backend Modules

| File | Purpose |
|------|---------|
| `server.js` | Express port 3001. Routes: POST /api/v3/analyze, GET /api/runs, GET /api/health |
| `src/competitorExtractor.js` | `analyzePageAndPrepare()` — GPT call grounded in live web search (`web_search_preview` tool, Responses API): description + up to 3 product-line categories + competitors + 8 prompts. `findDirectCompetitors()` — same web-search grounding, used as the 0%-score fallback. Both use the Buyer Test framing + exclusion list. Falls back to web search for the page description itself when the crawl returns nothing. |
| `src/actionGenerator.js` | `generateActionsOpenAI()` — gpt-4o-mini generates 3 actions from visibility gaps with LLM answer evidence |
| `src/runLogger.js` | Saves full run JSON to `output/runs/`. Non-blocking. |
| `src/webReader.js` | axios + cheerio. Fetches and parses web pages. |
| `src/robotsChecker.js` | Fetches robots.txt, checks GPTBot / Google-Extended / ClaudeBot / PerplexityBot. |
| `src/googleAIOClient.js` | Serper API → Google AI Overview text per prompt. p-limit 3. |
| `src/openaiClient_aeo.js` | GPT-4o-mini AEO queries. p-limit 5. |
| `src/geminiClient_aeo.js` | Gemini AEO queries. **p-limit 2** (rate limit protection). |
| `src/visibilityScorer.js` | Scores brand mention rate per LLM + aggregate. Substring match. |
| `src/blogAnalyzer.js` | Claude Sonnet (gated, ANTHROPIC_API_KEY empty — silently skipped) |
| `src/actionGenerator.js` | Old Claude version kept; new `generateActionsOpenAI` is active |

---

## Frontend Structure

```
client/src/
  main.jsx                    — renders AppV3 directly (no version toggle)
  AppV3.jsx                   — all routes
  components/
    Navbar.jsx                — "Peach" branding, no AEO badge, logo → /
    Footer.jsx                — "Peach" branding
    llmConfig.js              — LLM_COLORS: chatgpt, gemini, googleaio
    VisibilityComponents.jsx  — shared: LLMChip, ScoreBar, MentionCell, PromptRow,
                                PromptTable, ActionCard, BlogAnalysis, CrawlerCheck
  pages/
    v3/
      VisibilityFlow.jsx      — URL-only input, localStorage persistence, diagnostic results
      Dashboard.jsx           — 5-tab dashboard, Recharts, latest-run-only leaderboard
```

---

## API Keys (.env)

```
GEMINI_API_KEY=<your-gemini-key>          # Gemini Advanced key (AQ.Ab8R... format, NOT AI Studio)
GEMINI_MODEL=gemini-2.5-flash             # MUST be 2.5-flash
OPENAI_API_KEY=<your-openai-key>          # paid key, used for ALL generation + AEO queries
SERPER_API_KEY=<your-serper-key>          # Google AIO via Serper
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
ANTHROPIC_API_KEY=                        # empty — blog analysis skipped silently
PERPLEXITY_API_KEY=                       # empty — perplexityClient.js is dead code
DODO_API_KEY=<your-dodo-key>              # Dodo Payments — LIVE, checkout + webhook working
DODO_WEBHOOK_SECRET=<your-webhook-secret> # from Dodo dashboard, live-mode endpoint
DODO_ENV=live                             # must be 'live' to match a live-mode DODO_API_KEY
DODO_STARTER_PRODUCT_ID=<your-product-id>
DODO_GROWTH_PRODUCT_ID=<your-product-id>
RESEND_API_KEY=<your-resend-key>          # email report — domain verified via GoDaddy DNS
APP_URL=<your-app-url>                    # used for Dodo checkout return_url
ADMIN_EMAILS=<comma-separated-emails>
PORT=3001
```

---

## What's NOT Built Yet (next sessions)

| Feature | Status |
|---------|--------|
| Supabase auth (login/signup) | Login page built (magic link works); Google OAuth UI stubbed — needs credentials wired in Supabase dashboard |
| Supabase run storage | localStorage used as bridge — Supabase schema not wired yet |
| Article pipeline Supabase schema | `sql/article_pipeline_schema.sql` written, not yet run against live Supabase project — `/api/articles/*` endpoints will fail until it is |
| Dodo Payments end-to-end verification | Checkout/webhook/env all live and configured, but never verified with a real payment through Peach's own checkout flow (only a Dodo-dashboard-only test, which doesn't hit our endpoints at all) |
| Scheduled monitoring (weekly re-runs) | Not started |
| PDF report download | Blocked behind auth — modal shows "sign up" |

---

## Pricing Tiers (USD, live on /pricing)

| Tier | Price/mo | Annual/mo | Platforms | Prompts/mo | Articles/mo |
|------|----------|-----------|-----------|------------|-------------|
| Starter | $89 | $74 | ChatGPT + Gemini + Google AIO | 40 | 20 |
| Growth | $219 | $183 | + Perplexity | 80 | 40 |
| Scale | $349 | $291 | + Claude | 150 | — |
| Enterprise | Custom | — | All + custom | Unlimited | Unlimited |

Free: 1 run, no account needed. CTA at bottom of /pricing.

## Competitive Differentiator

Shows **actual AI answers** per prompt AND gives **specific content actions**. No competitor (Profound.io, Otterly.ai, InfuseOS, Peec.ai) shows the raw LLM answers at this price point.
