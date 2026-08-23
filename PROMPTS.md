# Peach — Product Decision Log

Each entry: user's prompt → first reasoning response (analysis only, no code).
Updated after every session. This file is the product thinking behind every major decision.

---

## 2026-06-27 — V3 Single-Input AEO Flow

**Prompt:** "let's build"
*(After reviewing the V3 plan for single-field input that auto-detects URL vs keyword)*

**Reasoning:** Surveyed the full codebase. The backend already had V1/V2 infrastructure (questionGenerator, perplexityClient, visibilityScorer). V3 needed: (1) a new single endpoint that accepts URL or keyword and auto-detects mode, (2) a web crawler to read page content, (3) a prompt generator from page content, (4) a competitor extractor from LLM answers. URL mode crawls → extracts brand from domain → generates 8 prompts → queries ChatGPT + Gemini → scores. Keyword mode generates 8 related queries → queries LLMs → ranks brands by citation frequency. Built all four new backend modules and rewrote the V3 frontend to a single input field.

---

## 2026-06-27 — Base Plan = ChatGPT + Gemini Only

**Prompt:** "let's do gemini and openAI (chatGPT) in the first plan, and let build this alone now and check the output. let have Anthropic(claude) in the 199$ plan"

**Reasoning:** The V3 flow had three separate modules using the Anthropic SDK internally for orchestration (prompt generation, competitor extraction) — before any LLM query even fires. If ANTHROPIC_API_KEY is missing, V3 breaks entirely before starting. The fix: switch `promptGeneratorFromInput.js` and `competitorExtractor.js` to use Gemini instead, so the full flow works with just GEMINI_API_KEY + OPENAI_API_KEY. Claude stays gated for premium. Also removed Claude chip from the UI LLM selector. Gemini key was already set; OpenAI key needed to be added.

---

## 2026-06-27 — Wrong Competitors (Notion, Trello, Asana for CopilotVerse)

**Prompt:** "Right now give me the reasoning here, as to why you choose notion, trello, asana, slack as competitors for copilotverse.io — what's the relation here"
*(After seeing the tool analysis of copilotverse.io)*

**Reasoning:** The flow works like this for a URL: crawl page → generate 8 prompts from page content → query ChatGPT + Gemini → extract competitor brands from LLM answers. The prompts generated from CopilotVerse's page were too generic ("best tools for solopreneurs to automate business operations"). When ChatGPT/Gemini answer that generic query, they reach for the most well-known tools in their training data for that category: Notion, Trello, Asana — these are famous, heavily documented tools. CopilotVerse isn't. So the tool didn't pick competitors by understanding what CopilotVerse actually does — it picked whatever tools LLMs happen to mention when answering generic productivity queries. Second problem: several generated prompts contained the brand name "CopilotVerse" directly, which inflated the score (LLMs echo back the brand name when you ask about it). Root fixes needed: (1) generate prompts as category queries with no brand name, (2) use a dedicated competitor lookup before querying LLMs, not extracting from LLM answers.

---

## 2026-06-28 — Make V2 and V3 Identical

**Prompt:** "make v3 and v2 identical, lookwise and the product wise — we will work on v3 now but I want whatever we did on v3 to be in v2, so the changes we make now will be in v3 alone"

**Reasoning:** V2 had its own AppV2.jsx with separate pages (multi-LLM results, USD pricing, old form). V3 had the new single-input diagnostic flow. Making them identical means V2 just re-exports V3 — any change to V3 pages automatically shows in V2 with no duplication. Made AppV2.jsx a one-line re-export of AppV3. Going forward, all development is on V3 only.

---

## 2026-06-30 — Can I Create a Dashboard Like InfuseOS?

**Prompt:** "can I create a dashboard like this" *(shared InfuseOS screenshots)*

**Reasoning:** Explored what run data we already have in `output/runs/*.json` — every run is logged with full data (brand, competitors, prompts, LLM answers, scores, gaps, actions). A dashboard reading these files requires no new backend data collection, just a `GET /api/runs` endpoint that summarizes them. The data is already there. No charting library installed — would need Recharts. Auth not wired yet — dashboard would show all runs (no per-user filtering). Recommended building from the existing run files first, wire Supabase per-user filtering later.

---

## 2026-06-30 — Tab Design: Don't Copy InfuseOS

**Prompt:** "Overview · Prompts · Citations · Growth Actions · Site Audit — if I keep the same it means I copied InfuseOS. Give me other ideas. Also should I use integrations like theirs?"

**Reasoning:** InfuseOS's tab structure maps to their product (scheduled scans, URL citation tracking, full integration platform). Our product is different: we show actual AI answers — that's our core differentiator. Copying their tabs would mean building empty screens. Citations tab as InfuseOS defines it (domain URLs cited) doesn't match what we measure (brand name mentions). Site Audit as a whole tab is thin — it's one section. On integrations: LinkedIn/Google Docs publish buttons are a completely different product (AI content publishing agent). We don't have auth working yet, no scheduled monitoring, no content editor. Integrations are a v2 story. Recommended 4 focused tabs: Overview · AI Answers · Content Gaps · Action Plan. "AI Answers" is the differentiator — competitors don't show the raw answers at this price point.

