import OpenAI from 'openai';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Our crawler (webReader.js) is a plain HTTP fetch with no JS execution — on sites that render
// their real content client-side (common with modern SPA frameworks), it can come back with no
// title, no meta description, and no body text at all. When that happens there's no signal left
// to reason from, so instead of guessing a category from nothing, ask GPT to look the site up via
// web search (using OpenAI's own hosted browsing, not a static fetch) and describe it for real.
async function fetchSiteSummaryViaSearch(url) {
  const client = getClient();
  const response = await client.responses.create({
    model: 'gpt-4o',
    tools: [{ type: 'web_search_preview' }],
    input: `Visit ${url} and describe in 3-4 sentences: what the product does, who it's for, the specific problem it solves, and the specific software category it belongs to (be as specific as possible, not a broad category). Base this on the actual site content, not other sources about the company.`,
  });
  return response.output_text || '';
}

function isCrawlThin(pageData) {
  return !pageData.title && !pageData.metaDesc && (!pageData.content || pageData.wordCount < 10);
}

// Single call: returns description + competitors + 8 prompts in one GPT request
async function analyzePageAndPrepare(pageData) {
  const client = getClient();

  if (isCrawlThin(pageData)) {
    const summary = await fetchSiteSummaryViaSearch(pageData.url);
    if (summary) pageData = { ...pageData, content: summary, wordCount: summary.split(/\s+/).length };
  }

  const headingText = (pageData.headings || []).slice(0, 10).map(h => h.text).join(', ');

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2000,
    temperature: 0,
    seed: 42,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: `Analyze this web page and return a JSON object with exactly 3 fields:

1. "description": 1-2 sentences describing what the product does — problem it solves and who it's for. NO brand names.
2. "categories": array of 1 to 3 objects, one per DISTINCT product line the page itself emphasizes as a named, separately-marketed offering (e.g. two named sub-products bundled under one brand). Most pages have exactly ONE distinct product line — only return more than one if the page clearly markets multiple separately-named offerings side by side (not just multiple features of one product). Each object has:
   - "category": the most specific sub-category for that product line (e.g. "AI agent platform for solopreneurs", NOT the broad "productivity tool")
   - "competitors": array of up to 4 real company/product BRAND NAMES that are DIRECT competitors for that specific product line.
   CRITICAL RULES FOR COMPETITORS:
   - Return only BRAND NAMES of actual software products/companies (e.g. "Zendesk", "Intercom", "Freshdesk")
   - NEVER return category descriptions (NOT "AI customer service platform")
   - THE BUYER TEST: Ask yourself — if someone is actively evaluating THIS product line, which 3-4 other vendors would they have also requested a demo from in the same week? Those are the competitors.
   - Competitors solve the EXACT SAME specific problem at the EXACT SAME stage — NOT just "same industry" or "same broad audience"
   - Two products serving the same industry are NOT competitors unless a buyer would shortlist them together side-by-side
   - WRONG example: Prudent AI (mortgage income calculation) → Blend or Zillow (mortgage lenders — those are Prudent's CUSTOMERS, not competitors)
   - RIGHT example: Prudent AI → Ocrolus, Laminr, Tidalwave (all automate income verification/document analysis for lenders)
   - Competitors are OTHER VENDORS selling software — NEVER the companies that BUY or USE this product
   - For B2B SaaS: return other software vendors targeting the same buyers, NOT the buyers themselves (not banks, lenders, hospitals, enterprises)
   - It's fine to include companies that offer both a tool and services, but NEVER list pure service firms, agencies, or marketplaces with no software product
   - NEVER list: Notion, ClickUp, Asana, Trello, Miro, Airtable, Slack, Fiverr, Upwork, Toptal, Freelancer, 99designs
   - If fewer than 4 real direct competitors exist for a product line, list fewer — never pad
3. "prompts": array of exactly 8 buyer-intent queries someone would type into ChatGPT or Gemini to find this SPECIFIC type of product. If there are multiple product lines, split prompts proportionally across them (e.g. 4 + 4). Cover different angles: best-of lists, comparisons, use-case-specific, problem-solution, audience-specific.
   RULES FOR PROMPTS:
   - NO brand or product names in the query
   - Queries must reflect someone searching for SOFTWARE or an AI TOOL — not generic business advice
   - Bad example: "how to manage a solo business effectively" (too generic — returns advice, not tools)
   - Good example: "best AI workspace tool for solopreneurs to automate tasks" (returns specific software)
   - Each query must naturally lead an AI to recommend a software product, not a service or general tip
   - Vary the query style: "best X for Y", "top X tools", "X vs Y", "how to X using AI tool", "AI software for X"

Page title: ${pageData.title}
Meta description: ${pageData.metaDesc || '(none)'}
Headings: ${headingText}
Content: ${(pageData.content || '').slice(0, 4000)}
${!pageData.content || pageData.wordCount < 30 ? '\nNOTE: The crawled body content above is thin or empty (common on JavaScript-rendered sites our crawler can\'t execute) — rely primarily on the title and meta description for what this product actually does. Do not guess a broad/generic category from title words alone if the meta description gives a more specific read.' : ''}

Return ONLY valid JSON, no explanation:
{"description":"...","categories":[{"category":"...","competitors":[...]}],"prompts":[...]}`,
    }],
  });

  const text = response.choices[0].message.content.trim();
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found');
    const result = JSON.parse(match[0]);
    const categories = (result.categories || []).slice(0, 3).map(c => ({
      category: c.category || '',
      competitors: (c.competitors || []).slice(0, 4),
    })).filter(c => c.category);

    // Flat, deduped competitor list — used for scoring, which doesn't care about category grouping
    const seen = new Set();
    const competitors = [];
    for (const c of categories) {
      for (const name of c.competitors) {
        const key = name.toLowerCase();
        if (!seen.has(key)) { seen.add(key); competitors.push(name); }
      }
    }

    return {
      categoryDescription: result.description || '',
      category: categories[0]?.category || '',
      categories,
      competitors: competitors.slice(0, 6),
      prompts: (result.prompts || []).slice(0, 8),
    };
  } catch {
    throw new Error('Failed to analyze page — could not parse GPT response');
  }
}

