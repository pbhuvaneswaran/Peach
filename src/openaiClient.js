import { GoogleGenerativeAI } from '@google/generative-ai';

function hasOpenAIKey() {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function askOpenAI(prompt, maxTokens = 1000) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required in environment variables.');
  }
  
  const genAI = new GoogleGenerativeAI({ apiKey });
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  const geminiModel = genAI.getGenerativeModel({ model });
  
  const response = await geminiModel.generateContent({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens },
  });

  const text = response?.response?.text?.();
  if (typeof text === 'string' && text.length) {
    return text;
  }

  return '';
}

export { hasOpenAIKey, askOpenAI };
