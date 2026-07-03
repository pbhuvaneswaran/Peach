# Peach — Design Instruction Log

Each entry: the design instructions given, roughly as delivered, plus a short note on what shipped.
Updated after every design session. Companion file to `PROMPTS.md` (product/technical decisions) — this file is the design thinking and exact art-direction instructions behind the UI.

---

## 2026-07-03 — Homepage rebrand + hero iteration

**Instructions (iterative, back-and-forth):**
- Brand name is "PeachZ" for now — add a logo before the word, try a different, non-mundane font for the wordmark.
- Change headline "Does your brand show up when AI is asked about you?" — direction: "Get cited in LLMs, something like this."
- Don't show the LLM mentions (badges) at the top of the hero.
- Remove the "AEO Visibility tracks where your brand appears..." subheading paragraph.
- Remove "See pricing" secondary CTA everywhere on the homepage.
- Reword the primary CTA away from "AI visibility" phrasing — "lets just check your ...? fill something interesting here, dont add ai visibility."
- Remove the stats bar ("3 AI engines / 10 questions / < 3 min / Real-time").
- Update "How it works" to reflect the actual current product working status (not the old brand+competitors+category flow).
- Navbar: only Sign in + Try for free.

**Shipped:** PeachZ wordmark in italic Fraunces with a small gradient/peach logo mark; hero rewritten to "Get cited in LLMs." with a single "Check your citation score →" CTA (later corrected — see below); stats bar removed; "How it works" rewritten to the real 3-step flow (paste URL → generate buyer prompts → scored across ChatGPT/Gemini/Google AIO); nav simplified to Sign in + Try for free.

---

## 2026-07-03 — Full homepage content + UI redesign (final copy + Peach palette)

**Instructions (verbatim):**

> Final content for homepage and instructions
>
> First fold copy
> Headline: Your customers are not just searching on Google anymore.
> Body: They are asking: "What is the best ecommerce tool?" "Which tool is better for solopreneurs?" "What are the alternatives to [competitor]?"
> Closing copy: AI gives them a list. Are you on it? PeachZ tells you whether that brand is you.
> CTA: Check your AI visibility →
> Microcopy: Free report · Results in under 3 minutes
>
> UI instructions: Create a clean, premium first-fold hero section for an AI visibility platform called PeachZ. Centered layout, generous whitespace, white background. Small purple eyebrow above the headline: "AI visibility for modern brands". Large bold dark-navy headline. Lead-in "They are asking:". Three example questions stacked in a soft light-gray/pale-purple panel, quotation marks, comfortable spacing. "AI gives them a list. Are you on it?" — bold only "Are you on it?". Supporting sentence "PeachZ tells you whether that brand is you." One prominent purple CTA button. Small muted microcopy under the button. Minimal visual language: dark navy typography, purple primary accent, rounded corners, subtle borders, no stock photos/illustrations/gradients. Narrow readable width, vertically centered, generous padding. Mobile: same order, full-width prompt panel.
>
> Second fold — "Built for teams that need to be in the answer." Centered heading, no subheading. 4 equal cards in 2×2 grid desktop / stacked mobile: Content & SEO, Growth Teams, Founders & Marketers, Agencies (each with small outline icon + bold title + one supporting sentence). Subtle borders/shadows/rounded corners, same navy/purple accents, no gradients/illustrations, cards feel clickable but no buttons inside.
>
> Third fold — FAQ: "What is a citation score?" / "Which AI platforms does PeachZ track?" / "Is PeachZ an SEO tool?" / "Can I compare my visibility with competitors?" / "Does PeachZ tell me what to fix?"
>
> **UI redesign instructions for PeachZ (full palette + section specs):**
> Redesign the existing PeachZ homepage UI while keeping content/section order broadly intact. Not a generic purple SaaS landing page — premium, editorial, warm, modern, like a new category of AI visibility intelligence.
>
> Palette: page background warm off-white/cream `#FCFAF6`; hero background very pale lavender `#F1EDFF`; dark ink navy text `#14182B`; primary accent royal violet `#5B3DF5`; secondary accent soft peach `#FFD8C2`; light card background white with slight lavender tint; borders soft gray-lilac; supporting text muted slate `#677085`. Avoid bright neon purple, heavy gradients, dark dashboards, stock images, generic AI illustrations. Rounded but not overly pill-shaped — polished, slightly editorial.
>
> Navigation: clean floating top bar, logo left, Features/Pricing center, Sign in + Try for free right, warm cream background behind navbar, thin border/faint shadow below, "Try for free" royal violet with white text, PeachZ logo with peach/lavender icon + elegant dark text, slightly more horizontal padding.
>
> Hero: two-column layout. Left = eyebrow, headline, "They are asking:" + 3 stacked question cards, "AI gives them a list. Are you on it?", "PeachZ tells you whether that brand is you.", CTA, microcopy. Right = polished product-preview card "Your AI Visibility Snapshot" — overall score 38%, trend +12% this month, "Mentioned in" ChatGPT/Gemini/Perplexity/Google AI Overviews, competitor comparison bars, peach-colored insight callout ("You are missing from 'best ecommerce tool' prompts." / "Competitor A is cited in 4 of 5 answers."). Soft lilac backgrounds, white cards, royal violet highlights, peach for warnings/opportunities. Reduce excessive empty space vs. current version.
>
> "How it works": full-width pale lavender section, heading "See where AI puts you — in three steps.", 3 horizontal cards (not vertical list) with large subtle numbers 01/02/03, small icon each, thin connecting/dotted line between cards on desktop, stack on mobile, no dashboard screenshot here (hero already has one).
>
> "What you get": warm cream background, heading + subheading, **bento grid** (not 6 equal cards) — 2 large featured cards (Visibility Score w/ mini chart, Content Action Plan), medium cards (Competitor Citation Gaps, Buyer Questions That Matter, Real AI Answers), small card (Full Question Log). Peach accent only for "opportunity"/"gap" cards.
>
> "Who it's for": white background, centered heading, 4 compact cards 2×2 grid, small role icon + tiny royal-violet accent line each.
>
> Visual style rules: large confident headings, tighter vertical spacing, each section visually distinct via background changes (cream/lavender/white), icons sparingly and consistently, avoid excessive rounded rectangles, avoid too many purple buttons (only primary actions in royal violet), peach only as "insight"/"opportunity" signal, subtle hover states (slight lift, soft shadow, violet border), simple product-style data visuals not fake dashboards, clean sans-serif body, editorial serif/italic accent reserved for the PeachZ logo or select highlighted phrases only.
>
> FAQ: compact accordion section near the bottom, warm cream or very pale lavender background, centered heading "Questions before you check your visibility.", optional muted subheading, single-column accordion max-width ~760px, question bold dark navy + small plus icon, answer reveals on click, white rows with subtle lilac borders and 12–16px rounded corners, comfortable spacing, light lavender hover, only one item open at a time, first question open by default, no heavy shadows/illustrations. Final line: "Still curious? Check your AI visibility in under 3 minutes." + small purple text CTA "Get your free report →".
>
> Tone: "AI search is changing how customers discover brands. PeachZ helps you see it before you lose visibility."

