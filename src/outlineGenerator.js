import OpenAI from 'openai';

const CALL_TIMEOUT_MS = 20000;

async function callWithTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('OpenAI call timed out')), ms)),
  ]);
}

async function generateOutline({ title, reasoning, targetQuery, brand, category }) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are a content strategist writing an article outline for "${brand}" (category: ${category || 'unknown'}).

Article title: "${title}"
Why this topic: ${reasoning || 'n/a'}
Target buyer query: "${targetQuery || title}"

Produce an outline with:
- h1: the exact H1 heading (can refine the title slightly for clarity)
- angle: exactly 1-2 sentences describing the article's angle/approach — what specific take or framing makes this piece worth writing, not a restatement of the title
- outline: array of 4-6 sections, each { "title": string, "description": string } — title is a specific, non-generic section heading; description is 1-2 sentences of guidance on what that section should cover, structured so AI engines would want to cite this as a credible source.

Return ONLY valid JSON object, no explanation:
{"h1":"...","angle":"...","outline":[{"title":"...","description":"..."}]}`;

  const completion = await callWithTimeout(
    client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
    CALL_TIMEOUT_MS
  );

  const text = completion.choices[0].message.content.trim();
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (!parsed.h1 || !Array.isArray(parsed.outline)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export { generateOutline };
