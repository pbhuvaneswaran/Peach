import OpenAI from 'openai';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function generatePromptsFromPage({ title, headings, content }) {
  const client = getClient();
  const headingText = headings.slice(0, 15).map(h => h.text).join(' · ');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Generate 8 buyer-intent questions that someone would type into Claude, ChatGPT, or Gemini when searching for this type of product or solution.

Page title: ${title}
Headings: ${headingText}
Content: ${content.slice(0, 1500)}

Make questions specific to this niche. Include comparisons, use-case queries, and "best X for Y" style questions.

Return ONLY a valid JSON array of 8 strings:
["question 1", "question 2", ...]`,
    }],
  });

  const text = response.choices[0].message.content.trim();
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

async function generatePromptsFromKeyword(keyword) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Generate 8 related search queries someone would type into Claude, ChatGPT, or Gemini when exploring: "${keyword}"

Include variations: comparisons, use-case specific, pricing questions, and "best X for Y" style queries. Keep queries natural and buyer-intent focused.

Return ONLY a valid JSON array of 8 strings:
["query 1", "query 2", ...]`,
    }],
  });

  const text = response.choices[0].message.content.trim();
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

export { generatePromptsFromPage, generatePromptsFromKeyword };
