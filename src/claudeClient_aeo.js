import Anthropic from '@anthropic-ai/sdk';
import pLimit from 'p-limit';

async function askClaudeAEO(question) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `${question}\n\nAnswer concisely and mention specific product/brand names where relevant.`,
      },
    ],
  });
  return message.content[0].text || '';
}

async function queryAllQuestionsClaude(questions) {
  const limit = pLimit(5);
  return Promise.all(
    questions.map((question) =>
      limit(async () => {
        try {
          const answer = await askClaudeAEO(question);
          return { question, answer };
        } catch (err) {
          return { question, answer: '', error: err.message };
        }
      })
    )
  );
}

export { queryAllQuestionsClaude };
