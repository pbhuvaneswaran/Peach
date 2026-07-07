import OpenAI from 'openai';
import pLimit from 'p-limit';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function askChatGPT(question) {
  const client = getClient();
  const response = await Promise.race([
    client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: question }],
      max_tokens: 512,
      temperature: 0,
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
  ]);
  return response.choices[0].message.content || '';
}

async function queryAllQuestionsGPT(questions) {
  const limit = pLimit(5);
  return Promise.all(
    questions.map((question) =>
      limit(async () => {
        try {
          const answer = await askChatGPT(question);
          return { question, answer };
        } catch (err) {
          return { question, answer: '', error: err.message };
        }
      })
    )
  );
}

export { queryAllQuestionsGPT };
