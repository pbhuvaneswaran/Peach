import OpenAI from 'openai';
import pLimit from 'p-limit';

function getClient() {
  return new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY || 'placeholder',
    baseURL: 'https://api.perplexity.ai',
  });
}

async function askPerplexity(question) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: 'llama-3.1-sonar-small-128k-online',
    messages: [{ role: 'user', content: question }],
    max_tokens: 512,
  });
  return response.choices[0].message.content || '';
}

async function queryAllQuestions(questions) {
  const limit = pLimit(5);
  const results = await Promise.all(
    questions.map((question) =>
      limit(async () => {
        try {
          const answer = await askPerplexity(question);
          return { question, answer };
        } catch (err) {
          return { question, answer: '', error: err.message };
        }
      })
    )
  );
  return results;
}

export { queryAllQuestions };
