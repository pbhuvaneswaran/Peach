# Peach — Product Brief

**Status:** Live in production  
**URL:** gotopeach.com  
**Contact:** hello@gotopeach.com  
**Category:** AEO / GEO SaaS  
**Stack:** Node.js · React · Supabase · Vercel  
**Repo:** github.com/pbhuvaneswaran/VisibilityAI

---

## What It Is

Peach shows marketers and founders exactly where their brand is invisible to AI — and why. Enter a website URL, and Peach crawls it, generates 8 buyer-intent queries, queries ChatGPT + Gemini (+ Google AI Overviews), scores how often the brand appears, identifies who AI recommends instead, and gives a concrete content action plan to fix it.

**Core insight it sells:** AI search (ChatGPT, Gemini, Google AIO) is becoming where buyers discover products. If AI doesn't mention you, you're losing deals invisibly. Peach is the fastest way to diagnose and fix that.

**Keywords:** AEO (Answer Engine Optimization) · GEO (Generative Engine Optimization) · AI Search Visibility · LLM Visibility · AI Citation · Generative Search

---

## Who It's For

**Primary:** Solo marketers, content leads, and founders at B2B SaaS companies (50–500 employees) who care about organic discovery and are starting to hear "AI search" but have no tool to measure it.

**Secondary:** SEO/GEO agencies running visibility audits for clients. They use Peach to generate proof-of-gap reports that justify retainers.

**Personas:** Solo marketer / Founder · SEO & Content Lead · Agency Owner · Marketing Manager

---

## Live Features

| Feature | What it does |
|---|---|
| AI Visibility Score | Brand mention rate across ChatGPT + Gemini across 8 buyer queries. Shown as % with per-LLM breakdown. |
| Competitor Gap Analysis | Identifies which competitors AI cites instead — with the actual LLM answer as evidence. Editable competitor list. |
| Growth Action Plan | 3 AI-generated content actions per run, each with 2 blog topic outlines. One-click article generation (GPT-4o). |
| Article Generator | Full blog posts in ClickUp/Hiver editorial style. Export as Markdown, HTML, or publish directly to WordPress. |
| Citations Tab | Top cited domains, platform citation mix, source split — all derived from real LLM answer text. |
| Google AIO Tracking | Optional 3rd platform via Serper API. Checks Google AI Overviews for brand mentions alongside ChatGPT + Gemini. |
| Auth & Onboarding | Magic link + Google OAuth via Supabase. New users flow through onboarding (company, industry, role). |
| Site Audit | Robots.txt check for GPTBot, Google-Extended, ClaudeBot, PerplexityBot — tells if AI crawlers are blocked. |
| Prompts Tab | Custom prompt library, brand keywords, per-prompt LLM status dots, "+ Add prompt" and "Generate prompts" modals. |

**Run stats:** 8 prompts per run · 16 LLM calls · Results in ~90 seconds · localStorage persistence

---

## Pricing

| Plan | Monthly | Annual | Trial | What's included |
|---|---|---|---|---|
| Free | $0 | — | 1 run, no account | ChatGPT + Gemini · 8 prompts · full report |
| Starter | $89/mo | $74/mo | **15-day free, no card** | 3 AI engines · 1 domain · 40 prompts/mo · 15 articles/mo · 1 seat |
| Growth | $219/mo | $183/mo | **30-day free, no card** | + Perplexity · 5 domains · 80 prompts/mo · 3 seats · priority support |
| Enterprise | Custom | — | — | All platforms · unlimited prompts · custom seats |

Annual saves ~17%. Payments via Dodo Payments (wiring in progress).

---

## Competitive Positioning

| Competitor | What they do | Peach's edge |
|---|---|---|
| Profound.io | AI search monitoring, enterprise-focused | No raw LLM answers shown; much higher price |
| Otterly.ai | Brand visibility in AI search | No competitor evidence, no content action plan |
| InfuseOS | AEO monitoring | No article generation, no site audit |
| Peec.ai | AI citation tracker | Peach shows full LLM answers at a lower price point |

**Key differentiator:** Peach is the only tool at this price point that shows the *actual AI answer text* per prompt — buyers see exactly what ChatGPT said, not just a yes/no citation count. That's the insight that drives content action.

