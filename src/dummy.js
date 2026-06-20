function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function inferIntentFromKeyword(keyword) {
  const lower = String(keyword || '').toLowerCase();
  if (/buy|price|compare|best|review|discount|coupon|deal|vs\.?|vs |comparison/.test(lower)) {
    return 'commercial';
  }
  if (/how to|guide|learn|what is|why|tips|ways|strategy|benefits|use cases/.test(lower)) {
    return 'informational';
  }
  if (/near me|location|address|hours/.test(lower)) {
    return 'local';
  }
  return 'informational';
}

function dummySearchResults(query) {
  const querySlug = String(query || 'keyword').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const results = [];
  for (let index = 1; index <= 10; index += 1) {
    results.push({
      title: `Top result ${index} for ${query}`,
      snippet: `A sample top ranking page for ${query}.`,
      link: `https://example.com/${querySlug}-result-${index}`,
      url: `https://example.com/${querySlug}-result-${index}`,
    });
  }
  return { organic: results };
}

function dummyCompetitorAnalysis({ keyword, page }) {
  const intent = inferIntentFromKeyword(keyword);
  const topics = page.headings?.slice(0, 5).map((heading) => heading.text).filter(Boolean);
  const topTopics = topics.length > 0 ? topics : ['Overview', 'Use cases', 'Benefits', 'How it works'];
  return {
    url: page.url,
    intent,
    alignment: page.wordCount > 1000 ? 'strong' : 'moderate',
    topTopics,
    uniqueElements: [
      page.description || 'Clear page summary',
      `Estimated word count ${page.wordCount}`,
    ],
    wordCountEstimate: `${page.wordCount}`,
  };
}

function dummyBlogAnalysis({ keyword, blogAudit }) {
  const intent = inferIntentFromKeyword(keyword);
  const topics = [
    blogAudit.h1 || blogAudit.title,
    blogAudit.description || 'Page overview',
    ...(blogAudit.headings?.slice(0, 4).map((heading) => heading.text).filter(Boolean) || []),
  ].filter(Boolean).slice(0, 6);
  return {
    url: blogAudit.url,
    intent,
    alignment: blogAudit.wordCount > 1000 ? 'strong' : 'moderate',
    topTopics: topics.length ? topics : ['Overview', 'Key benefits', 'How it works'],
    weaknesses: blogAudit.wordCount < 800 ? ['Page coverage may be too thin for competitive keyword intent.'] : ['Consider adding more examples or use cases.'],
    recommendationSummary: 'Expand content around user intent and add missing practical examples to improve relevance.',
  };
}

function dummyDiagnosis({ keyword, blogAudit, rank, competitorAnalysis }) {
  const competitorCount = competitorAnalysis.length;
  return {
    issues: [
      {
        title: 'Potential content depth issue',
        reason: `This page is ${blogAudit.wordCount < 900 ? 'relatively short' : 'not clearly differentiated'} compared to competitors for ${keyword}.`, 
        impact: 'High',
      },
      {
        title: 'Intent alignment gap',
        reason: `The page should better reflect the search intent of ${keyword}, especially if competitors cover buyer or comparison topics.`, 
        impact: 'High',
      },
      {
        title: 'Missing competitor topics',
        reason: `Top competitors include more detailed topics or sections that your page lacks.`, 
        impact: 'Medium',
      },
      {
        title: 'Rank visibility',
        reason: rank ? `Your page ranks at position ${rank}, leaving room for content and structure improvements.` : 'Your page is not visible in the top results yet.', 
        impact: 'Medium',
      },
    ],
    fixPlan: [
      `Audit the page structure and add key competitor topics for ${keyword}.`,
      'Expand the content with examples, comparisons, and practical advice.',
      'Align headings and meta copy with the inferred search intent.',
      'Add a FAQ or summary section addressing common user questions.',
      'Refresh the page with updated data, links, and relevant references.',
    ],
    summary: `This diagnostic is based on a placeholder analysis with ${competitorCount} competitor summaries. It highlights content depth and intent alignment as the top areas for improvement.`,
  };
}

function dummyFindContentGaps({ keyword, blogAudit, competitorAnalysis }) {
  const gapTexts = [];
  competitorAnalysis.forEach((summary) => {
    (summary.topTopics || []).forEach((topic) => {
      if (topic && !String(blogAudit?.h1 || '').toLowerCase().includes(topic.toLowerCase())) {
        gapTexts.push(topic);
      }
    });
  });

  const uniqueGaps = Array.from(new Set(gapTexts)).slice(0, 6);
  const gaps = uniqueGaps.map((gap, index) => ({
    gap,
    score: 10 - index,
    whyItMatters: `This topic is commonly covered by competitors and helps make the page more comprehensive for ${keyword}.`, 
    recommendation: `Add a section that covers: ${gap}.`,
  }));

  return {
    gaps: gaps.length ? gaps : [
      {
        gap: `Comprehensive coverage of ${keyword}`,
        score: 10,
        whyItMatters: 'A strong page should fully answer the core query.',
        recommendation: `Write a detailed section that matches the primary keyword intent.`,
      },
    ],
    priorityBrief: [
      `Introduce the main concept around ${keyword}.`,
      'Include a detailed comparison or benefits section.',
      'Add practical examples and use cases.',
      'Finish with a FAQ or summary section.',
    ],
  };
}

export {
  inferIntentFromKeyword,
  dummySearchResults,
  dummyCompetitorAnalysis,
  dummyBlogAnalysis,
  dummyDiagnosis,
  dummyFindContentGaps,
};
