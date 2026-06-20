import { dummyFindContentGaps } from './dummy.js';
import { hasOpenAIKey, askOpenAI } from './openaiClient.js';

function hasLLMKey() {
  return hasOpenAIKey();
}

async function askLLM(prompt) {
  return askOpenAI(prompt, 1000);
}

function buildGapPrompt({ keyword, blogAudit, competitorAnalysis }) {
  const competitorJson = JSON.stringify(competitorAnalysis, null, 2);
  const blogJson = blogAudit ? JSON.stringify(blogAudit, null, 2) : 'null';
  return `You are a content gap analyst.

Primary keyword: ${keyword}

User page audit: ${blogJson}

Competitor analysis summaries:
${competitorJson}

Instructions:
- Extract every topic, section, or angle competitors cover that the user's page is missing.
- Score each gap from 1 to 10 by how directly fixing it would help rank for the primary keyword.
- Prioritize the list by impact, with the highest-value gaps first.
- If there is no user page, produce a content brief with sections and recommended headings for a new page.

Return valid JSON only in this format:
{
  "gaps": [{"gap":"...","score":number,"whyItMatters":"...","recommendation":"..."}],
  "priorityBrief": ["..."]
}
`;
}

async function findContentGaps({ keyword, blogAudit, competitorAnalysis, dummyMode = false }) {
  if (dummyMode || !hasLLMKey()) {
    return dummyFindContentGaps({ keyword, blogAudit, competitorAnalysis });
  }

  const prompt = buildGapPrompt({ keyword, blogAudit, competitorAnalysis });
  const raw = await askLLM(prompt);
  let parsed = { raw };
  try {
    parsed = { ...parsed, ...JSON.parse(raw) };
  } catch (error) {
    parsed.raw = raw;
  }
  return parsed;
}

export { findContentGaps };