---

## 2026-06-30 — Google's AEO Guide: What Should We Do?

**Prompt:** *(Shared full Google Search Central "Optimizing for generative AI features" documentation)*  "what do I infer from this, what should we do here to stay on top of it and to differentiate"

**Reasoning:** Google's core argument is "AEO is just SEO for Google." They're trying to kill the AEO-as-separate-discipline narrative for their own platform. But notice what they're NOT talking about — ChatGPT, Perplexity, Claude, Gemini standalone. Our tool covers all of those. Two things jumped out: (1) "Query fan-out" — Google described exactly what we do (generate 8 related queries from one user query). We should use this language front and center in our UI. (2) "Non-commodity content" — Google explicitly says generic "7 tips" articles don't work anymore. Our action plan should stop saying "add a comparison section" and instead say "add a first-hand expert take that AI engines will cite as a non-commodity source." Google's doc actually validates our product: it tells brands WHAT to do but doesn't show WHERE they stand. We show the WHERE. Also: `SERPER_API_KEY` is already in the env, unused. Serper can fetch Google AI Overviews. Adding Google AIO as a third platform costs almost nothing since the key is already there.

---

## 2026-06-30 — Add Google AIO as 3rd Platform

**Prompt:** "yes, if its less cost, then okay. So we are not adding score?"

**Reasoning:** Scores absolutely stay — that's a core part of the product. The point about showing actual AI answers is our differentiator ON TOP of scores, not instead of them. On Google AIO cost: Serper API costs $0.001 per search. 3 prompts per run = less than half a cent extra. The Serper key is already in `.env` and confirmed working. This makes us a 3-platform tool (ChatGPT + Gemini + Google AI Overviews) while competitors are mostly GPT/Perplexity-only. The UI becomes: ChatGPT [score] · Gemini [score] · Google AIO [score]. Also: the robots.txt crawler check was added at the same time — checking if GPTBot, Google-Extended, ClaudeBot, PerplexityBot are blocked, since many brands accidentally block AI crawlers and wonder why they're not cited.

---

## 2026-07-01 — Diagnostic Results: Why Not Ranking, Why Competitors Rank, What To Do

**Prompt:** "I want the full analysis of their website, just have a separate input output file and my instructions as well, going forward we are going to analyse each input and output going forward, this is to fine tune the output. Right now give me the reasoning here — why are you choosing Notion, Trello, Asana as competitors, what's the relation?"

**Reasoning:** The current results page shows scores + a prompt table, but doesn't explain WHY the user is or isn't being cited. The results needed to be a diagnostic story: (1) your score, (2) why you're missing — showing actual LLM quotes that cited competitors instead of you, (3) why competitors ARE cited — quoting the LLM answer that got them mentioned, (4) what to do. All the data already existed in the API response — this was purely a UI/UX restructuring. The results should tell a story, not just show a table.

---

## 2026-07-01 — 90 Seconds Latency + URL-Only Input

**Prompt:** "right now, it's taking more than 90 seconds in this page, why? there is so much latency, I want it to be less than 5 seconds. also leave the 'prompt' in the input bar, only website url should be the input"

**Reasoning:** The 90s problem: 3 sequential OpenAI calls before LLM queries (~8-12s each), then 8 Gemini calls with a 5 RPM rate limit — after 5 calls in a minute, the next 3 get 429 errors with "retry in 36s". That's where the 90s comes from. 5 seconds is not achievable with live external API calls (a single GPT call takes 2-4s). A realistic target is 15-25 seconds. Biggest wins: (1) combine 3 prep GPT calls into 1 combined call returning description + competitors + prompts, (2) reduce prompts from 8 to 3 (cuts LLM calls from 16 to 6), (3) lower Gemini p-limit from 5 to 2 to avoid rate limit cascades. On URL-only: removed keyword mode entirely — the input now only accepts website URLs, examples changed to domains only, KeywordModeResult removed from results.

---

## 2026-07-01 — Dashboard Bugs: No Action Plan, Wrong Leaderboard, SoloBuild

**Prompt:** "why is there no action plan? why are Help Scout, Zendesk, Freshdesk appearing? SoloBuild is not even relevant to CopilotVerse — fix everything"

**Reasoning:** Three separate root causes: (1) Action Plan empty — we removed `analyzeBlogVsLLMs` and `generateActions` when stripping blog analysis. The `actions` field was removed from the server response, so run files have no actions. Fix: add `generateActionsOpenAI()` using gpt-4o-mini — same output, no Anthropic key needed. (2) Wrong leaderboard brands — the dashboard leaderboard aggregated `allBrandPcts` from ALL runs, including old keyword-mode runs ("top customer service tools") that had completely different brand sets. Fix: leaderboard should only use the latest run's brands. (3) SoloBuild as top competitor — GPT-4o-mini was picking obscure/irrelevant competitors AND when all brands score 0%, the "top competitor" stat picks the first one in the array regardless. Fix: suppress display when topCompetitorPct is 0, improve competitor prompt.

