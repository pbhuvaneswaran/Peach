import Anthropic from '@anthropic-ai/sdk';

async function analyzeBlogVsLLMs({ pageData, prompts, llmResults, brand, competitors }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const sampleAnswers = [];
  for (const [llmName, answers] of Object.entries(llmResults)) {
    if (!answers) continue;
    for (const { question, answer } of answers.slice(0, 5)) {
      if (answer) sampleAnswers.push(`[${llmName.toUpperCase()}] Q: "${question}"\nA: ${answer.slice(0, 400)}`);
    }
  }

  const prompt = `You are an AI content analyst. A brand called "${brand}" wants to improve its AI search visibility.

THEIR BLOG/PAGE: ${pageData.url}
Title: ${pageData.title}
Headings: ${pageData.headings.map(h => `${h.tag}: ${h.text}`).join(' | ')}
Content (excerpt):
${pageData.content.slice(0, 4000)}

TARGET PROMPTS (what their buyers search for in AI engines):
${prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

WHAT AI ENGINES ACTUALLY SAY (sample answers showing what they cite):
${sampleAnswers.join('\n\n')}

COMPETITORS: ${competitors.join(', ')}

Analyze the blog content against the AI answers. Identify topics, angles, or specific information that:
1. AI engines mention when recommending competitors but is MISSING from this blog
2. Would help ${brand} get cited for the target prompts

Return a JSON array of topic gaps. Each gap must include:
- topic: short name for the missing topic
- description: what specifically is missing from the blog
- evidencePrompt: which target prompt this relates to
- evidenceQuote: a short quote from the AI answers showing what competitors get cited for

Return ONLY valid JSON array, no explanation:
[{"topic":"...","description":"...","evidencePrompt":"...","evidenceQuote":"..."}]

Find 4-7 gaps maximum. Be specific — not generic advice.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
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

export { analyzeBlogVsLLMs };
