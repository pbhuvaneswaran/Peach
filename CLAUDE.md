# Project Instructions — Peach (AI Visibility Tool)

> New instructions are added at the top of this file. Older context follows below.

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
| `src/competitorExtractor.js` | `analyzePageAndPrepare()` — single GPT call: description + category + competitors + 8 prompts. Sub-category approach, explicit exclusion of generic tools + freelance platforms. |
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
DODO_API_KEY=                             # Dodo Payments (replacing Stripe, not wired yet)
DODO_WEBHOOK_SECRET=
PORT=3001
```

---

## What's NOT Built Yet (next sessions)

| Feature | Status |
|---------|--------|
| Supabase auth (login/signup) | Login page built (magic link works); Google OAuth UI stubbed — needs credentials wired in Supabase dashboard |
| Supabase run storage | localStorage used as bridge — Supabase schema not wired yet |
| Dodo Payments checkout | Key in .env, no checkout flow yet |
| Scheduled monitoring (weekly re-runs) | Not started |
| PDF report download | Blocked behind auth — modal shows "sign up" |

---

## Pricing Tiers (USD, live on /pricing)

| Tier | Price/mo | Annual/mo | Platforms | Prompts/mo |
|------|----------|-----------|-----------|------------|
| Starter | $89 | $74 | ChatGPT + Gemini + Google AIO | 40 |
| Growth | $199 | $166 | + Perplexity | 80 |
| Scale | $349 | $291 | + Claude | 150 |
| Enterprise | Custom | — | All + custom | Unlimited |

Free: 1 run, no account needed. CTA at bottom of /pricing.

## Competitive Differentiator

Shows **actual AI answers** per prompt AND gives **specific content actions**. No competitor (Profound.io, Otterly.ai, InfuseOS, Peec.ai) shows the raw LLM answers at this price point.