---

## 2026-07-02 — Rebrand to Peach + Remove Version Toggle + Results Persistence

**Prompt:** "change the name from visibility.ai to 'Peach'. Also delete v1, v2 can be v1, v3 can be v1. Also can't Supabase store results? What's the use of Supabase then?"

**Reasoning:** (1) Rebrand: removed AEO badge, changed "Visibility.ai" → "Peach" in Navbar + Footer. (2) Versions: V1 is dead legacy, V2 already points to V3 (AppV2 re-exports AppV3). Removing the toggle entirely — `main.jsx` now renders AppV3 directly. One clean version. (3) On Supabase for results: Supabase will store runs per user once auth is wired (runs retrievable from any device). localStorage bridges the gap now. After each run, result is saved to `localStorage('peach_last_result')` — survives navigation. When user clicks "Check my AI visibility" from homepage, localStorage is cleared so they get the fresh input form. Only "← New report" button clears results intentionally.

---

## 2026-07-02 — Numbers Mismatch vs VisibAI

**Prompt:** "Analyse my tool against these tools, why the numbers mismatch especially the AI visibility score"
*(Shared VisibAI screenshots showing hiverhq.com at 39/100, Peach showing 0%)*

**Reasoning:** Two separate issues. On the score mismatch — VisibAI uses 3 query types: Branded (100% — "Hiver demo for businesses" obviously returns Hiver), Contextual (0%), Blind (0%). Their 39/100 is a weighted average. Our 0% is only the blind score — generic category queries where no brand name is mentioned. Both tools agree Hiver scores 0% on blind/generic queries. VisibAI inflates the score with branded queries. Our 0% is more honest. On the competitor name bug — Peach showed "AI-powered cus...", "AI-driven multi-...", "Intelligent ticke..." as competitors. These are category descriptions, not brand names. GPT-4o-mini misinterpreted "competitors within this sub-category" as "what are similar sub-category descriptions" rather than "what are the brand names of companies in that niche." Zendesk and Intercom didn't appear because the prompt wasn't explicit that it wanted brand names of actual companies. Added fallback: after querying LLMs, extract actual brand names mentioned in the AI answers — those become the competitors if the pre-selected ones all score 0%.

---

## 2026-07-02 — Check My AI Visibility Goes to Report Instead of Input

**Prompt:** "when I click 'check my AI visibility', it directly goes to the report, ideally it should go to input page where users can enter their website"

**Reasoning:** The "Check my AI visibility" CTA on the homepage links to `/app`. Because we added localStorage persistence (restoring the last result on page load), navigating to `/app` restores the previous result instead of showing the fresh input form. The fix: homepage CTA buttons and the "Sign in" navbar link clear localStorage before navigating to `/app`. Only "View Dashboard →" (from results) does NOT clear it — so results survive when the user goes to the dashboard and comes back. Only "← New report" clears them intentionally.

---

## 2026-07-02 — Show Analysis Progress Instead of Blank Spinner

**Prompt:** "instead of this in the UI, you can show what you are analysing, how you are analysing in the UI, since it's taking 30 seconds, it's actually too much"

**Reasoning:** A blank spinner for 30 seconds is a bad UX — users don't know if anything is happening. The fix: a step-by-step progress list where each step lights up as time passes. Steps are timer-based and calibrated to match actual processing time: Fetching page (2.5s) → Identifying niche (5s) → Generating queries (3s) → Asking ChatGPT (8s) → Asking Gemini (8s) → Scoring (2s) → Building action plan (5s). Each step shows: completed (green tick), active (spinning with detail text), pending (gray). This makes the wait feel transparent and productive rather than dead.

---

## 2026-07-03 — Pricing Page, Features Page, Login Page

**Prompt:** "I want something like [InfuseOS pricing] downloadable for users. Also let's set up the pricing page. Free separately at the bottom, plans at $89/$199/$349, 4 plans total. Update features based on what we've built. Remove Resources from nav."

**Reasoning:** Built three new pages: (1) `/pricing` — 3 tiers (Starter $89 / Growth $199 / Scale $349) + Enterprise row + free section at bottom. Annual toggle (÷12×10). Real LLM logo SVGs inline (no CDN) — OpenAI, Gemini, Google G, Anthropic diamond. FAQs below free section. (2) `/features` — 12 square cards for actual built capabilities: AI Visibility Score, Real AI Answers, Competitor Comparison, Gap Opportunities, Action Plan, Crawler Audit, AI Crawler Preview, Top Cited Sources, Multi-Platform Coverage, Export & Share, Dashboard, Buyer-Intent Queries. (3) Nav cleanup: removed Resources dropdown, kept Features + Pricing only. Also fixed a routing bug — Navbar received `version="v2"` from AppV3 Layout, turning pricingLink into `/v2/pricing` (404). Fix: removed `version="v2"` from `<Navbar />` in AppV3 Layout.

