import OpenAI from 'openai';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Single call: returns description + competitors + 8 prompts in one GPT request
async function analyzePageAndPrepare(pageData) {
  const client = getClient();
  const headingText = (pageData.headings || []).slice(0, 10).map(h => h.text).join(', ');

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `Analyze this web page and return a JSON object with exactly 4 fields:

1. "description": 1-2 sentences describing what the product does — problem it solves and who it's for. NO brand names.
2. "category": the most specific sub-category this product belongs to (e.g. "AI agent platform for solopreneurs", NOT the broad "productivity tool").
3. "competitors": array of up to 4 real company/product BRAND NAMES that are DIRECT competitors.
   CRITICAL RULES:
   - Return only BRAND NAMES of actual software products/companies (e.g. "Zendesk", "Intercom", "Freshdesk")
   - NEVER return category descriptions (NOT "AI customer service platform")
   - THE BUYER TEST: Ask yourself — if someone is actively evaluating THIS product, which 3-4 other vendors would they have also requested a demo from in the same week? Those are the competitors.
   - Competitors solve the EXACT SAME specific problem at the EXACT SAME stage — NOT just "same industry" or "same broad audience"
   - Two products serving the same industry are NOT competitors unless a buyer would shortlist them together side-by-side
   - WRONG example: Prudent AI (mortgage income calculation) → Blend or Zillow (mortgage lenders — those are Prudent's CUSTOMERS, not competitors)
   - RIGHT example: Prudent AI → Ocrolus, Laminr, Tidalwave (all automate income verification/document analysis for lenders)
   - Competitors are OTHER VENDORS selling software — NEVER the companies that BUY or USE this product
   - For B2B SaaS: return other software vendors targeting the same buyers, NOT the buyers themselves (not banks, lenders, hospitals, enterprises)
   - It's fine to include companies that offer both a tool and services, but NEVER list pure service firms, agencies, or marketplaces with no software product
   - NEVER list: Notion, ClickUp, Asana, Trello, Miro, Airtable, Slack, Fiverr, Upwork, Toptal, Freelancer, 99designs
   - If fewer than 4 real direct competitors exist, list fewer — never pad
4. "prompts": array of exactly 8 buyer-intent queries someone would type into ChatGPT or Gemini to find this SPECIFIC type of product. Cover different angles: best-of lists, comparisons, use-case-specific, problem-solution, audience-specific.
   RULES FOR PROMPTS:
   - NO brand or product names in the query
   - Queries must reflect someone searching for SOFTWARE or an AI TOOL — not generic business advice
   - Bad example: "how to manage a solo business effectively" (too generic — returns advice, not tools)
   - Good example: "best AI workspace tool for solopreneurs to automate tasks" (returns specific software)
   - Each query must naturally lead an AI to recommend a software product, not a service or general tip
   - Vary the query style: "best X for Y", "top X tools", "X vs Y", "how to X using AI tool", "AI software for X"

Page title: ${pageData.title}
Headings: ${headingText}
Content: ${(pageData.content || '').slice(0, 4000)}

Return ONLY valid JSON, no explanation:
{"description":"...","category":"...","competitors":[...],"prompts":[...]}`,
    }],
  });

  const text = response.choices[0].message.content.trim();
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found');
    const result = JSON.parse(match[0]);
    return {
      categoryDescription: result.description || '',
      category: result.category || '',
      competitors: (result.competitors || []).slice(0, 4),
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

// Fallback: extract brand names from LLM answers (used for keyword mode rankings)
async function extractCompetitors(llmResults) {
  const client = getClient();

  const allText = Object.entries(llmResults)
    .flatMap(([llm, answers]) =>
      (answers || []).map(({ answer }) => `[${llm.toUpperCase()}] ${answer || ''}`)
    )
    .join('\n\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Extract all brand and company names mentioned in these AI search answers. Sort by how often they appear (most frequent first). Return only real brand/company names, not generic terms.

AI ANSWERS:
${allText.slice(0, 6000)}

Return ONLY a valid JSON array of strings:
["Brand1", "Brand2", ...]`,
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

export { analyzePageAndPrepare, findDirectCompetitors, extractCategoryDescription, extractCompetitors };
