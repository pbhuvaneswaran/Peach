import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateBuyerQuestions } from './src/questionGenerator.js';
import { queryAllQuestionsClaude } from './src/claudeClient_aeo.js';
import { queryAllQuestionsGPT } from './src/openaiClient_aeo.js';
import { queryAllQuestionsGemini } from './src/geminiClient_aeo.js';
import { scoreVisibility } from './src/visibilityScorer.js';
import { recommendForGaps } from './src/gapRecommender.js';
import { dummyVisibilityResult } from './src/dummyVisibility.js';
import { runDiagnosis } from './index.js';

dotenv.config();

const hasKey = (name) => !!process.env[name];

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/visibility', async (req, res) => {
  const { brand, competitors, category, demo, llms: requestedLLMs } = req.body;

  if (!brand || !category || !Array.isArray(competitors) || competitors.length === 0) {
    return res.status(400).json({ error: 'brand, category, and competitors[] are required' });
  }

  if (demo || !hasKey('ANTHROPIC_API_KEY')) {
    return res.json(dummyVisibilityResult({ brand, competitors, category }));
  }

  try {
    const questions = await generateBuyerQuestions({ brand, competitors, category });

    const enabledLLMs = requestedLLMs || ['claude', 'chatgpt', 'gemini'];
    const llmJobs = {};
    if (enabledLLMs.includes('claude') && hasKey('ANTHROPIC_API_KEY')) {
      llmJobs.claude = queryAllQuestionsClaude(questions);
    }
    if (enabledLLMs.includes('chatgpt') && hasKey('OPENAI_API_KEY')) {
      llmJobs.chatgpt = queryAllQuestionsGPT(questions);
    }
    if (enabledLLMs.includes('gemini') && hasKey('GEMINI_API_KEY')) {
      llmJobs.gemini = queryAllQuestionsGemini(questions);
    }

    const llmNames = Object.keys(llmJobs);
    const llmAnswers = await Promise.all(Object.values(llmJobs));
    const llmResults = Object.fromEntries(llmNames.map((name, i) => [name, llmAnswers[i]]));

    const visibility = scoreVisibility({ llmResults, brand, competitors });
    const gapRecommendations = await recommendForGaps({ gaps: visibility.gaps, brand, category });

    res.json({ brand, competitors, category, questions, llmsQueried: llmNames, visibility, gapRecommendations });
  } catch (err) {
    console.error('Visibility error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/diagnose', async (req, res) => {
  const { url, keyword } = req.body;
  if (!url && !keyword) {
    return res.status(400).json({ error: 'url or keyword is required' });
  }
  try {
    const report = await runDiagnosis({ blogUrl: url, keyword });
    res.json(report);
  } catch (err) {
    console.error('Diagnosis error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    keys: {
      anthropic: hasKey('ANTHROPIC_API_KEY'),
      claude_aeo: hasKey('ANTHROPIC_API_KEY'),
      openai: hasKey('OPENAI_API_KEY'),
      gemini: hasKey('GEMINI_API_KEY'),
      supabase: hasKey('SUPABASE_URL'),
      stripe: hasKey('STRIPE_SECRET_KEY'),
    },
  })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