---

## 2026-07-03 — Login Page + Google OAuth

**Prompt:** "see visib ai page [login screenshot]. Also it's PeachZ not Peach. How to get Google OAuth credentials?"

**Reasoning:** Built `/login` page matching VisibAI's design — standalone (no Navbar), email magic link via `supabase.auth.signInWithOtp`, Google button stubbed with "coming soon" message. States: signin / signup / check-email. Added `/signup` route also pointing to Login. Google OAuth walkthrough: Google Cloud Console → create project → APIs & Services → OAuth Consent Screen → Credentials → OAuth 2.0 Client ID → add callback URL in Supabase Auth dashboard → paste client ID + secret → enable Google provider. User will provide credentials; UI already in place.

---

## 2026-07-03 — Blog Outlines in Action Cards

**Prompt:** "while giving the action plan, let's give them a list of blogs and a rough outline as well with H1/H2/H3 structure. Want this as a toggle."

**Reasoning:** Each content action already targets a specific gap — the natural next step is "what to write." Extended `generateActionsOpenAI` to return `blogs: [{title, h1, outline: [{h2, h3s}]}]` per action (2 blog ideas each). Bumped `max_tokens` 900→2500 to fit the extra content. No new API endpoint — `blogs` is just a new field on each action object already in the response. Frontend: added `BlogOutlineCard` component + toggle at bottom of each `ActionCard`. Old cached results without `blogs` silently show nothing (guard: `blogs.length > 0`). The blog outlines are specific to the gap + brand — not generic content templates — so AI engines would want to cite them as credible sources.

---

## 2026-07-04 — 8 Prompts Per Run (was 3)

**Prompt:** "need 8-10 prompt by prompt breakdown"

**Reasoning:** 3 prompts gave too narrow a picture — only best-of queries, missing comparison angles, use-case-specific queries, and audience-specific queries. 8 prompts covers the full buyer journey: best-of lists, direct comparisons, problem-solution queries, audience-specific ("for solopreneurs", "for agencies"), and feature-specific queries. This means 16 LLM calls per run (8 GPT + 8 Gemini). OpenAI handles it in 2 batches of 5 at ~6-8s total. Gemini at 5 RPM free tier is the bottleneck — 8 calls with p-limit 2 means 4 sequential pairs, estimated 20-30s. Total run time moves from ~25s to 35-50s. Updated loading screen step timings to reflect this (ChatGPT step: 8s→14s, Gemini step: 8s→22s), updated the footer note from "20-35 seconds" to "35-50 seconds", and updated the platform chip from "3 buyer questions" to "8 buyer questions". `analyzePageAndPrepare` now generates 8 prompts with varied styles, max_tokens bumped to 1200.

---

## 2026-07-04 — All LLM Answers Per Prompt, Competitor Detection Fix

**Prompt:** "mention 4 answers each here / for copilotverse.io, fiverr is not the competitor, earlier you gave notion, airtable, now fiverr"

**Reasoning:** (1) The "Where AI doesn't mention you" section was showing only the FIRST LLM's answer snippet per prompt (it broke after finding one). Changed to collect ALL LLM answers and render each with its platform chip. Now users see ChatGPT + Gemini (+ Google AIO if enabled) answers side by side for every missed prompt — not just one. (2) Fiverr for CopilotVerse: the prompts generated were too generic ("how to manage a solo startup effectively") — generic prompts make LLMs cite general tools (Fiverr = hire help for your startup). Root fix: added explicit instruction to prompt generation — buyer queries must reflect searching for SOFTWARE/AI tools, not general business advice. Also added Fiverr/Upwork/Toptal/Freelancer to the competitor exclusion list. The distinction: "best AI workspace for solopreneurs" → AI software tools. "how to manage solo business" → Fiverr, Notion, etc.

---

*This file is updated automatically after every user prompt going forward.*

---

## 2026-07-07 — Domain Change: trypeachx → gotopeach

**Prompt:** "I have changed trypeachx to gotopeach — let's change everything. Also after every time I prompt here, CLAUDE.md and PROMPTS.md should be automatically saved."

**Reasoning:** `trypeachx` was only ever a Vercel subdomain — it was never hardcoded in the source files, so no mass-replace was needed. The only hardcoded reference to a Peach domain was `hello@peach.so` in Pricing.jsx → updated to `hello@gotopeach.com`. Updated CLAUDE.md with new domain note. Created the auto-save rule in memory and CLAUDE.md: after every prompt, append to PROMPTS.md and update CLAUDE.md if new decisions were made.

---

## 2026-07-08 — Results Page Tab Redesign + Bug Fixes

**Prompts (session):**
- "lets change some major output stuff" → screenshots of Profound.io-style dashboard
- "need prompt library for list of keywords / need brand keywords / also the user should enter the prompts / see citations tab / see site audit"
- "this was the error — Unexpected token 'A', An error o... is not valid JSON"
- "yes, build"
- "update claude md, prompts md, and push all to git"

