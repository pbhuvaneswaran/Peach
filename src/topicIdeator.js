import OpenAI from 'openai';
import pLimit from 'p-limit';

const BATCH_SIZE = 5;
const MAX_PASSES = 3;
const CONCURRENCY = 3;
const CALL_TIMEOUT_MS = 20000;

function normalizeTitle(t) {
  return (t || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function isDuplicateTitle(a, b) {
  const wa = new Set(normalizeTitle(a).split(/\s+/).filter(Boolean));
  const wb = new Set(normalizeTitle(b).split(/\s+/).filter(Boolean));
  if (wa.size === 0 || wb.size === 0) return false;
  const overlap = [...wa].filter((w) => wb.has(w)).length;
  return overlap / Math.min(wa.size, wb.size) > 0.6;
}

async function callWithTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('OpenAI call timed out')), ms)),
  ]);
}

async function generateTopicBatch({ brand, siteContent, competitors, gaps, prompts, category, competitorResearch, count, avoidTitles }) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const gapEvidence = (gaps || []).slice(0, 8).map((g) =>
    `- Query "${g.question || g.topic}" — competitors seen: ${(g.competitorsSeen || []).join(', ') || 'n/a'}`
  ).join('\n');

  const siteSummary = siteContent
    ? `Headings on their site: ${(siteContent.headings || []).slice(0, 20).map((h) => h.text).join(' | ')}\nSite content sample: ${(siteContent.content || '').slice(0, 1500)}`
    : 'No usable site content was found.';

  const competitorSummary = (competitorResearch || []).length
    ? (competitorResearch || []).map((r) => `- "${r.title}" (${r.link}): ${r.snippet}`).join('\n')
    : 'No competitor research available.';

  const prompt = `You are an AEO (Answer Engine Optimization) content strategist for "${brand}", a company in the "${category || 'unknown'}" category.

GOAL: propose blog article topics that, if written well, would get "${brand}" cited by ChatGPT/Gemini/Google AI Overviews when buyers ask related questions. This is not generic SEO filler — every topic must be grounded in real evidence about what buyers ask and what's missing from the current content landscape.

Competitors: ${(competitors || []).join(', ') || 'unknown'}

Content gaps observed (queries where competitors get cited but "${brand}" doesn't):
${gapEvidence || 'None available.'}

Buyer queries this brand cares about: ${(prompts || []).slice(0, 8).join(' | ') || 'n/a'}

Their own site:
${siteSummary}

Competitor content research (use this if the site's own content above is thin):
${competitorSummary}

${avoidTitles?.length ? `Do NOT repeat or closely rephrase these already-proposed titles:\n${avoidTitles.join('\n')}` : ''}

Propose exactly ${count} distinct article topics. For each, return:
- title: specific, non-generic article title
- reasoning: EXACTLY 2 sentences explaining why this topic would help "${brand}" get cited by AI engines — reference a specific content gap, competitor coverage, or buyer-query angle from above. Never say generic things like "great for SEO."
- targetQuery: the buyer query this article most directly answers

Return ONLY valid JSON array, no explanation:
[{"title":"...","reasoning":"...","targetQuery":"..."}]`;

  const completion = await callWithTimeout(
    client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    }),
    CALL_TIMEOUT_MS
  );

  const text = completion.choices[0].message.content.trim();
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

async function generateTopics({ brand, siteContent, competitors, gaps, prompts, category, competitorResearch, count }) {
  const limit = pLimit(CONCURRENCY);
  let topics = [];

  for (let pass = 0; pass < MAX_PASSES && topics.length < count; pass++) {
    const remaining = count - topics.length;
    const numBatches = Math.ceil(remaining / BATCH_SIZE);
    const batchResults = await Promise.all(
      Array.from({ length: numBatches }, (_, i) =>
        limit(() =>
          generateTopicBatch({
            brand, siteContent, competitors, gaps, prompts, category, competitorResearch,
            count: Math.min(BATCH_SIZE, remaining - i * BATCH_SIZE),
            avoidTitles: topics.map((t) => t.title),
          }).catch(() => [])
        )
      )
    );

    for (const candidate of batchResults.flat()) {
      if (!candidate?.title) continue;
      if (topics.some((t) => isDuplicateTitle(t.title, candidate.title))) continue;
      topics.push(candidate);
      if (topics.length >= count) break;
    }
  }

  return { topics: topics.slice(0, count), shortfall: Math.max(0, count - topics.length) };
}

export { generateTopics, isDuplicateTitle, normalizeTitle };