---

## Roadmap

### Live now
- URL analysis + AI scoring (ChatGPT, Gemini, Google AIO · 8 prompts · competitor gaps · growth actions)
- Article generator + WordPress export (GPT-4o · ClickUp/Hiver editorial style)
- Auth + onboarding + pricing (magic link + Google OAuth · 15/30-day free trials)

### Next
- Dodo Payments checkout (product IDs set · checkout flow wiring in progress)
- Supabase run storage (schema ready · localStorage used as bridge currently)

### Later
- Scheduled weekly monitoring + email alerts (automated re-runs, drop alerts, trend charts)
- Perplexity tracking (on Growth plan · API integration pending)
- PDF export (blocked behind paid plan — modal currently prompts upgrade)

---

## Brand Voice

**Tone:** Direct, confident, data-first. Not hype-y. Peach talks like a smart analyst friend who's done the research — not a growth-hacker or a VC-funded marketing machine.

**Core message:** "AI search is the new Google. If ChatGPT doesn't mention you, buyers you'll never meet are choosing your competitors right now. Here's exactly why — and what to write to fix it."

**Hashtags:** #AEO #GEO #AISearch #AIMarketing #AIVisibility #GenerativeSearch

**Never say:** "revolutionary", "game-changer", "disruptive", "the future of marketing"

---

## Social Content Angles

1. **The silent competitor:** "ChatGPT just recommended your competitor to a buyer who was 30 seconds away from Googling you." (hook post with Peach screenshot)
2. **The invisible brand:** Run a known brand through Peach and screenshot the results — "We tested [Brand]. Here's what ChatGPT says about them." (educational, shareable)
3. **The stat post:** "70% of B2B buyers now ask AI before they Google. Here's how to check if you show up — free." (drives free trial)
4. **The before/after:** Share a Peach report → identify gap → write the content → show the AI answer change in a follow-up.
5. **The industry niche:** Run Peach on 5 tools in a niche (e.g. project management SaaS). Post the ranking. Tag them.
6. **The founder story:** "I built this after realizing my startup was invisible to ChatGPT. Here's what I found — and how I fixed it in 30 days."
7. **Free trial CTA:** "Check your brand's AI visibility free → gotopeach.com. Takes 2 minutes." (with screenshot of score UI)

**Best performing content format:** Screenshots of real Peach results (score page, competitor gaps, action cards) + a 1-line hook + CTA to gotopeach.com.

---

## Luma Event Angles

| Format | Title | CTA |
|---|---|---|
| Workshop | "Is Your Brand Invisible to AI? Live Audit Session" | Attendees bring URLs, Peach runs live on screen |
| Webinar | "AEO vs SEO in 2025 — How to Rank in ChatGPT Answers" | Educational + Peach demo at the end |
| Office Hours | "AI Visibility Clinic" (monthly, 30 min) | Open Zoom, users share results, get live advice |
| Launch event | "Peach: Find Out Why ChatGPT Ignores Your Brand" | Beta cohort invite + 30-day trial for attendees |

**CTA for every Luma event:** Free run at gotopeach.com · Contact: hello@gotopeach.com

---

## Instructions for Claude (this project)

- **Product name is always "Peach"** — not "Peach AI", not "PeachX". Domain is gotopeach.com.
- **Free run = no account needed.** Paid plans (Starter/Growth) have 15- and 30-day free trials with no credit card. Use these facts in all CTAs.
- **The differentiator to emphasize:** Peach shows the actual AI answer text, not just a citation count. No competitor at this price point does this.
- **Category keywords to use:** AEO, GEO, AI search visibility, AI citation, AI brand presence, LLM visibility, generative search.
- **Tone:** Confident, data-backed, no fluff. Talks like a smart analyst — never hype, never "revolutionary", never "game-changer".
- **For social content:** Screenshots of real Peach results (score page, competitor gaps, action cards) are the best content. Always include a clear free CTA → gotopeach.com.
- **For Luma events:** Position workshops as "live audit sessions" — attendees bring URLs, Peach runs live on screen. Offer 30-day trial to all attendees as the event CTA.
- **Contact for partnerships / press:** hello@gotopeach.com