**Reasoning:**

**Tab redesign:** Replaced 4-tab layout (Overview / AI Answers / Site Audit / Action plan) with a 6-tab layout matching the Profound.io-style dashboard: Overview · Prompts · Competitors · Citations · Growth Actions · Site Audit. All new tabs are built purely from existing `result` data — no new backend calls.

**Prompts tab:** Prompt library table shows all 8 auto-generated prompts with LLM status dots (green=cited, red=not cited per platform), visibility %, and cited domain count. Custom prompts can be added via "+ Add prompt" modal (intent, priority, persona fields) or "⚡ Generate prompts" modal. Both stored in localStorage. Brand keywords section below with chip UI, 20-keyword cap.

**Competitors tab:** Per-competitor card with citation rate, bar vs brand rate, and up to 2 evidence quote snippets from actual LLM answers.

**Citations tab:** Full domain analysis — KPI row (influential domains, cited URLs, competitor citations, third-party opportunities), platform citation mix stacked bars per LLM, citation source split bar, paginated top domains table with ownership classification (your domain / competitor / third-party), top cited prompts table.

**JSON crash fix:** The "Unexpected token 'A'" error was Vercel returning an HTML timeout page when the 16-LLM-call request hit the 60s serverless limit. Fix: frontend now reads response as text first, wraps JSON.parse in try/catch, shows clean error. Added 15s per-question timeout on GPT and Gemini calls via Promise.race. Added 90s AbortController on the client fetch.

**CTA fix:** All "Check your AI visibility" buttons across Home, Features, Blog, Pricing now go to `/app` directly. The bug was that `AppV3.jsx` uses `HomeV2` (pages/v2/Home.jsx) — the original pages/Home.jsx was already fixed but v2/Home.jsx still had `/login` links.

**Google OAuth:** Wired via Supabase `signInWithOAuth`. Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel env (VITE_ prefix so Vite bakes them into the JS bundle at build time).

---

## 2026-08-17 — Session Gap Discovered, Dodo Checkout Broken, Competitors Wrong & Unstable

**Prompts (session):** "where are we right now with peach?" → "check total payments and complete analysis, check recent conversation in the last 24 hours" → "Dodo payments not going through, even after adding product IDs — need to run a test payment. Also competitors are wrong when you run a website on Peach." → screenshot of zop.dev Competitors tab (CloudHealth/CloudCheckr/Turbonomic — cloud cost tools) → "competitors change day to day for the same site, if my customer sees this what happens?" → screenshot of Google AI Overview for "zop.dev competitors" (Humanitec/Cortex/Rely.io/Vercel/Render/Rancher — IDP tools) → G2's zopdev alternatives page (GitHub/GitLab/Red Hat Ansible/CloudBees — DevOps/CI-CD tools).

**Reasoning:** First discovered this auto-save rule (added 2026-07-07) had silently stopped: `PROMPTS.md` was frozen at 2026-07-08 while `CLAUDE.md` kept getting dated entries through 2026-07-22, then nothing after — no git commits or file changes existed in the prior 24h either. User confirmed going forward: all work stays local/uncommitted until they explicitly say to push or deploy; no fixes applied without their sign-off first; auto-save must resume every turn, in both files, so a brand-new chat session can recover full context without the user re-explaining.

**Dodo Payments root cause:** `DODO_ENV` is empty in `.env` → `server.js:422` always forces `test_mode` regardless of intent. If the pasted `DODO_STARTER_PRODUCT_ID`/`DODO_GROWTH_PRODUCT_ID` were created in Dodo's live dashboard (or vice versa vs. where `DODO_API_KEY` lives), `dodo.checkoutSessions.create()` throws — the real error is only visible in server console logs (`console.error('Dodo checkout error:', err)`), never surfaced to the browser (generic "Failed to create checkout session" shown instead). `DODO_WEBHOOK_SECRET` is also empty, so `/api/webhooks/dodo` 503s on any incoming webhook — even a successful payment wouldn't update `profiles.subscription_status`.

**Competitor bug root cause (two separate issues):** (1) `server.js:159-174` has a fallback (`extractCompetitors()` in `competitorExtractor.js`) that fires whenever all preset competitors score 0% visibility — a common case — and it has zero vendor-only/exclusion-list filtering, silently overwriting the good Buyer-Test competitor list. Confirmed via `output/runs/2026-08-09T00-54-39-copilotverse-io.json`: Airtable appeared despite being explicitly blocklisted in the main prompt — could only have come from this unguarded fallback. (2) `analyzePageAndPrepare` in `competitorExtractor.js` never got `temperature: 0` (unlike the AEO query clients, fixed in commit f18bf3f) — it runs at OpenAI's default 1.0, so the sub-category guess (and therefore the whole competitor list) can change on every single run for the same URL. Live proof: zop.dev got 3 different "correct" competitor sets from 3 different sources (Peach: FinOps tools; Google AIO: IDP tools; G2: DevOps/CI-CD tools) — zop.dev genuinely bundles multiple product lines (ZopDay=IDP, ZopNight=FinOps) under one domain, so no single category is "the" right answer.

