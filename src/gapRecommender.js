import Anthropic from '@anthropic-ai/sdk';

async function recommendForGaps({ gaps, brand, category }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  if (!gaps || gaps.length === 0) return [];

  const gapList = gaps
    .map((g, i) => `${i + 1}. Question: "${g.question}" — Competitors seen: ${g.competitorsSeen.join(', ')}`)
    .join('\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Brand: ${brand}
Category: ${category}

These are questions where ${brand} is NOT being mentioned by AI search engines, but competitors are:

${gapList}

For each gap, write one plain-English content recommendation — what ${brand} should create or update so AI search engines start citing them for this question. Be specific and actionable. Keep each recommendation under 40 words.

Return ONLY a JSON array with one object per gap, in order:
[{"question": "...", "recommendation": "..."}]`,
      },
    ],
  });

  const text = message.content[0].text.trim();
  try {
    return JSON.parse(text);
  } catch {
    return gaps.map((g) => ({ question: g.question, recommendation: 'Create authoritative content covering this topic with specific use cases and examples.' }));
  }
}

export { recommendForGaps };
