# Project Instructions — AEO/GEO Visibility Tool

> New instructions are added at the top of this file. Older context follows below.

---

## Latest Instructions (2026-06-27)

- **Base plan = ChatGPT + Gemini only.** Claude (Anthropic) is reserved for a future $199 premium plan. Do not add Claude to V3 UI without explicit instruction.
- **Prompts must never contain brand names.** `generatePromptsFromPage()` must generate category-level buyer queries. Any change to prompt generation must be validated: run copilotverse.io and confirm no brand name appears in the 8 generated prompts.
- **Competitors come from explicit lookup, not LLM answer extraction.** `findDirectCompetitors()` is the primary source for URL mode. `extractCompetitors()` is only used for keyword mode brand ranking.
- **Every run is logged** to `output/runs/<timestamp>.json` for fine-tuning analysis. Do not remove this.
- **GEMINI_MODEL must be `gemini-2.5-flash`** — the key is a Google Gemini Advanced key, not AI Studio. `gemini-1.5-flash` and `gemini-2.0-flash` are not available on it.

---

## Project Overview

**Product:** AEO/GEO AI Visibility Checker — checks how a brand or topic is cited across ChatGPT and Gemini (Claude in premium tier, future).

**Stack:** Node.js/Express backend (port 3001), React + Vite + Tailwind v4 frontend (port 5173, proxies /api to 3001).

**Repo:** github.com/pbhuvaneswaran/VisibilityAI

**Dev commands:**
- `npm run dev` — starts server + React client concurrently
- `node server.js` — server only (use this, not `npm run server`)
- `cd client && npm run dev` — React only

---

## Current Build State — V3 (latest, active)

### Single-Field Input — Auto-detects URL vs Keyword

Two modes auto-detected from the input string:
- **URL mode** (`http://...` or bare domain like `acme.com`) → crawl page → extract category description (no brand name) → find direct competitors → generate 8 unbiased prompts → query ChatGPT + Gemini → score → blog analysis + actions
- **Keyword mode** (anything else) → generate 8 related queries → query LLMs → extract + rank brands by citation frequency → show competitive landscape

### V3 URL Mode Flow (server.js POST /api/v3/analyze)
```
1. readWebPage(url)                      → page content
2. extractBrandFromUrl(url)              → "Copilotverse" from domain
3. extractCategoryDescription(pageData)  → "An OS for solopreneurs using AI..." (NO brand name)
4. findDirectCompetitors(description)    → ["HoneyBook", "Dubsado", "ClickUp", ...] (parallel)
   generatePromptsFromPage(pageData)     → 8 generic category queries (parallel)
5. queryAllQuestionsGPT + queryAllQuestionsGemini → LLM answers (parallel, p-limit 5 each)
6. scoreVisibility(llmResults, brand, competitors) → scores
7. analyzeBlogVsLLMs + generateActions  → blog gaps + actions (try/catch, silent fail without Anthropic key)
8. saveRun(...)                          → output/runs/<timestamp>.json
```

### Key Design Decisions
- **Prompt bias fix:** prompts are generated from page content but the GPT instruction explicitly forbids brand names. Produces queries like "best AI tools for solopreneurs" not "what does CopilotVerse offer".
- **Competitor fix:** dedicated pre-query lookup step asks GPT to name direct competitors in the niche, explicitly excluding generic tools (Notion, Trello, Asana) unless they're true primary alternatives.
- **Honest scoring:** 0% score means the brand isn't being cited yet for generic category queries — that IS the AEO gap the tool surfaces.

---

## Backend Modules

| File | Purpose |
|------|---------|
| `server.js` | Express on port 3001. Routes: POST /api/visibility (V1/V2), POST /api/v3/analyze (V3), POST /api/diagnose, GET /api/health |
| `src/promptGeneratorFromInput.js` | Uses OpenAI gpt-4o-mini. `generatePromptsFromPage()` — category queries, no brand names. `generatePromptsFromKeyword()` — 8 related queries from keyword |
| `src/competitorExtractor.js` | Uses OpenAI gpt-4o-mini. `extractCategoryDescription()` — 1-2 sentence product description without brand name. `findDirectCompetitors(desc)` — 4-5 direct competitors. `extractCompetitors(llmResults)` — fallback for keyword mode |
| `src/runLogger.js` | Saves full run JSON to `output/runs/`. Non-blocking, silent on error |
| `src/webReader.js` | axios + cheerio. Fetches and parses web pages, returns title/headings/content/wordCount |
| `src/blogAnalyzer.js` | Uses Anthropic Claude Sonnet. Compares page content vs LLM answers → topic gap list. Skipped silently if no ANTHROPIC_API_KEY |
| `src/actionGenerator.js` | Uses Anthropic Claude Sonnet. Generates action + evidence for each gap. Skipped silently if no ANTHROPIC_API_KEY |
| `src/claudeClient_aeo.js` | Claude Haiku AEO queries (premium tier, gated on ANTHROPIC_API_KEY) |
| `src/openaiClient_aeo.js` | GPT-4o-mini AEO queries, p-limit 5 |
| `src/geminiClient_aeo.js` | Gemini AEO queries, p-limit 5, uses GEMINI_MODEL env var |
| `src/visibilityScorer.js` | Scores brand mention rate per LLM and aggregate. Simple substring match |
| `src/questionGenerator.js` | Legacy V1/V2: Claude generates buyer-intent questions |
| `src/gapRecommender.js` | Legacy V1/V2: Claude gap recommendations |