**Decided fix approach:** rather than forcing one guessed category per run (which will always be arguable for multi-product sites), detect when a page clearly emphasizes more than one distinct product line and surface competitors grouped per category. Plus, regardless of category strategy: set `temperature: 0` on the prep call, and remove/constrain the unguarded fallback so blocklisted names can never reappear. Full plan written to `.claude/plans/where-are-we-right-squishy-twilight.md`, approved by user.

**Implemented and verified same session (all uncommitted, local only):**
- `src/competitorExtractor.js`: `analyzePageAndPrepare` now returns `categories: [{category, competitors}]` (1-3 entries — most pages return 1), plus a flattened/deduped `competitors` array for scoring backward-compat. Added `temperature: 0` and `seed: 42` to reduce run-to-run variance. Rewrote `extractCompetitors()` (the 0%-fallback) to carry the same vendor-only + exclusion-list rules as the main prompt, and added `temperature: 0` there too.
- `server.js`: passes `competitorCategories` through in the API response; fallback path now tags results as `{ category: 'Detected from AI answers', competitors: [...] }` instead of silently replacing the flat list with unfiltered names.
- `client/src/pages/v3/VisibilityFlow.jsx`: Competitors tab groups cards under category headers when more than one category is detected; single-category runs render exactly as before (no visual change).
- **Verified live** (3 real re-runs of zop.dev via `/api/v3/analyze`): category label ("Cloud cost optimization platform") was identical across all 3 runs — the main complaint (category flipping day to day) is fixed. Competitor list matched exactly in 2 of 3 runs; GPT-4o is only best-effort deterministic even at `temperature:0`+`seed` per OpenAI's own docs, so some residual variance is expected and not further fixable client-side. Also confirmed zop.dev's current homepage crawl genuinely emphasizes FinOps/cloud-cost messaging up front — so "cloud cost optimization" is a defensible read of the live page content, not an obvious miscategorization; the multi-category UI didn't trigger for zop.dev specifically because its homepage doesn't prominently surface a second named product line in the crawled text.
- **Dodo Payments:** reproduced the failure directly by running the server locally and hitting `/api/checkout` — Dodo's API returns `401 Unauthorized` on `checkoutSessions.create()`, not a product-ID error. Most likely cause: `DODO_API_KEY` is scoped to a different mode (test vs live) than the forced `test_mode` default (since `DODO_ENV` is empty in `.env`). This needs the user to check the Dodo dashboard for which mode their key belongs to — blocked on that, not fixable in code alone. `DODO_WEBHOOK_SECRET` is also still empty.
- Nothing committed or pushed — all changes sit locally per the user's local-only-until-approved instruction.

---

## 2026-08-18 — Article Pipeline: Topics → Outlines → Doc-Style Articles → Publishing

**Prompt:** "in this chat, lets work on the article writing, I need peach to generate 20 articles for the 89 dollar plan, and 40 for the 219 plan lets work here on creating outline, dashboard, article, quality checks and everything, give me the plan" → after seeing the first plan (single-stage outline→article, tied to a run) → detailed correction as a 5-years-experience content writer: topics must be grounded in the site's own recent publishing cadence (don't recommend a sudden spike — e.g. a site posting ~10/month shouldn't jump straight to 40), fall back to competitor research when the site's own content is thin, every proposed topic needs a 2-line reasoning, users need an "Add topic" button, the flow must be three explicit approval stages (topics → editable outlines → article), the article editor should feel like Google Docs (not a markdown box), and "publish" should eventually mean direct CMS integration (WordPress, Webflow, etc.), not copy-paste.

**Reasoning:** Reused everything already live rather than rebuilding: `POST /api/articles/generate` (server.js, GPT-4o style-guide prompt, Supabase quota tracking) and `generateActionsOpenAI`'s blog-outline JSON shape (`actionGenerator.js`) were the existing patterns to extend, not replace. Confirmed via three clarifying questions: cadence guidance stays advisory-only (never blocks the plan's full quota), the editor is genuinely rich-text (new dependency: TipTap), and CMS integrations get a generic adapter architecture now with only WordPress (which already had a working client-side draft-publish flow) as the reference implementation — Webflow/Notion/HubSpot are explicitly out of scope for this pass. Full plan written to `.claude/plans/in-this-chat-lets-squishy-pnueli.md`, approved by user.

