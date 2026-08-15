import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { queryAllQuestionsGPT } from './src/openaiClient_aeo.js';
import { queryAllQuestionsGemini } from './src/geminiClient_aeo.js';
import { queryAllQuestionsGoogleAIO } from './src/googleAIOClient.js';
import { scoreVisibility } from './src/visibilityScorer.js';
import { readWebPage } from './src/webReader.js';
import { analyzePageAndPrepare, extractCompetitors } from './src/competitorExtractor.js';
import { generateActionsOpenAI } from './src/actionGenerator.js';
import { saveRun } from './src/runLogger.js';
import { checkCrawlerAccess } from './src/robotsChecker.js';

dotenv.config();

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
);

// Supabase admin client (service key bypasses RLS for server-side ops)
const supabaseAdmin = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

const hasKey = (name) => !!process.env[name];

const app = express();
app.use(cors());
app.use(express.json());


function isUrlInput(str) {
  return /^https?:\/\//i.test(str) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/|$)/.test(str);
}

function normalizeUrl(str) {
  return /^https?:\/\//i.test(str) ? str : `https://${str}`;
}

function extractHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

function extractBrandFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const name = hostname.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return 'Your Brand';
  }
}

function countBrandMentions(llmResults, brands, totalCombinations) {
  return brands.map(brand => {
    let mentions = 0;
    for (const answers of Object.values(llmResults)) {
      for (const { answer } of (answers || [])) {
        if (answer && answer.toLowerCase().includes(brand.toLowerCase())) mentions++;
      }
    }
    return { brand, mentions, pct: totalCombinations > 0 ? Math.round((mentions / totalCombinations) * 100) : 0 };
  }).sort((a, b) => b.mentions - a.mentions);
}