**Shipped:** Full repaint to the ivory/lavender/violet/peach palette across Navbar, Footer, and Home — hero (eyebrow + headline + question cards + CTA + snapshot preview), "How it works" 3-card row with numerals, bento-grid "What you get", 2×2 "Who it's for", accordion FAQ with first item open by default and the closing CTA line. Palette constants (`#FCFAF6`, `#F1EDFF`, `#14182B`, `#5B3DF5`, `#FFD8C2`, `#677085`) became the shared design system reused in every later page (Pricing, loading screen, report pages).

---

## 2026-07-04 — Homepage hero iteration: snapshot card → action-plan teaser → scan card

**Instructions (iterative):**
- "All good, just give some other color na? dont want purple" (re: the Visibility Snapshot card's violet accents in the hero).
- Add the "What is a citation score?" FAQ back in verbatim, including the "It's basically useless... that's why we don't add that in PeachZ" line — and correspondingly, drop "citation score" language from CTA copy everywhere (back to "Check your AI visibility →").
- "dont show snapchat [snapshot] on the homepage" — "show a gist of the action plan they will get, but show and blur a little."
- Next iteration: "no this looks bad, have the image in the right side, not the gist, somethig else, small and dynamuc" — bring back two columns, right side = something small and dynamic (not the action-plan gist).
- Say "They are asking LLMs" instead of "They are asking:".
- Question boxes can be narrower; text inside should appear dynamically (type on, one by one) rather than static.
- Right-side card can be a little bigger; the questions shown there should differ from the left column's questions (not repetitive).

**Shipped:** Extracted platform icons/chips/scan-glow animation into a shared `client/src/components/llmPlatforms.jsx` (used by both Home and Pricing). Hero right side is now a small `ScanCard` — pulsing "Scanning AI answer engines" indicator, a different rotating question set than the left column, and the animated platform chip row. Left-column question cards type out letter-by-letter on a loop (staggered per card) via a small `TypewriterText` component, capped at `max-w-md`.

---

## 2026-07-04 — Pricing page full redesign

**Instructions (verbatim):**

> Pricing cards
> Main layout: 3-card layout for Starter, Growth, Scale. Enterprise in a separate horizontal section below, not squeezed into the same row. Desktop: three equal cards in one row. Tablet: 2-column. Mobile: one card per row. Generous gaps (24–32px). Cards taller only where needed — don't force identical height via tiny type.
>
> Card styling: white background, ~20px rounded corners, soft lavender border, very subtle shadow, ≥28–32px internal padding, plan title/price/CTA easy to scan, more vertical spacing between groups.
>
> Growth plan (recommended, but not a dark full-card background): thin royal-violet border, small "Most popular" badge above the card, pale lavender background tint, royal-violet CTA, small royal-violet line at top of card.
>
> Pricing hierarchy inside each card, in order: Plan name → short audience label → price → "AI platforms included" row → one clear usage limit → "What's included" feature group → CTA. Don't make every feature look equally important.
>
> Feature list cleanup: show only the 5 most valuable features by default, "See all features ↓" link expands the rest inline.
>
> Recommended feature grouping — Starter: 40 prompts/mo, 1 domain, AI Visibility Report, Gap Opportunities, Action Plan, CSV export, Email support. Growth: 80 prompts/mo, 5 domains, everything in Starter + Competitor analysis, Google AI Overview tracking, AI crawler audit, Dashboard trends, Priority support. Scale: 150 prompts/mo, 20 domains, everything in Growth + Weekly monitoring, PDF report download, 3 team seats, Dedicated onboarding call. Subtle divider between "Usage" and "Included."
>
> Enterprise section: moved out of the card row into a wide horizontal section below, pale lavender background, large rounded card, two columns. Left: "Enterprise — for large teams, agencies, and white-label workflows" + one line of copy. Right: short list (Unlimited prompts, Unlimited domains, White-label reports, Custom integrations, Claude tracking, SLA support) + outline violet "Talk to us →" button — should feel premium, not like an empty dashed card.
>
> Free report section: full-width soft peach background block, centered content, plenty of vertical padding, wide but not too tall. Label "Not ready to commit?", heading "Start with one free visibility report.", body copy, three compact benefit pills (AI visibility score / Competitor gaps / Content action plan), CTA "Check your AI visibility →" (always royal violet, never dark navy here), microcopy "No credit card · Results in under 3 minutes".
>
> FAQ: below free-report section, white or warm cream background, centered heading with more top padding, max-width ~760px, single-column accordion, white rows, 16px rounded corners, soft lavender border, 16–20px vertical padding, question in deep navy, small violet plus icon, only one open at a time, first item open by default. Heading "Questions before you choose a plan." / subheading "Everything you need to know before tracking your AI visibility."
>
> Spacing/typography: increase whitespace ~25–35% over the previous version, never shrink font to fit more content, 16px minimum body text, 22–24px plan prices, 28–32px card padding, 64–96px vertical padding between major sections, large bold dark-navy headings, muted text sparingly with better contrast, avoid dense bullet lists/small icons everywhere.
>
> Desired feeling: "This is a clear, confident product for marketers who need to understand a new channel." Not: "Here is a crowded list of AI features and plan limits."
>
> **Follow-up: AI platform logos and subtle motion.** Keep LLM names and logos visible — they make the value tangible; don't hide them in small feature text. Inside every pricing card, directly below the price, add "Track visibility across" with branded logo chips (official logo + name, soft white/pale-lilac background, rounded corners, subtle border, comfortable padding — not tiny icons). Plan-specific display: Starter → ChatGPT, Gemini, Google AI Overviews. Growth → + Perplexity. Scale → + Claude. Enterprise → all platforms + "Plus custom monitoring options" label.
>
> Make the logos feel alive but subtle: quiet "signal scanning" motion — every 4–6s one logo chip softly brightens with a faint royal-violet glow that moves from one platform to the next, staggered (not all glowing together), no bounce/spin/flash. On hover: 2–3px lift + subtle lavender shadow + tooltip "Track visibility in [Platform Name]".
>
> Optional micro-detail: small animated status dot + label "Scanning AI answer engines" above the chips, understated violet pulse.
>
> Hero/free-report platform strip: in the free-report section, below the headline, add a visual platform row "See how your brand appears across the AI answers buyers trust." then ChatGPT · Gemini · Perplexity · Google AI Overviews · Claude with official icons + names, faint moving highlight traveling across the row periodically. Do not imply PeachZ is officially partnered with or endorsed by any of these companies.

**Shipped:** Full rebuild of `client/src/pages/Pricing.jsx` — 3-card row (Starter/Growth/Scale) + separate Enterprise section + peach free-report block + FAQ, all on the shared palette. Added a Perplexity brand icon and built the animated platform-chip system (`chip-scan` CSS keyframe, staggered per-chip glow, hover tooltip) in the new shared `llmPlatforms.jsx` module — reused later on the homepage hero and the analysis loading screen.

---

## 2026-07-04 — Waiting / analysis page redesign

**Instructions (verbatim):**

> Redesign the PeachZ waiting / analysis page. Keep the page focused, calm, and reassuring. It should feel like PeachZ is doing real work — not showing a generic loading screen.
>
> Use the existing visual direction: warm off-white background, deep ink navy text, royal violet accent, soft peach for insights, pale lavender cards and borders, clean spacious layout, no busy dashboard visuals.
>
> Top area: small uppercase eyebrow "ANALYSING", below it the entered domain in large bold text, short supportive line "We're checking how AI understands, mentions, and recommends your brand." Compact, centered — not too tall.
>
> Main progress card: one large white card, soft lavender border, 20–24px rounded corners, generous internal padding. Do not fade inactive steps so much they become hard to read — completed/active/upcoming all remain legible.
>
> Exact steps: Reading your website (Understanding what you offer and who it is for.) → Identifying your category (Finding the category, use cases, and competitors AI may compare you with.) → Generating buyer questions (Creating the questions potential customers ask before choosing a tool.) → Checking ChatGPT (Looking for mentions, recommendations, and citations.) → Checking Gemini (Comparing how Gemini describes your brand and category.) → Scoring your visibility (Measuring where you appear and where competitors win.) → Building your action plan (Turning the findings into clear next steps.).
>
> Step states — Completed: green filled circle with white checkmark, title deep navy, supporting text muted gray with a subtle strikethrough on the supporting text only (not the title). Active: violet outlined circle with a slow rotating progress ring, title deep navy, supporting text visible, small "Working" label on the right. Upcoming: pale lavender outlined circle, title medium gray (legible, not nearly invisible), no supporting text until active.
>
> Progress behavior: one step at a time, subtle fade/slide transitions, avoid quick fake progress, thin vertical line connecting the step circles, active step glows gently in violet, no large spinner anywhere.
>
> Platform moment: when reaching "Checking ChatGPT"/"Checking Gemini", reveal small branded platform chips beside the active row — e.g. "ChatGPT • Checking 12 buyer questions" / "Gemini • Checking 12 buyer questions." Official logos where available, small/clean/static except a soft violet scan glow moving across the active chip. Should later support Perplexity, Google AI Overviews, Claude.
>
> Insight carousel: below the progress card, pale lavender or pale peach "Did you know?" panel, small uppercase label "WHILE WE CHECK". Avoid unsourced broad stats — use product-relevant rotating messages instead (5 supplied messages), one at a time with 5 pagination dots, small simple icon per message (no emoji unless the rest of the product uses them consistently).
>
> Bottom reassurance text (exact copy): "Usually takes 20–35 seconds · Real AI checks, not simulated data" — only use the "real, not simulated" claim if technically true. Smaller, centered, muted.
>
> Completion state: replace the active analysis state with a green completion check; compact success card below the progress card — "Your AI visibility report is ready." / "See where AI mentions you, where competitors are winning, and what to fix first." / CTA "View my report →" in royal violet with white text.
>
> Layout/spacing: max content width 760–860px, more breathing room than a cramped screenshot reference, progress card visually dominant, 28–32px card padding, 16–20px spacing between rows, 16px minimum body text, one-time subtle page entrance animation, mobile keeps the vertical step structure with reduced padding.

**Shipped:** Rewrote `AnalysisProgress` in `VisibilityFlow.jsx` with the exact step copy/states above, a `chip-scan`-animated platform chip on the ChatGPT/Gemini steps, a 5-message "WHILE WE CHECK" insight carousel (custom SVG icons, no emoji), and a completion state. This required restructuring `handleRun`'s state flow: previously `result` and `loading=false` landed in the same tick so there was no visible "done" moment — added a `reportReady` flag so the screen holds on the completed progress card + "View my report →" CTA until the user clicks through, instead of snapping straight to the results page.

---

## 2026-07-04 — AI Visibility Report: Overview tab + report header/tabs redesign

**Instructions (verbatim):**

> Redesign this report page to feel more like a premium intelligence product and less like a plain document with stacked cards. Keep the existing report content and tab structure, but improve the hierarchy, spacing, color system, and actionability. The user should understand three things within five seconds: (1) where they are missing from AI answers, (2) which competitor is winning instead, (3) what they should do next.
>
> Palette: background warm ivory `#FCFAF6`, primary text deep ink navy `#14182B`, main brand accent royal violet `#5B3DF5`, soft violet panel `#F1EDFF`, opportunity/warning panel soft peach `#FFF1E7`, success/cited accent soft green `#DCF7E9`, borders pale lavender-gray `#E7E2F0`, supporting text muted slate `#667085`. Avoid dark full-width panels, harsh red alerts, dense dashboard patterns, excessive borders. White cards, subtle shadows, 16–20px corner radius, more whitespace.
>
> Header: max-width ~1180px, two zones. Left: "AI Visibility Report" + metadata line ("Copilotverse · 3 buyer questions · ChatGPT + Gemini") + small status pill "Report generated today". Right: simplified actions — Share, Export dropdown (CSV, PDF), Print, New report — compact secondary buttons with icon + text; "New report" as a royal-violet text link with a left arrow, shouldn't compete visually with the report.
>
> Tabs: keep Overview / AI Answers / Site Audit / "Let's get you cited in LLMs". Sticky on scroll, more vertical spacing, thin divider below, active tab deep navy text + 2px royal-violet underline, inactive muted slate that darkens on hover, "Let's get you cited in LLMs" gets a tiny violet sparkle icon or "Action plan" badge.
>
> Top summary row (3 cards, compact, information-rich, no oversized empty cards): Card 1 "YOUR AI VISIBILITY" — 2/3, "buyer questions where AI mentioned you", small circular progress indicator. Card 2 "BIGGEST GAP" (soft peach bg) — 1, "high-intent prompt where competitors were cited instead", "View gap ↓" link. Card 3 "TOP COMPETITOR" (soft violet bg) — Fiverr, "cited in 17% of answers checked", competitor avatar/initial badge.
>
> Main opportunity section — two columns, heading "Where AI does not mention you" / "Here is the buyer question where competitors appeared and you did not." Left: missed-prompt card, white with soft-peach top border, peach alert icon + "MISSED BUYER QUESTION" label, large prompt text, platform chip on the right (e.g. "ChatGPT"), status strip "You were not cited in this answer.", readable quote panel with markdown correctly rendered (no raw `###`/`**`), 2–3 line preview + "Read full answer →", "Cited instead: Fiverr" pill. Right: soft violet action panel "What could get you cited here" — 2–3 specific recommended actions with check icons, "Suggested content angle" callout, CTA "View full action plan →" — the strongest conversion point on the page.
>
> Competitor insight section — heading "Why AI is citing your competitors" / subheading. Card: circular initial/logo + name + "Cited in 1 of 3 buyer questions" top-left, "17% mention rate" top-right, row of small insight tags, "What Gemini highlighted" pale quote panel (not the whole card), "Why this matters for you" line, text CTA "Compare your positioning →".
>
> "Next best move" block after the competitor section — soft peach background with subtle violet accent, "NEXT BEST MOVE" label, large heading "Create one page for the prompt you are missing.", supporting copy, button "Generate content brief →", secondary text "Based on live AI answers and competitor citations."
>
> Interaction design: every quote expandable, every competitor name clickable, clicking a platform chip filters the report to that engine, "View full action plan" opens the final tab, hover states on cards (violet border shift + 2px elevation), tooltips for unfamiliar metrics, motion stays subtle (fades, short transitions, no bounce/flash).
>
> Typography/spacing: ≥56–72px between major sections, 18px minimum body text inside cards, strong dark headings + muted secondary text, avoid all-caps except tiny labels, prompts/actions easy to scan, less empty space inside individual cards but more whitespace between sections.
>
> Desired feeling: "I now understand exactly where I am invisible in AI answers, who is winning that attention, and what I should do next." Not: "I received a generic audit with a few stats and copied AI answers."

**Shipped:** Redesigned `UrlModeResult` header (metadata + honest "Report generated N ago" pill backed by a real client-side timestamp, since the API response carries none) and tabs (sticky, violet underline, ✳ mark on the action-plan tab), replaced `ExportButtons` with a compact `ReportActions` component (Share / Export dropdown / Print / violet "← New report"). Rebuilt `OverviewTab`: 3-card `SummaryRow` with a circular-progress ring, a featured single-gap two-column section (`MissedPromptCard` + `ActionPanel`, markdown stripped via a new `stripMarkdown` helper, expandable quote), `CompetitorInsightCard`s, and a closing `NextBestMove` block. Noted two deliberate scope cuts: only the single highest-impact gap is featured on Overview (full list still lives in the other tabs), and platform-chip click-to-filter was not wired (would require filtering support in `PromptTable`/`AIAnswersTab`, out of scope for this pass).

---

## 2026-07-04 — AI Answers tab redesign

**Instructions (verbatim):**

> Redesign this page to make the answer obvious within seconds: Which buyer questions are you missing? Which competitors are appearing instead? What should you investigate next? Keep the report header and tabs, but make this feel like a sharp intelligence view — not a spreadsheet with icons. Keep the warm, approachable PeachZ visual personality rather than making it look like a dark enterprise dashboard.
>
> Palette: page background warm ivory `#FCFAF6`, text deep ink navy `#14182B`, brand accent royal violet `#5B3DF5`, soft violet panels `#F1EDFF`, missed-opportunity color soft peach `#FFF1E7`, success/cited color pale green `#DCF7E9`, borders `#E7E2F0`, supporting text muted slate `#667085`. Fewer borders, more whitespace, stronger hierarchy.
>
> Keep the existing header, metadata, export buttons, and tabs. Below the tabs, add a compact AI-engine filter: All engines · ChatGPT · Gemini, with platform icons/names — active engine gets a pale-violet background and royal-violet border. Lets users see whether a competitor appears in ChatGPT, Gemini, or both.
>
> Replace "Prompt-by-Prompt Breakdown" with "Buyer question coverage" / "See which high-intent questions mention your brand—and who appears instead." + small summary label on the right "3 questions tested · 2 AI engines".
>
> Top summary row (3 compact cards, not lots of empty space): Card 1 "YOUR MENTION RATE" — 0/3, "You appeared in 0 buyer questions checked.", small violet circular progress ring. Card 2 "MISSED QUESTIONS" (soft peach) — 3, "Questions where AI did not mention your brand." Card 3 "MOST CITED COMPETITOR" (soft violet) — Fiverr, "Appeared in 1 of 3 buyer questions."
>
> Question list redesign — not 5 cramped competitor columns with truncated names. Clean 4-column table/list: Buyer question / Your brand / Competitors surfaced / Status. Example row: "best tools for one-person businesses" | Not mentioned | Fiverr, Airtable | Missed →. Prompt text bold dark navy; your-brand status as green check "Mentioned" or peach/red dot "Not mentioned"; competitors as compact readable pills with full names; status as soft peach "Missed" badge or green "Covered" badge; chevron at end of every row; each row ≥72px tall; alternating white/ultra-light-lavender rows only if needed for readability.
>
> Expanded prompt detail (click a row to expand inline below it) — Left: AI answers — "What ChatGPT said" / "What Gemini said", short readable excerpt each, no raw markdown (`###`, `**`), quote cards with platform icon + name + 2–3 line excerpt + "Read full answer →". Right: Visibility insight — "Why you were missed" (bullets: site doesn't clearly target this use case; competitors directly associated with this question; no dedicated page or proof point), then "Recommended next move" — "Create or improve a page around: '[prompt]'" + CTA "Build action plan →" (royal-violet text or compact outlined button).
>
> Competitor Threat Radar redesign — rename "Competitor presence map" / "Which brands AI brings up when your brand is absent." Two columns. Left: improved orbit/radar — user's brand as violet circle in center, competitors placed around it by mention frequency, circle size = total mentions, violet only for user brand, soft gray for low-threat competitors, soft peach/orange for the top competitor, full company names below each circle, exact counts inside circles instead of vague percentages ("1 / 3", "0 / 3"), tiny legend ("Circle size = number of AI answers mentioning the brand" / "Color = relative competitive threat"). Right: ranked competitor list — "Competitor mentions" — Fiverr (mentioned in 1 of 3 questions), Airtable/HoneyBook/Hatchbuck (not mentioned), highlight Fiverr with soft peach background + "See why Fiverr is being cited →" link.
>
> "Highest-priority opportunity" block after the competitor section — wide soft peach card with thin royal-violet accent line, "HIGHEST-PRIORITY OPPORTUNITY" / "Own the 'solo startup management' conversation." / supporting copy tying the top competitor's citation reason to a recommended content move / CTA "See how to get cited →" / secondary text "Based on live AI answers across ChatGPT and Gemini."
>
> Interaction rules: clicking a buyer question expands its answer breakdown; clicking a competitor pill filters the page to prompts where that competitor appears; clicking an AI-engine filter updates the visible answer data; hovering a radar bubble shows brand name, number of mentions, prompts where it appeared. Interactions stay lightweight — soft fade, subtle card elevation, no dramatic animation.
>
> Spacing/typography: max content width 1120–1180px, ≥56px between major sections, 20px card corners, 24–28px card padding, 16px minimum body text, 16–18px semibold prompt titles, avoid tiny labels and overly faded gray text, all-caps only for small eyebrow labels.
>
> Desired feeling: "I can immediately see the buyer questions I am losing, the brands getting recommended instead, and where to act next."

**Shipped:** Replaced `PromptTable`/`CompetitorThreatRadar` usage in `AIAnswersTab` with a fully custom implementation (kept `PromptTable` itself untouched since `Dashboard.jsx` still depends on it). Added an `EngineFilter` (All engines/ChatGPT/Gemini) that recomputes mention/competitor data live; an `AnswerSummaryRow` (reusing the `CircularProgress` ring built for Overview); a 4-column `QuestionCoverageList`/`QuestionRow` with inline `ExpandedDetail` (real `ReactMarkdown` rendering — no raw `###`/`**` — plus a "Why you were missed"/"Build action plan →" panel); a redesigned `CompetitorPresenceMap` (exact counts instead of percentages, hover tooltips with matching prompts, click-to-filter wired into the question list); and a `HighestPriorityOpportunity` closer. Competitor-pill and radar-bubble clicks both filter the question list and scroll to it. One scope note: "AI-engine filter updates the visible answer data" was implemented by recomputing mention/competitor stats from `perLLM` per engine — the radar and summary cards all respect the active engine filter.

---

## 2026-07-04 — Site Audit tab redesign

**Instructions (verbatim):**

> Redesign this page so it answers one clear question: Can AI understand, access, and trust your website enough to mention it? Keep the existing report header, navigation, and tabs. But make this page feel like an AI-readiness diagnosis, not a raw crawler output screen. The page should help users quickly see: what AI appears to understand about their site; whether major AI crawlers can access it; which external sources are being cited instead; what to fix first. Maintain the PeachZ visual style: warm, premium, calm, approachable — not a technical SEO console.
>
> Palette: page background warm ivory `#FCFAF6`, primary text deep ink navy `#14182B`, brand accent royal violet `#5B3DF5`, light violet panels `#F1EDFF`, positive status pale mint `#E2F8ED`, opportunity/warning pale peach `#FFF0E5`, borders soft lavender-gray `#E7E2F0`, secondary text muted slate `#667085`. Fewer borders, more breathing room, clearer section hierarchy.
>
> Header/tabs: keep report name, domain + engines tested, Share/CSV/PDF/Print, Dashboard/New report links, existing tabs. Active Site Audit tab: royal-violet underline + small sparkle/scan icon beside the name, sticky tab row, subtle "AI readiness" label beside the tab title.
>
> Summary row (3 compact cards): Card 1 "AI UNDERSTANDING" — "Needs clarity" / "AI can access your site, but your offer is described too broadly." — small violet clarity meter/3-step indicator. Card 2 "CRAWLER ACCESS" — "5 / 5 allowed" / "Major AI crawlers can reach your website." — mint status icon + "View details ↓" link. Card 3 "BIGGEST OPPORTUNITY" (soft peach) — "Clarify your category" / "AI is citing broader platforms instead of your website." — "See recommendation →" link.
>
> Replace "AI Crawler Preview" with "What AI understands about your site" / "This is the information an AI crawler can extract from your homepage." No large wall of raw monospace text by default — two-column layout. Left: AI understanding snapshot (white card) — Detected category, Likely audience, Core use cases (3–4 compact tags), "Key message AI picked up" clean quote panel, clarity indicator ("Clarity score: 62/100" + one-line explanation + soft violet progress line). Right: raw crawler preview — keep the raw text but behind a cleaner interface — card titled "Raw page content read by crawlers", only first 5–6 lines by default, readable sans-serif (not code font), soft gray panel, gradient fade at bottom, "Show full crawler preview →", word-count metric moved to a small neutral badge top-right, URL in muted text below.
>
> Robots.txt section renamed "Can AI crawlers access your site?" / "Access is the first step. It does not guarantee citations, but blocked crawlers can limit what AI systems can read." Not five identical green rows — responsive grid of platform access cards (official logo, platform name, crawler name, "Allowed" badge + green check, one-line helper "Can access public site content", "View robots.txt rule →" expandable link). 2 columns desktop / 1 mobile. White cards with a mint status strip or small green badge, not full-width bright green. Small note below: "Good to know: crawler access helps AI systems read your pages, but clear content and credible sources influence whether they cite you."
>
> "Top Cited Websites" renamed "Sources AI is citing for your buyer questions" / "These are the domains appearing most often in the answers checked." Replace equal-length bars with meaningful ranked list — rank number, domain favicon, domain name, mention count, prompts where it appeared, horizontal share bar based on real frequency. Violet for the user's own site, muted gray/peach for competing domains. Rows clickable; hover shows buyer questions where the source appeared, AI engine cited, "View answer excerpts."
>
> "What to fix first" section below the source list — wide pale-peach card, thin royal-violet line on the left, "WHAT TO FIX FIRST" / heading tied to the real biggest gap / supporting copy / recommended improvements list (category statement under hero headline, mention ideal customer in plain language, one dedicated page for strongest use case, proof points) / CTA "Build my AI visibility action plan →" / secondary text "Based on your site content, crawler access, and live AI-answer patterns."
>
> Interaction rules: "Show full crawler preview" expands inline; "View robots.txt rule" opens an inline side panel with the rule highlighted; clicking a cited domain filters the report to questions where it appears; clicking source bars opens AI answer excerpts; calm hover states only (2px lift, light violet border, subtle shadow), no terminal-style effects.
>
> Spacing/typography: max width 1120–1180px, 56–72px between major sections, 16–20px card radius, 24–28px card padding, 16px minimum body text, short readable line lengths, one primary CTA on the page ("Build my AI visibility action plan").
>
> Desired feeling: "AI can access my site. Now I understand what it thinks my business is, where that understanding is weak, and what to change first."

**Shipped:** Rebuilt `SiteAuditTab` from scratch: a `SiteAuditSummaryRow` (AI understanding clarity meter, crawler-access count, biggest-opportunity card, all scroll-linked to their detail sections), a two-column "What AI understands about your site" (`AIUnderstandingCard` + `RawCrawlerPreview` with a collapsed/expand-in-place raw text panel), a `CrawlerAccessSection` grid of platform cards (real brand icons via the shared `llmPlatforms` module, "View robots.txt rule →" linking to the site's actual `/robots.txt` rather than a fabricated inline rule), a ranked `TopCitedSources` list with favicons/share bars/click-to-expand answer excerpts, and a closing `WhatToFixFirst` card.
One data-honesty note: the spec asked for "Detected category," "Likely audience," and a numeric "Clarity score: 62/100." The backend already computed `category` but never sent it to the client (only `categoryDescription`) — fixed with a one-line passthrough in `server.js` (`analyzePageAndPrepare` destructure + response payload), flagged separately since this is technically a backend change. "Likely audience" and "Core use cases" tags have no backing data at all (no extraction call exists for them), so they're omitted rather than fabricated. The numeric clarity score was replaced with the qualitative 3-step indicator the spec itself offered as an alternative ("small violet clarity meter **or** 3-step indicator"), derived from whether `category` + a sufficiently descriptive `categoryDescription` are present — not a fabricated precise percentage.

---

## 2026-07-04 — "Get cited" action-plan tab redesign + tab rename

**Instructions (verbatim):**

> Redesign this page so it feels like a clear, prioritised growth plan, not a static list of generic content recommendations. The user should immediately understand: which missed buyer question matters most; why AI cited a competitor instead; exactly what content to create or improve; what action to take next. Keep the existing report header and tab structure, but rename the final tab: "Action plan" with a small helper label "Get cited in AI answers." Do not make "Let's get you cited in LLMs" the main tab label — too long and visually heavy.
>
> Palette: background warm ivory `#FCFAF6`, text deep ink navy `#14182B`, primary accent royal violet `#5B3DF5`, light violet surfaces `#F1EDFF`, high-priority opportunity soft peach `#FFF0E5`, success/completed pale mint `#E2F8ED`, borders soft lavender-gray `#E7E2F0`, supporting text muted slate `#667085`. Spacious, focused, actionable — avoid giant empty cards and long copy blocks.
>
> Page header under the tabs: replace "Gap Opportunities" with eyebrow "YOUR AI VISIBILITY ACTION PLAN" / heading "The fastest path to getting cited more often." / supporting text "Built from the buyer questions where competitors appeared and your brand did not." Right side: small compact summary panel — "1 high-priority opportunity", "1 competitor insight", "1 content brief ready." No full-width dashboard here.
>
> Opportunity summary: replace the sparse "Gap Opportunities" card with a compact priority strip. Heading "Your highest-priority missed question." Card: soft peach background, thin royal-violet accent line on the left. Left: "#1 High-impact opportunity" + the prompt, then compact metadata pills (Buyer intent, AI engine, Competitor cited, Priority: High). Right: "View recommendation →" button + helper line "AI cited competitors here, but not your brand." Keep the card short, not tall.
>
> Main recommendation — rename "What to create" to "What to create first" / "One focused piece of content can help you compete for this buyer question." Two columns.
>
> Left column (large white card): top row = purple numbered badge "01" + prompt name + high-priority peach badge. Recommendation block: "Recommended asset" heading — don't force a generic "10 Essential Tips" title, instead show "Suggested title" (a specific real title), "Best format" (e.g. "In-depth guide + downloadable checklist"), "Why this format" reasoning line. "What to include" checklist (5 items, simple check icons, good spacing). CTA row: primary "Generate content brief →" + secondary text link "Export recommendation."
>
> Right column (pale-violet evidence panel): heading "Why this could get you cited" — three short evidence blocks (AI already treats this as high-intent; the competitor wins through useful specific guidance; your site doesn't clearly own this use case yet). Bottom: "Opportunity confidence: High" with a subtle three-bar indicator, all bars filled violet.
>
> Competitor evidence section below the recommendation — heading "What the competitor is doing differently" / "This is the pattern AI is rewarding in its answers." White card, clean comparison layout: left = competitor logo/initial + "Cited in 1 of 3 buyer questions" + mention-rate line; right = 3 compact insight tags + a short AI-answer quote excerpt (not a long raw dump) + "What PeachZ recommends borrowing" line + "See full competitor answer →" link.
>
> "Before you publish" checklist — compact card, heading "Before you publish", 5 checkable items (buyer question in headline, answer in first 100 words, practical framework/template/checklist, proof/examples/expert insight, natural link to the relevant product page), completion indicator "0 of 5 completed", pale-mint success state "Ready to publish and monitor." once complete.
>
> Sticky action footer — lightweight, appears only after scrolling past the main recommendation. Left: "Next step: Create your content brief." Right: royal-violet "Generate brief →" button. Not large or intrusive.
>
> Interaction rules: clicking an opportunity opens its full recommendation inline; "Generate content brief" opens a detailed brief view (outline, keywords, source ideas, internal-link suggestions); "See full competitor answer" opens a side panel, not a new page; users can mark recommendations Not started / In progress / Published, and once Published show "Monitor AI visibility for this prompt"; hover states stay subtle (violet border, 2px lift, no dramatic animation).
>
> Spacing/typography: max width 1120–1180px, 56–72px major-section spacing, 16–20px card radius, 24–32px card padding, 16px minimum body text, bold short headlines, 2–3 line paragraph max, all-caps only for small labels.
>
> Desired feeling: "I do not just know that I am missing AI visibility. I know the one thing to create first, why it matters, and how to act on it."

**Shipped:** Renamed the final tab from "Let's get you cited in LLMs" to "Action plan" (with a small "Get cited in AI answers" sub-label, plus the same treatment retrofitted onto the Site Audit tab as "AI readiness"). Replaced `GapOpportunities`/`ActionPlanSection`/`CitedTab` with a new `ActionPlanTab`: `ActionPlanHeader` (eyebrow/heading/summary panel), `OpportunityStrip` (peach priority card with buyer-intent/engine/competitor/priority meta pills), a two-column `ContentRecommendationCard` + `EvidencePanel` (confidence bars driven by the real `action.priority`), `CompetitorDifferentiator` (reused the `getCompetitorEvidence` pattern from Overview), `BeforeYouPublish` (checkable 5-item checklist with a mint completion state), a `ContentBriefModal`, and a `StickyActionFooter` gated by an `IntersectionObserver` on a sentinel below the main recommendation.
Data-honesty notes: "Suggested title" and "Include these sections" pull from the real `action.blogs[0]` (title + outline) already generated by `generateActionsOpenAI` — not invented copy. "Buyer intent" (Comparison/Problem-solving/Research) is a transparent heuristic classification of the actual prompt text, not a real backend field. There's no `format` field in the live action generator, so "Best format" falls back to a sensible default when blog data exists. "Generate content brief" opens an inline modal (not a full brief-authoring view with keywords/source ideas/internal links — that data doesn't exist yet) and "See full competitor answer" expands inline rather than a side panel, both lighter-weight interpretations consistent with patterns already used elsewhere in the app.

---
