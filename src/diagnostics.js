import { dummyDiagnosis } from './dummy.js';
import { hasOpenAIKey, askOpenAI } from './openaiClient.js';

function hasLLMKey() {
  return hasOpenAIKey();
}

async function askLLM(prompt) {
  return askOpenAI(prompt, 1000);
}

function buildDiagnosisPrompt({ keyword, blogAudit, rank, competitorAnalysis }) {
  const competitorJson = JSON.stringify(competitorAnalysis, null, 2);
  return `You are an SEO rank drop diagnostician.

Keyword: ${keyword}
Page URL: ${blogAudit.url}
Page Title: ${blogAudit.title}
Page H1: ${blogAudit.h1}
Page Intent: ${blogAudit.intent}
Current rank: ${rank || 'not in top results'}

Competitor analysis:
${competitorJson}

Instructions:
- Diagnose the likely reasons this page is ranking poorly or has dropped.
- Identify the top 4 issues: content gaps, intent mismatch, thin coverage, outdated topics, missing sections, outdated examples, weak E-E-A-T signals.
- For each issue, include why it matters for this keyword.
- Provide a concise priority fix plan with 5 action items.

Return valid JSON only in this format:
{
  "issues": [{"title":"...","reason":"...","impact":"..."}],
  "fixPlan": ["..."],
  "summary": "..."
}
`;
}

async function diagnosePage({ keyword, blogAudit, rank, competitorAnalysis, dummyMode = false }) {
  if (dummyMode || !hasLLMKey()) {
    return dummyDiagnosis({ keyword, blogAudit, rank, competitorAnalysis });
  }

  const prompt = buildDiagnosisPrompt({ keyword, blogAudit, rank, competitorAnalysis });
  const raw = await askLLM(prompt);
  let parsed = { raw };
  try {
    parsed = { ...parsed, ...JSON.parse(raw) };
  } catch (error) {
    parsed.raw = raw;
  }
  return parsed;
}

export { diagnosePage };
