# Project Instructions — AEO/GEO Visibility Tool

> New instructions are added at the top of this file. Older context follows below.

---

## Project Overview

**Product:** AEO/GEO AI Visibility Checker — checks how a brand or topic is cited across Claude, ChatGPT, and Gemini.

**Stack:** Node.js/Express backend (port 3001), React + Vite + Tailwind v4 frontend (port 5173, proxies /api to 3001).

**Dev commands:**
- `npm run dev` — starts server + React client concurrently
- `npm run server` — server only
- `cd client && npm run dev` — React only

**Git user:** Bhuvaneswaran P

---

## Current Build State — V3 (latest)

### V3 Goal: Single-field input (URL or keyword), everything auto-derived

Two auto-detected modes:
- **URL mode** (`http...` or domain pattern) → crawl page → extract brand from domain → generate 8 prompts from page content → query 3 LLMs → score → blog analysis + actions
- **Keyword mode** (anything else) → generate 8 related AEO prompts → query 3 LLMs → extract + rank brands by citation frequency → show competitive landscape

### New files for V3
- `src/competitorExtractor.js` — Claude extracts brand names from LLM answers, sorted by frequency
- `src/promptGeneratorFromInput.js` — URL mode: page title+headings→8 prompts; keyword mode: keyword→8 related queries

### V3 Backend endpoint: `POST /api/v3/analyze`
```
Input: { input: string, llms?: string[] }
- detect isUrl
- if URL: readWebPage → extract brand → generatePromptsFromPage
- if keyword: generatePromptsFromKeyword
- fan out to LLMs → scoreVisibility → extractCompetitors
- if URL: analyzeBlog + generateActions
- return full result
```

### V3 Frontend
- `client/src/pages/v3/VisibilityFlow.jsx` — single input field, example chips, results unchanged
- `client/src/AppV3.jsx` — V3 routes

### Bug fixed: version toggle "Page not found"
`client/src/main.jsx` — `onSelect` wrapper calls `window.location.href = '/'` when switching versions.

---

## Backend Modules (all versions)

| File | Purpose |
|------|---------|
| `server.js` | Express on port 3001, routes: POST /api/visibility, POST /api/diagnose, POST /api/v3/analyze |
| `src/questionGenerator.js` | Claude Sonnet generates 10 buyer-intent questions |
| `src/perplexityClient.js` | Sends questions to Perplexity API (OpenAI-compat), parallel with p-limit |
| `src/visibilityScorer.js` | Scores brand mentions per answer, finds top 3 gaps |
| `src/gapRecommender.js` | Claude Sonnet writes content recommendations per gap |
| `src/claudeClient_aeo.js` | Claude Haiku AEO queries |
| `src/openaiClient_aeo.js` | GPT-4o-mini AEO queries |
| `src/geminiClient_aeo.js` | Gemini 1.5 Flash AEO queries |
| `src/webReader.js` | axios fetch + cheerio parse → clean article text |
| `src/blogAnalyzer.js` | Claude Sonnet: blog content vs LLM answers → topic gap list |
| `src/actionGenerator.js` | Claude Sonnet: gap → action + reasoning quoting LLM answer as evidence |

---

## Frontend Structure

```
client/src/
  main.jsx          — version toggle + root renderer
  VersionToggle.jsx — floating pill (bottom-right), localStorage
  AppV1.jsx / AppV2.jsx / AppV3.jsx — per-version routes
  pages/
    v2/             — V2 pages (multi-LLM results, USD pricing)
    v3/             — V3 pages (single-field input)
```

---

## API Keys Required (in .env)

```
ANTHROPIC_API_KEY    # console.anthropic.com
OPENAI_API_KEY       # platform.openai.com
PERPLEXITY_API_KEY   # perplexity.ai/api
GEMINI_API_KEY       # already set ✅
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

---

## Models in Use

| Step | Model | Notes |
|------|-------|-------|
| Question/prompt generation | claude-sonnet-4-6 | |
| Gap recommendations + blog analysis + actions | claude-sonnet-4-6 | |
| Claude AEO queries | claude-haiku-4-5-20251001 | cost-efficient |
| ChatGPT AEO queries | gpt-4o-mini | cost-efficient |
| Gemini AEO queries | gemini-1.5-flash | |

---

## Cost per Run

~$0.022 (2.2 cents) baseline. With blog analysis: ~$0.047. Budget at $0.05/run for planning.

---

## Pricing Tiers (USD)

| Tier | Price/mo | Runs/mo cap |
|------|----------|-------------|
| Starter | $49 | 100 |
| Agency | $149 | 500 |
| Agency Pro | $299 | 2,000 |

Overage: Agency $0.05/extra run, Agency Pro $0.03/extra run.

---

## Integrations Roadmap

| Integration | Status |
|-------------|--------|
| Anthropic Claude | Wired |
| OpenAI ChatGPT | Wired |
| Google Gemini | Wired |
| Perplexity | Wired |
| Supabase (auth + reports + cache) | Not yet wired |
| Stripe (subscriptions) | Not yet wired |

---

## Competitive Differentiator

We show **actual AI answers** AND give **actionable content recommendations**. No competitor (Profound.io, Otterly.ai, Peec.ai) does both. Main gap vs competitors: no trend over time / weekly monitoring.

---

## Output Verification Steps

1. Enter `https://somesite.com` → crawl, auto-detect brand, run 8 prompts, score vs competitors
2. Enter `best helpdesk software for teams` → generate 8 prompts, show competitive landscape
3. `cd client && npm run build` should be clean
