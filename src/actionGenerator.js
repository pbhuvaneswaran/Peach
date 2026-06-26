import Anthropic from '@anthropic-ai/sdk';

async function generateActions({ gaps, brand, competitors, pageData }) {
  if (!gaps || gaps.length === 0) return [];
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const gapList = gaps.map((g, i) =>
    `Gap ${i + 1}: ${g.topic}
  Missing: ${g.description}
  Related prompt: "${g.evidencePrompt}"
  AI evidence: "${g.evidenceQuote}"`
  ).join('\n\n');

  const prompt = `You are an AEO (Answer Engine Optimization) strategist helping "${brand}" get cited by Claude, ChatGPT, and Gemini.

Their blog: ${pageData?.url || 'their website'}
Their competitors: ${competitors.join(', ')}

Content gaps identified (topics their blog misses that AI engines cite competitors for):
${gapList}

For each gap, write an actionable recommendation. Each action must have:
- action: one clear sentence describing exactly what to add or change in the blog
- why: 2-3 sentences explaining WHY this will get them cited by AI engines, using the evidence quote as proof
- format: what content format works best (e.g., "comparison table", "step-by-step list", "stat-backed paragraph", "FAQ section")
- priority: "high", "medium", or "low"

The "why" field must quote or reference the AI evidence to make the reasoning credible and specific. Users should understand exactly WHY this action works based on real AI behavior observed.

Return ONLY valid JSON array:
[{"gap":"...","action":"...","why":"...","format":"...","priority":"high"}]`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

export { generateActions };
