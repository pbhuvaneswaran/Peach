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

*This file is updated at the end of each session. Going forward: every significant prompt + first reasoning response gets appended here.*
