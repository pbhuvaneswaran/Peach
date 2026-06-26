import OpenAI from 'openai';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function extractCompetitors(llmResults) {
  const client = getClient();

  const allText = Object.entries(llmResults)
    .flatMap(([llm, answers]) =>
      (answers || []).map(({ answer }) => `[${llm.toUpperCase()}] ${answer || ''}`)
    )
    .join('\n\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Extract all brand and company names mentioned in these AI search answers. Sort by how often they appear (most frequent first). Return only real brand/company names, not generic terms or adjectives.

AI ANSWERS:
${allText.slice(0, 6000)}

Return ONLY a valid JSON array of strings, no explanation:
["Brand1", "Brand2", ...]`,
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

export { extractCompetitors };