app.post('/api/v3/analyze', async (req, res) => {
  const { input, llms: requestedLLMs } = req.body;

  if (!input || typeof input !== 'string' || !input.trim()) {
    return res.status(400).json({ error: 'input is required' });
  }
  if (!hasKey('OPENAI_API_KEY')) {
    return res.status(400).json({ error: 'OPENAI_API_KEY is not configured. Add it to .env' });
  }

  // Verify auth + enforce free tier limits:
  // - Same website: up to 3 re-runs allowed
  // - Different website: blocked, must upgrade
  let userId = null;
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const trimmed = input.trim();
  const url = normalizeUrl(trimmed);

  if (token && supabaseAdmin) {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (!authErr && user) {
      userId = user.id;
      const isAdmin = ADMIN_EMAILS.has((user.email || '').toLowerCase());
      if (!isAdmin) {
        const { data: userRuns } = await supabaseAdmin
          .from('runs')
          .select('url')
          .eq('user_id', userId);

        const runs = userRuns || [];
        if (runs.length > 0) {
          const newHost = extractHostname(url);
          const existingHosts = [...new Set(runs.map(r => extractHostname(normalizeUrl(r.url))))];
          const isSameUrl = existingHosts.includes(newHost);

          if (!isSameUrl) {
            return res.status(403).json({ error: 'run_limit_exceeded' });
          }

          const sameUrlCount = runs.filter(r => extractHostname(normalizeUrl(r.url)) === newHost).length;
          if (sameUrlCount >= 3) {
            return res.status(403).json({ error: 'run_limit_exceeded' });
          }
        }
      }
    }
  }

  try {
    // Step 1: fetch page + robots.txt in parallel
    const [pageData, crawlerStatus] = await Promise.all([
      readWebPage(url),
      checkCrawlerAccess(url),
    ]);

    const brand = extractBrandFromUrl(url);

    // Step 2: single GPT call returns description + competitors + 3 prompts
    const { categoryDescription, category, competitors, prompts } = await analyzePageAndPrepare(pageData);

    if (!prompts || prompts.length === 0) {
      return res.status(500).json({ error: 'Failed to generate prompts from page' });
    }

    // Step 3: query all LLMs in parallel
    const enabledLLMs = requestedLLMs || ['chatgpt', 'gemini'];
    const llmJobs = {};
    // claude: not wired (ANTHROPIC_API_KEY intentionally empty)
    if (enabledLLMs.includes('chatgpt') && hasKey('OPENAI_API_KEY')) llmJobs.chatgpt = queryAllQuestionsGPT(prompts);
    if (enabledLLMs.includes('gemini') && hasKey('GEMINI_API_KEY')) llmJobs.gemini = queryAllQuestionsGemini(prompts);
    if (enabledLLMs.includes('googleaio') && hasKey('SERPER_API_KEY')) llmJobs.googleaio = queryAllQuestionsGoogleAIO(prompts);

    if (Object.keys(llmJobs).length === 0) {
      return res.status(400).json({ error: 'No LLM API keys configured' });
    }

    const llmNames = Object.keys(llmJobs);
    const llmAnswers = await Promise.all(Object.values(llmJobs));
    const llmResults = Object.fromEntries(llmNames.map((name, i) => [name, llmAnswers[i]]));

    let visibility = scoreVisibility({ llmResults, brand, competitors });

    // Fallback: if pre-selected competitors all scored 0%, extract real brands from LLM answers
    const allCompetitorsZero = competitors.every(c => (visibility.aggregatePercentages[c] ?? 0) === 0)
    if (allCompetitorsZero) {
      try {
        const mentionedBrands = await extractCompetitors(llmResults)
        const realCompetitors = mentionedBrands
          .filter(b => b.toLowerCase() !== brand.toLowerCase())
          .slice(0, 4)
        if (realCompetitors.length > 0) {
          competitors = realCompetitors
          visibility = scoreVisibility({ llmResults, brand, competitors })
        }
      } catch (err) {
        console.error('Competitor fallback error:', err.message)
      }
    }

    // Generate actions from gaps using OpenAI (no Anthropic needed)
    const actions = await generateActionsOpenAI({
      gaps: visibility.gaps || [],
      brand,
      llmResults,
    }).catch(err => { console.error('Action generation error:', err.message); return []; });

    const responsePayload = {
      mode: 'url',
      brand,
      competitors,
      prompts,
      llmsQueried: llmNames,
      visibility,
      categoryDescription,
      category,
      pageData: { url: pageData.url, title: pageData.title, wordCount: pageData.wordCount, crawlerText: (pageData.content || '').slice(0, 1500) },
      crawlerStatus,
      actions,
    };

    // Save run locally (non-blocking)
    saveRun({
      input: trimmed,
      ...responsePayload,
      llmAnswers: llmResults,
    });

    // Save run to Supabase for admin visibility + run limit tracking
    if (supabaseAdmin && userId) {
      supabaseAdmin.from('runs').insert({
        user_id: userId,
        url: trimmed,
        brand,
        visibility_score: visibility.overallPercentage ?? 0,
        result_json: responsePayload,
        created_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error('Supabase run save error:', error.message);
      });
    }

    res.json(responsePayload);
  } catch (err) {
    console.error('V3 analyze error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Lightweight endpoint: run just LLM queries for given prompts (no web scraping, no prep)
app.post('/api/v3/check-prompts', async (req, res) => {
  const { brand, prompts, llms: requestedLLMs } = req.body;
  if (!brand || !Array.isArray(prompts) || prompts.length === 0) {
    return res.status(400).json({ error: 'brand and prompts[] are required' });
  }
  if (!hasKey('OPENAI_API_KEY')) {
    return res.status(400).json({ error: 'OPENAI_API_KEY not configured' });
  }

  try {
    const enabledLLMs = requestedLLMs || ['chatgpt', 'gemini'];
    const llmJobs = {};
    if (enabledLLMs.includes('chatgpt') && hasKey('OPENAI_API_KEY')) llmJobs.chatgpt = queryAllQuestionsGPT(prompts);
    if (enabledLLMs.includes('gemini') && hasKey('GEMINI_API_KEY')) llmJobs.gemini = queryAllQuestionsGemini(prompts);
    if (enabledLLMs.includes('googleaio') && hasKey('SERPER_API_KEY')) llmJobs.googleaio = queryAllQuestionsGoogleAIO(prompts);

    const llmNames = Object.keys(llmJobs);
    const llmAnswers = await Promise.all(Object.values(llmJobs));
    const llmResults = Object.fromEntries(llmNames.map((name, i) => [name, llmAnswers[i]]));

    const visibility = scoreVisibility({ llmResults, brand, competitors: [] });

    res.json({ llmsQueried: llmNames, llmResults, visibility });
  } catch (err) {
    console.error('check-prompts error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/runs', (_req, res) => {
  const dir = path.join(process.cwd(), 'output', 'runs');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  } catch {
    return res.json([]);
  }

  const runs = files
    .map((file) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
        const allBrandPcts = data.visibility?.aggregatePercentages || {};
        const brandPct = allBrandPcts[data.brand] ?? 0;
        const competitorEntries = Object.entries(allBrandPcts).filter(([b]) => b !== data.brand);
        const [topCompetitor, topCompetitorPct] = competitorEntries.sort((a, b) => b[1] - a[1])[0] || [null, 0];

        return {
          savedAt: data.savedAt,
          input: data.input,
          mode: data.mode,
          brand: data.brand,
          competitors: data.competitors || [],
          llmsQueried: data.llmsQueried || [],
          brandPct,
          topCompetitor,
          topCompetitorPct,
          missedPrompts: data.visibility?.gaps?.length || 0,
          totalPrompts: data.prompts?.length || 0,
          allBrandPcts,
          prompts: data.prompts || [],
          gaps: data.visibility?.gaps || [],
          actions: data.actions || [],
          blogGaps: data.blogGaps || [],
          llmAnswers: data.llmAnswers || {},
          crawlerStatus: data.crawlerStatus || null,
          visibility: data.visibility || null,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

  res.json(runs);
});

app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    keys: {
      anthropic: hasKey('ANTHROPIC_API_KEY'),
      claude_aeo: hasKey('ANTHROPIC_API_KEY'),
      openai: hasKey('OPENAI_API_KEY'),
      gemini: hasKey('GEMINI_API_KEY'),
      googleaio: hasKey('SERPER_API_KEY'),
      supabase: hasKey('SUPABASE_URL'),
      dodo: hasKey('DODO_API_KEY'),
    },
  })
);

// ─── Email Report ─────────────────────────────────────────────────────────────

app.post('/api/email-report', async (req, res) => {
  const { email, result } = req.body;
  if (!email || !result) return res.status(400).json({ error: 'email and result are required' });
  if (!hasKey('RESEND_API_KEY')) return res.status(503).json({ error: 'Email not configured — add RESEND_API_KEY to .env' });

  const { brand, visibility, prompts = [], competitors = [], actions = [] } = result;
  const score = visibility?.overallPercentage ?? 0;
  const gaps = visibility?.gaps?.length ?? 0;
  const topComp = Object.entries(visibility?.aggregatePercentages || {})
    .filter(([b]) => b !== brand)
    .sort((a, b) => b[1] - a[1])[0];

  const actionHtml = actions.slice(0, 3).map(a =>
    `<li style="margin-bottom:8px"><strong>${a.title || a.action}</strong>: ${(a.rationale || a.description || '').slice(0, 150)}</li>`
  ).join('');

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#172554">
  <div style="background:#1e3a8a;padding:32px;border-radius:16px 16px 0 0">
    <h1 style="color:white;margin:0;font-size:22px">AI Visibility Report</h1>
    <p style="color:#bfdbfe;margin:8px 0 0">${brand}</p>
  </div>
  <div style="background:#eff6ff;padding:24px;border-radius:0 0 16px 16px">
    <div style="display:flex;gap:16px;margin-bottom:24px">
      <div style="background:white;border-radius:12px;padding:16px;flex:1;text-align:center">
        <div style="font-size:32px;font-weight:bold;color:#2563eb">${score}%</div>
        <div style="font-size:12px;color:#677085">AI Visibility Score</div>
      </div>
      <div style="background:white;border-radius:12px;padding:16px;flex:1;text-align:center">
        <div style="font-size:32px;font-weight:bold;color:#dc2626">${gaps}</div>
        <div style="font-size:12px;color:#677085">Missed Prompts</div>
      </div>
      ${topComp ? `<div style="background:white;border-radius:12px;padding:16px;flex:1;text-align:center">
        <div style="font-size:18px;font-weight:bold;color:#172554">${topComp[0]}</div>
        <div style="font-size:12px;color:#677085">Top Competitor (${topComp[1]}%)</div>
      </div>` : ''}
    </div>
    ${actionHtml ? `<div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px">
      <h3 style="margin:0 0 12px;font-size:14px;color:#172554">Top Recommended Actions</h3>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#677085">${actionHtml}</ul>
    </div>` : ''}
    <p style="text-align:center;margin:16px 0 0">
      <a href="${process.env.APP_URL || 'https://www.gotopeach.com'}/app" style="background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        View full report →
      </a>
    </p>
  </div>
  <p style="font-size:11px;color:#94a3b8;text-align:center;margin-top:16px">Sent by Peach · <a href="mailto:hello@gotopeach.com" style="color:#94a3b8">hello@gotopeach.com</a></p>
</div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Peach <hello@gotopeach.com>',
        to: [email],
        subject: `Your AI Visibility Report — ${brand} scored ${score}%`,
        html,
      }),
    });
    if (!r.ok) {
      const err = await r.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    res.json({ sent: true });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ─── Dodo Payments ────────────────────────────────────────────────────────────

const DODO_PRODUCT_IDS = {
  starter: process.env.DODO_STARTER_PRODUCT_ID,
  growth: process.env.DODO_GROWTH_PRODUCT_ID,
};

app.post('/api/checkout', async (req, res) => {
  const { plan, email } = req.body;
  const productId = DODO_PRODUCT_IDS[plan];
  if (!productId) return res.status(400).json({ error: `Unknown plan: ${plan}` });
  if (!hasKey('DODO_API_KEY')) return res.status(503).json({ error: 'Payments not configured' });

  let supabaseUserId = null;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && supabaseAdmin) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) supabaseUserId = user.id;
  }

  try {
    const { default: DodoPayments } = await import('dodopayments');
    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_API_KEY,
      environment: process.env.DODO_ENV === 'live' ? 'live_mode' : 'test_mode',
    });

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      ...(email ? { customer: { email } } : {}),
      ...(supabaseUserId ? { metadata: { supabase_user_id: supabaseUserId } } : {}),
      return_url: `${process.env.APP_URL || 'http://localhost:5173'}/app?checkout=success`,
    });

    res.json({ checkoutUrl: session.checkout_url });
  } catch (err) {
    console.error('Dodo checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.post('/api/webhooks/dodo', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'Webhook secret not configured' });

  // Verify HMAC-SHA256 signature
  const signature = req.headers['webhook-signature'] || req.headers['x-dodo-signature'];
  if (signature) {
    const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
    if (signature !== expected && `sha256=${expected}` !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }

  let event;
  try { event = JSON.parse(req.body.toString()); }
  catch { return res.status(400).json({ error: 'Invalid JSON' }); }

  const type = event.type;
  const data = event.data || {};
  console.log(`Dodo webhook: ${type}`, data.payment_id || data.subscription_id || '');

  const supabaseUserId = data.metadata?.supabase_user_id;
  if (supabaseAdmin && supabaseUserId) {
    const planFromProductId = Object.entries(DODO_PRODUCT_IDS)
      .find(([, id]) => id && id === data.product_id)?.[0];

    const ACTIVE_EVENTS = ['subscription.active', 'subscription.renewed', 'subscription.plan_changed', 'subscription.updated'];
    const INACTIVE_STATUS = {
      'subscription.cancelled': 'cancelled',
      'subscription.expired': 'expired',
      'subscription.failed': 'failed',
      'subscription.on_hold': 'on_hold',
      'subscription.paused': 'paused',
    };

    if (ACTIVE_EVENTS.includes(type)) {
      await supabaseAdmin.from('profiles').upsert({
        id: supabaseUserId,
        ...(planFromProductId ? { plan: planFromProductId } : {}),
        subscription_status: 'active',
        dodo_customer_id: data.customer?.customer_id || data.customer_id || null,
        dodo_subscription_id: data.subscription_id || null,
        updated_at: new Date().toISOString(),
      });
    } else if (type in INACTIVE_STATUS) {
      await supabaseAdmin.from('profiles').update({
        subscription_status: INACTIVE_STATUS[type],
        updated_at: new Date().toISOString(),
      }).eq('id', supabaseUserId);
    }
  }

  res.json({ received: true });
});

// ─── Article generation ───────────────────────────────────────────────────────
app.post('/api/articles/generate', async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured' });
  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const isAdmin = ADMIN_EMAILS.has((user.email || '').toLowerCase());

  if (!isAdmin) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('articles_used, articles_reset_at, plan')
      .eq('id', user.id)
      .single();
    const now = new Date();
    const resetAt = profile?.articles_reset_at ? new Date(profile.articles_reset_at) : null;
    const monthExpired = !resetAt || (now - resetAt) > 30 * 24 * 60 * 60 * 1000;
    const used = monthExpired ? 0 : (profile?.articles_used || 0);
    const limit = { starter: 15, growth: 30 }[profile?.plan] ?? 0;
    if (limit === 0) return res.status(403).json({ error: 'upgrade_required' });
    if (used >= limit) return res.status(403).json({ error: 'article_limit_reached', used, limit });

    // Increment usage
    if (monthExpired) {
      await supabaseAdmin.from('profiles').upsert({ id: user.id, articles_used: 1, articles_reset_at: now.toISOString() });
    } else {
      await supabaseAdmin.from('profiles').update({ articles_used: used + 1 }).eq('id', user.id);
    }
  }

  const { title, h1, outline = [], targetQuery, brand } = req.body;
  const sectionPrompts = outline.map(s =>
    `## ${s.h2}\n${(s.h3s || []).map(h => `### ${h}`).join('\n')}`
  ).join('\n\n');

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are a senior B2B content writer. Write a complete, publication-ready article in the style of ClickUp's blog and Hiver's guides — conversational but authoritative, evidence-backed, and written for busy professionals who scan before they read.

Brand writing this article: "${brand}"
H1: ${h1}
Target buyer query the article must answer: "${targetQuery}"

---

STYLE GUIDE (follow exactly):

**INTRODUCTION (150–200 words, 3–4 short paragraphs)**
- Open with a vivid scenario, a surprising stat, or a bold claim — never "In today's world" or "As businesses grow"
- Use the problem-agitate-solve framework: name the challenge, make it feel real, then hint at the solution
- End the intro with 1 clear sentence that tells the reader what they'll learn
- Use "you" and "your team" throughout

**H2 SECTIONS**
- Open every H2 with 1–2 punchy sentences that state a problem or make a claim — not a dictionary definition
- Then expand with 120–180 words of prose, mixing short (1–2 sentence) punchy paras with 3–4 sentence explanatory ones
- Include at least one concrete example, real stat, or scenario per H2 — made up but believable (e.g. "teams using X saw a 40% drop in...")
- Use bullet or numbered lists ONLY when you have 3+ items that genuinely benefit from scanning — never bullet everything
- Numbered lists for steps/processes, bullet lists for features/benefits
- End each H2 with a transition sentence that flows into the next topic

**H3 SUBSECTIONS**
- 80–120 words of focused prose or a tight numbered/bulleted list
- Be specific — name tactics, tools, frameworks, not vague advice

**CONCLUSION (3 short paragraphs)**
- Paragraph 1: Summarise the core insight in 2 sentences
- Paragraph 2: Reframe why this matters for the reader's business specifically
- Paragraph 3: Bridge directly to the CTA

**CTA (final section, after conclusion)**
Use this exact format:
## Ready to [benefit relevant to article topic]?
[1 sentence describing what ${brand} does and how it solves the exact problem in this article.]
[Try/Start/See] ${brand} [free/today] → [link]

---

BANNED phrases (never use these):
"In today's fast-paced world", "It's important to note", "Leveraging", "In conclusion", "To summarize", "At the end of the day", "Game-changer", "Seamlessly", "Robust", "Cutting-edge", "This is where X comes in"

---

Structure to follow:
${sectionPrompts}

---

Return ONLY the full article in Markdown. Start with # ${h1} and end with the CTA section. No preamble, no "Here is your article:".`
      }]
    });

    const markdown = completion.choices[0].message.content.trim();

    // Save to Supabase (non-blocking, best-effort)
    supabaseAdmin.from('articles').insert({
      user_id: user.id, title, h1, target_query: targetQuery,
      content_markdown: markdown, brand, created_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.error('Article save error:', error.message); });

    res.json({ markdown });
  } catch (err) {
    console.error('Article generation error:', err.message);
    res.status(500).json({ error: 'Article generation failed. Try again.' });
  }
});

// ─── Profile save (onboarding) ───────────────────────────────────────────────
app.post('/api/profile/save', async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase not configured' });
  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { company_name, industry, website_url, role } = req.body;
  const { error } = await supabaseAdmin.from('profiles').upsert(
    { id: user.id, company_name, industry, website_url, role },
    { onConflict: 'id' }
  );
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Serve React frontend from dist/ (after `npm run build`)
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const distPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Local dev only — Vercel imports this file and uses the exported app
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