---

## Frontend Structure

```
client/src/
  main.jsx              — version toggle root (v1/v2/v3), resets to / on version switch
  VersionToggle.jsx     — floating pill bottom-right, persists in localStorage
  AppV1.jsx             — V1 routes (original)
  AppV2.jsx             — V2 routes (multi-LLM, USD pricing)
  AppV3.jsx             — V3 routes (active default)
  pages/
    v2/                 — V2 pages (Home, Pricing, AppHome, VisibilityFlow)
    v3/
      VisibilityFlow.jsx — Single input field, URL/keyword result views, prompt table
```

### V3 UI Design
- Single input field: `yoursite.com` or `"best helpdesk software"`
- Example chips: yoursite.com, "best helpdesk software", "CRM for B2B teams"
- LLM toggles: ChatGPT (green) + Gemini (blue) only — NO Claude chip
- URL mode results: score bars, per-LLM breakdown, prompt-by-prompt expandable table, blog analysis, action cards
- Keyword mode results: brand ranking bars, prompt table, CTA to check own website

---

## API Keys (.env)

```
GEMINI_API_KEY=<Google Gemini Advanced key — format AQ.Ab8RN6...>
GEMINI_MODEL=gemini-2.5-flash          # must be 2.5-flash, not 1.5 or 2.0
OPENAI_API_KEY=<sk-proj-...>           # paid key, used for generation + AEO queries
ANTHROPIC_API_KEY=                     # empty = blog analysis silently skipped (premium tier)
PERPLEXITY_API_KEY=                    # not used in V3
SUPABASE_URL=                          # not yet wired
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
STRIPE_SECRET_KEY=                     # not yet wired
STRIPE_WEBHOOK_SECRET=
PORT=3001
```

---

## Pricing Tiers (USD, planned)

| Tier | Price/mo | LLMs | Runs/mo cap |
|------|----------|------|-------------|
| Base | $49 | ChatGPT + Gemini | 100 |
| Agency | $149 | ChatGPT + Gemini | 500 |
| Premium ($199 — future) | $199 | + Claude | TBD |
| Agency Pro | $299 | All | 2,000 |

---

## Cost per Run

~$0.022 baseline (ChatGPT + Gemini, 8 prompts). With blog analysis (Claude): ~$0.047. Budget at $0.05/run.

Generation calls (OpenAI): extractCategoryDescription + findDirectCompetitors + generatePromptsFromPage = ~3 gpt-4o-mini calls per URL run.

---

## Run Logging (Fine-Tuning)

Every V3 run saves to `output/runs/<timestamp>-<input-slug>.json`:
```json
{
  "savedAt": "...",
  "input": "https://copilotverse.io",
  "mode": "url",
  "brand": "Copilotverse",
  "categoryDescription": "An OS for solopreneurs...",
  "competitors": ["HoneyBook", "Dubsado", "ClickUp"],
  "prompts": ["best AI tools for solopreneurs", ...],
  "llmsQueried": ["chatgpt", "gemini"],
  "llmAnswers": { "chatgpt": [...], "gemini": [...] },
  "visibility": { "aggregatePercentages": {...} },
  "blogGaps": [...],
  "actions": [...]
}
```
Use these files to review what prompts/competitors were generated and tune the GPT instructions in `promptGeneratorFromInput.js` and `competitorExtractor.js`.

---

## Competitive Differentiator

Shows **actual AI answers** AND gives **actionable content recommendations**. No competitor (Profound.io, Otterly.ai, Peec.ai) does both.
- Main gap vs competitors: no trend over time / weekly monitoring (future)

## Integrations Roadmap

| Integration | Status |
|-------------|--------|
| OpenAI ChatGPT | Wired (AEO queries + generation) |
| Google Gemini | Wired (AEO queries) |
| Anthropic Claude | Gated (premium, AEO + blog analysis) |
| Supabase (auth + reports) | Not yet wired |
| Stripe (subscriptions) | Not yet wired |
