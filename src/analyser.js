import pLimit from 'p-limit';
import { scrapePage } from './scraper.js';
import { dummyCompetitorAnalysis, dummyBlogAnalysis } from './dummy.js';
import { hasOpenAIKey, askOpenAI } from './openaiClient.js';

function hasLLMKey() {
  return hasOpenAIKey();
}

async function askLLM(prompt) {
  return askOpenAI(prompt, 1000);
}

function buildCompetitorPrompt({ keyword, page, blogAudit }) {
  return `You are an SEO analyst. Analyze the competitor page for the keyword "${keyword}".

Page URL: ${page.url}
Title: ${page.title}
Description: ${page.description}
H1: ${page.h1}
Word count: ${page.wordCount}

If a blog audit exists, compare the competitor page to the audit.

Instructions:
- Determine the likely search intent for the keyword.
- Extract 6 to 8 main topics or sections covered on the competitor page.
- Rate whether the competitor page has "strong", "moderate", or "weak" alignment to the keyword intent.
- Identify unique sections or angles this competitor page uses.

Output valid JSON only in this format:
{
  "url": "...",
  "intent": "informational|commercial|transactional|navigational",
  "alignment": "strong|moderate|weak",
  "topTopics": ["..."],
  "uniqueElements": ["..."],
  "wordCountEstimate": "..."
}
`;
}

function buildBlogPrompt({ keyword, blogAudit }) {
  return `You are an SEO analyst. Review the user's page relative to the keyword "${keyword}".

Page URL: ${blogAudit.url}
Title: ${blogAudit.title}
Description: ${blogAudit.description}
H1: ${blogAudit.h1}
Intent: ${blogAudit.intent}
Word count: ${blogAudit.wordCount}

Instructions:
- Determine the page's likely search intent and how well it matches the keyword.
- Extract 6 main topics or sections this page currently covers.
- Identify one or two weak or missing coverage areas compared to a strong ranking page.

Output valid JSON only in this format:
{
  "url": "...",
  "intent": "informational|commercial|transactional|navigational",
  "alignment": "strong|moderate|weak",
  "topTopics": ["..."],
  "weaknesses": ["..."],
  "recommendationSummary": "..."
}
`;
}

async function analyzeCompetitor(url, keyword, blogAudit, dummyMode) {
  if (dummyMode || !hasLLMKey()) {
    return dummyCompetitorAnalysis({ keyword, page: { url, title: '', description: '', h1: '', wordCount: 0, headings: [] }, blogAudit });
  }

  const page = await scrapePage(url);
  const prompt = buildCompetitorPrompt({ keyword, page, blogAudit });
  const raw = await askLLM(prompt);

  let parsed = { url, raw };
  try {
    parsed = { ...parsed, ...JSON.parse(raw) };
  } catch (error) {
    parsed.raw = raw;
  }

  return parsed;
}

async function analyzeUserPage(blogAudit, keyword, dummyMode) {
  if (dummyMode || !hasLLMKey()) {
    return dummyBlogAnalysis({ keyword, blogAudit });
  }

  const prompt = buildBlogPrompt({ keyword, blogAudit });
  const raw = await askLLM(prompt);
  let parsed = { raw };
  try {
    parsed = { ...parsed, ...JSON.parse(raw) };
  } catch (error) {
    parsed.raw = raw;
  }
  return parsed;
}

async function analyzePage({ keyword, blogAudit, competitorUrls, dummyMode = false }) {
  const limit = pLimit(3);
  const competitorSummaries = await Promise.all(
    competitorUrls.map((item) => limit(() => analyzeCompetitor(item, keyword, blogAudit, dummyMode)))
  );

  const pageSummary = blogAudit ? await analyzeUserPage(blogAudit, keyword, dummyMode) : null;

  return {
    keyword,
    blogSummary: pageSummary,
    competitorSummaries,
  };
}

export { analyzePage };
