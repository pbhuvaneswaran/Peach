import Anthropic from '@anthropic-ai/sdk';

async function generateBuyerQuestions({ brand, competitors, category }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const competitorList = competitors.join(', ');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are helping test AI search visibility for brands.

Brand being tested: ${brand}
Competitor brands: ${competitorList}
Product category: ${category}

Generate exactly 10 buyer-intent questions that a potential customer would type into an AI search engine like ChatGPT or Perplexity when researching ${category} tools. These should be questions where specific brands would likely be recommended in the answer.

Return ONLY a JSON array of 10 question strings. No explanation. No numbering. Just the array.

Example format:
["question 1", "question 2", ...]`,
      },
    ],
  });

  const text = message.content[0].text.trim();
  try {
    const questions = JSON.parse(text);
    if (Array.isArray(questions) && questions.length > 0) {
      return questions.slice(0, 10);
    }
  } catch {
    const matches = text.match(/"([^"]+)"/g);
    if (matches) return matches.map((s) => s.replace(/"/g, '')).slice(0, 10);
  }
  throw new Error('Could not parse questions from Claude response');
}

export { generateBuyerQuestions };