**Implemented this session (all uncommitted, local only):**
- **New backend modules:** `src/blogCadenceAnalyzer.js` (sitemap/blog-index crawl → posts-per-month over the last 6 months, `available:false` if no reliable dates found), `src/topicIdeator.js` (batched `gpt-4o-mini` topic generation with 2-line reasoning, Jaccard-overlap dedupe), `src/outlineGenerator.js` (per-topic H1/H2/H3 outline generation), `src/qualityChecks.js` (deterministic checks: word count, banned phrases, outline-heading coverage, CTA presence, brand-mention stuffing — `BANNED_PHRASES` now shared with the generation prompt instead of duplicated), `src/publishers/` (adapter interface + registry, WordPress as the only registered connector, documented as client-side/browser-publishing pattern).
- **`src/googleAIOClient.js`:** added `searchWeb()`, reusing the existing Serper `/search` call but reading `data.organic` — used to research competitor blog topics when the analyzed site's own content is too thin to ground topic ideation in.
- **`server.js`:** added a shared `getArticleQuota(profile)` helper (single source of truth for the 30-day rolling article quota, replacing three places that would otherwise duplicate the math) and `authenticateUser(req)`. New endpoints: `GET /api/v3/runs` (Supabase-backed, user-scoped — replaces reliance on the broken local-fs `/api/runs` for this feature), `GET /api/articles/quota`, `POST /api/articles/topics/generate`, `POST /api/articles/topics` (manual add), `PATCH /api/articles/topics/:id`, `GET /api/articles/topics`, `POST /api/articles/outlines/generate`, `PATCH /api/articles/outlines/:id`, `POST /api/articles/outlines/:id/approve`, `GET /api/articles/outlines`, `GET /api/articles`, `GET /api/articles/:id`, `PATCH /api/articles/:id` (re-runs quality checks on every edit), `POST /api/articles/:id/publish`. Modified `POST /api/articles/generate` to accept an `outlineId` (loads the approved outline + its parent topic) while keeping the legacy direct-fields body shape working unmodified for `ContentBriefModal`. Article limits corrected from `{starter:15, growth:30}` to `{starter:20, growth:40}` everywhere.
- **New Supabase tables (SQL delivered, not yet run by the user):** `sql/article_pipeline_schema.sql` — `article_topics`, `article_outlines`, `publish_targets`, plus new columns on `runs` (`cadence_json`) and `articles` (`outline_id`, `content_html`, `quality_json`, `quality_status`, `word_count`, `publish_status`, `published_target`, `published_at`). RLS policies included. **This SQL has not been run yet — the article pipeline endpoints will fail against a real Supabase project until the user runs it.**
- **Frontend:** `client/src/components/ArticleExportBar.jsx` (extracted from `ContentBriefModal`'s inline copy/WordPress-publish code — now shared by both the ad-hoc modal and the new dashboard tab), `client/src/components/ArticleEditor.jsx` (TipTap rich-text editor, Save re-runs quality checks server-side), `client/src/pages/v3/ArticlesTab.jsx` (the three-stage UI: domain picker, quota meter, cadence banner, topic approve/reject/add, inline outline editor with add/remove H2/H3, per-row article generation and editing). Wired a new `/dashboard` route into `AppV3.jsx` (previously `Dashboard.jsx` existed but had no route) and added "Articles" as a 6th tab in `Dashboard.jsx`. `VisibilityComponents.jsx`'s `BlogOutlineCard` exported for reuse.
- **New dependencies:** `turndown` + `marked` (root, for server-side HTML↔Markdown conversion) and `@tiptap/react` + `@tiptap/pm` + `@tiptap/starter-kit` + `turndown` + `marked` (client).
- **Pricing correction:** `client/src/pages/Pricing.jsx` and `CLAUDE.md`'s pricing table updated from 15/30 to 20/40 articles/month; removed the now-redundant "AI content briefs" lines from the `soon` arrays since outlines are a live feature now. `CLAUDE.md`'s Growth price row also corrected from $199 to $219 to match the live `Pricing.jsx`/checkout code (was already inconsistent before this session).
- **Verified:** `node --check server.js` passes, server boots cleanly with all new imports resolved, `cd client && npm run build` succeeds with no errors.
- **Not yet done / next session:** run `sql/article_pipeline_schema.sql` against the live Supabase project (`olwcmaabbsnqhmbiybsk`) — confirm `runs.id`'s actual type and whether `articles` already has a uuid primary key before running, per the comments at the top of that file; then exercise the full flow end-to-end against a real logged-in session (generate topics → approve → generate outlines → edit → approve → generate article → edit in the rich editor → publish to WordPress) since this session only verified syntax/build, not live behavior against Supabase. Nothing committed or pushed — all changes sit locally per the standing local-only-until-approved instruction.

---

## 2026-08-22 to 2026-08-24 — Dodo Live, Email, and Competitor Grounding

**Prompts (session, spanning several days):** Dodo webhook setup walkthrough (dashboard "Add endpoint" → Custom webhook → subscribed events left empty = all events → signing secret pasted into `.env` → `DODO_WEBHOOK_SECRET` set on Vercel) → Resend email report setup (sending-access API key, DNS records added in GoDaddy: TXT `resend._domainkey`, MX `send`, TXT `send`, verified, `RESEND_API_KEY` set on Vercel) → both redeployed and confirmed working end-to-end on production → user ran a Dodo dashboard test payment (not through our checkout flow) and asked to verify — confirmed via Supabase `profiles` query + Vercel logs that dashboard-only tests never hit `/api/checkout` or the webhook, so the full loop is still unverified; user said "let's not revisit that for now" → "let's check the content for incoming mail for onboarding users" → recommended fixing the Supabase magic-link email template first (first-touch, higher leverage) over building a new custom welcome email, user agreed but this wasn't started → screenshot of a live copilotverse.io run still showing broad platforms (Microsoft/Zendesk/IBM Watson) as competitors → "it's not about this one website... it should crawl the current user's website and give correct competitors" → three systemic fixes (see below) → "vercel prod push" → deployed → "which openai model are we using?" (gpt-4o + gpt-4o-mini; Claude/Perplexity code paths exist but are dead since those API keys are empty) → "what is copilotverse.io and what does it do?" → user compared Peach's competitor list against asking ChatGPT.com the same question directly and asked why they differ.

**Reasoning — three systemic competitor-pipeline fixes (2026-08-22, commits `2eed9fa`, `797b9a0`, `7be2ccb`):**
1. The 0%-fallback (`extractCompetitors`, since removed) extracted brand names straight out of biased LLM-answer text, so generic buyer queries just echoed back whatever big platforms ChatGPT/Gemini happened to mention (Microsoft, Google, Amazon, IBM) — no prompt-wording fix could correct this since the bias was in the source text, not the extraction instructions. Fixed by swapping to the pre-existing but unused `findDirectCompetitors()`, which re-derives competitors independently from the category description using the Buyer Test, instead of extracting from already-generic text.
2. `pageData.metaDesc` was captured by the crawler but silently never passed into the GPT prompt — mattered a lot for JS-rendered sites (Notion, many modern SPAs) where the crawler gets almost no body content but the meta description still carries a real human-written summary.
3. Total crawl failures (vercel.com: no title, no meta, no content at all) meant GPT had zero signal and invented a category from scratch (came back as "customer support software"). Added a fallback to OpenAI's own `web_search_preview` tool (Responses API) when the crawl is this thin — no new vendor needed, reuses the existing OpenAI key.

**Reasoning — grounding competitor selection itself in web search (2026-08-24, commit `650e644`):** even after the above three fixes, user compared Peach's copilotverse.io competitor list (Rasa, LivePerson, Ada, Kore.ai) against typing the same question into ChatGPT.com directly (Deployment Inc, Forward Labs, Corra Labs, PlusB, Agentic Base, AivoraNext, Frontier Agents, Bitontree) — totally different sets. Root cause: `analyzePageAndPrepare` and `findDirectCompetitors` both used plain `chat.completions.create()` with no tools — pure frozen-training-data generation, no web access — while ChatGPT.com's consumer product has live browsing on by default. Fixed by switching both to `client.responses.create()` with `tools: [{ type: 'web_search_preview' }]`, same mechanism as the thin-crawl fallback above, just applied to competitor selection itself rather than only the page description. Discovered mid-implementation: OpenAI's API rejects combining web search with JSON mode (`400 Web Search cannot be used with JSON mode`) — worked around by dropping structured-output mode and relying on the existing "return ONLY valid JSON" prompt instruction + regex extraction (the same pattern already used elsewhere in this file). User explicitly chose to add search to BOTH the primary call and the fallback (not just the fallback) despite the latency/cost tradeoff (~4-6s added per call; full analyze run went from ~21s to ~42s) — verified live that results now include smaller/newer real companies (confirmed `flowtiq.io` is a real AI voice-agent company, not hallucinated) instead of exclusively well-known legacy platforms.

**Prompt:** "how much open ai cost is extra now?" → then: "Keep this in mind. we might need to revert back if the [OpenAI] costs us spending more."

**Reasoning:** Measured real cost directly from live API `usage` + `web_search_call` output items (not estimated) — OpenAI charges a flat $25/1,000 calls ($0.025/call) for `web_search_preview` on gpt-4o, with search-result content itself free (not billed as extra tokens); this flat fee dominates the added cost, not tokens. Confirmed via real calls against copilotverse.io and zop.dev: `analyzePageAndPrepare` makes exactly 1 search call every time it runs (+$0.023/run vs before), `findDirectCompetitors` makes 1 search call when it fires (+$0.025 when triggered). Net: **~2-3.5 cents of extra OpenAI cost per full analysis run**. User flagged this as a **cost watchpoint, not a blocker** — explicitly said Peach may need to revert the web-search-grounding fix (commit `650e644`) later if real OpenAI spend grows too much at scale. **If asked to revert:** the pre-search version used plain `chat.completions.create()` with no tools in both `analyzePageAndPrepare` and `findDirectCompetitors` — reverting means losing the live-search grounding fix that solved the "competitors don't match what ChatGPT.com itself would say" problem, so weigh actual OpenAI billing dashboard numbers against that tradeoff before reverting, not just this estimate.