// Primary: find direct competitors BEFORE querying LLMs, based on what the product does
async function findDirectCompetitors(categoryDescription) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 300,
    temperature: 0,
    messages: [{
      role: 'user',
      content: `A product exists in this space: ${categoryDescription}

List the 4-5 most direct competitors — tools a buyer would compare side-by-side when making a purchase decision.

Rules:
- THE BUYER TEST: If someone is actively evaluating this product, which other vendors would they have also requested a demo from in the same week?
- Competitors must solve the EXACT SAME specific problem at the same stage — not just operate in the same industry
- Competitors are other software VENDORS — never the companies that buy or use this product
- For B2B tools: return other software vendors targeting the same buyers, NOT the buyers themselves
- It's fine to include companies that offer both a tool and services, but exclude pure service firms or agencies with no software product
- Exclude generic productivity tools (Notion, Google Docs, Trello, Asana, Slack) unless the primary direct alternative for this niche
- Prefer tools known specifically for solving this exact problem

Return ONLY a valid JSON array of strings:
["Competitor1", "Competitor2", ...]`,
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

// Secondary: extract category description from page (used to seed findDirectCompetitors)
async function extractCategoryDescription(pageData) {
  const client = getClient();
  const headingText = (pageData.headings || []).slice(0, 10).map(h => h.text).join(', ');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Read this page and describe what the product does in 1-2 sentences. Do NOT mention the brand name or product name — describe only the problem it solves and who it's for.

Title: ${pageData.title}
Headings: ${headingText}
Content: ${(pageData.content || '').slice(0, 800)}

Reply with ONLY the 1-2 sentence description, nothing else.`,
    }],
  });

  return response.choices[0].message.content.trim();
}

export { analyzePageAndPrepare, findDirectCompetitors, extractCategoryDescription };
