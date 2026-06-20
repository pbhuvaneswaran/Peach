import { scrapePage } from './scraper.js';

function inferKeywordFromPage(page) {
  if (page.title) {
    return page.title.replace(/\s*[-|–].*$/, '').trim();
  }
  if (page.h1) {
    return page.h1.trim();
  }
  return page.description || page.headings?.[0]?.text || null;
}

function inferSearchIntent(text) {
  const lower = text.toLowerCase();
  if (/buy|price|compare|best|review|discount|coupon|deal/.test(lower)) {
    return 'commercial';
  }
  if (/how to|guide|learn|what is|why|tips|ways|strategy/.test(lower)) {
    return 'informational';
  }
  if (/near me|location|address|hours/.test(lower)) {
    return 'local';
  }
  return 'informational';
}

async function auditPage(url) {
  const page = await scrapePage(url);
  const inferredKeyword = inferKeywordFromPage(page);
  const topic = page.h1 || page.title || inferredKeyword;
  const intent = inferSearchIntent(`${page.title} ${page.h1} ${page.description}`);

  return {
    url,
    inferredKeyword,
    topic,
    intent,
    title: page.title,
    description: page.description,
    h1: page.h1,
    headings: page.headings,
    wordCount: page.wordCount,
    snippet: page.textSnippet,
  };
}

export { auditPage };
