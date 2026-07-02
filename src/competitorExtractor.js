import OpenAI from 'openai';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Single call: returns description + competitors + 3 prompts in one GPT request
async function analyzePageAndPrepare(pageData) {
  const client = getClient();
  const headingText = (pageData.headings || []).slice(0, 10).map(h => h.text).join(', ');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 700,
    messages: [{
      role: 'user',
      content: `Analyze this web page and return a JSON object with exactly 4 fields:

1. "description": 1-2 sentences describing what the product does — problem it solves and who it's for. NO brand names.
2. "category": the most specific sub-category this product belongs to (e.g. "AI agent platform for solopreneurs", NOT the broad "productivity tool").
3. "competitors": array of up to 4 real company/product BRAND NAMES that are direct competitors.
   CRITICAL: Return only BRAND NAMES of actual companies (e.g. "Zendesk", "Intercom", "Freshdesk") — NEVER return category descriptions (NOT "AI customer service platform", NOT "multi-channel support tool", NOT "intelligent ticketing system").
   Reasoning: first identify what niche/category this product is in, then think of the best-known companies operating in that same niche that a buyer would compare side-by-side.
   Rules:
   - Must be actual company or product names a buyer would search by name on Google
   - Same niche: same audience, same core job-to-be-done
   - NEVER list generic tools: Notion, ClickUp, Asana, Trello, Miro, Airtable, Slack
   - If fewer than 4 real competitors exist, list fewer — never pad with category descriptions
4. "prompts": array of exactly 3 buyer-intent queries someone would type into ChatGPT or Gemini to find this type of product. NO brand or product names. Use the specific sub-category language.

Page title: ${pageData.title}
Headings: ${headingText}
Content: ${(pageData.content || '').slice(0, 2000)}

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
      prompts: (result.prompts || []).slice(0, 3),
    };
  } catch {
    throw new Error('Failed to analyze page — could not parse GPT response');
  }
}

// Primary: find direct competitors BEFORE querying LLMs, based on what the product does
async function findDirectCompetitors(categoryDescription) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `A product exists in this space: ${categoryDescription}

List the 4-5 most direct competitors — tools a buyer would compare side-by-side when making a purchase decision.

Rules:
- Focus on tools that solve the SAME problem for the SAME audience
- Exclude generic productivity tools (Notion, Google Docs, Trello, Asana, Slack) UNLESS they are the primary direct alternative for this specific niche
- Prefer tools that are known specifically in this category

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
