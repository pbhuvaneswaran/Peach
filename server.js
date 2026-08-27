import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import pLimit from 'p-limit';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { queryAllQuestionsGPT } from './src/openaiClient_aeo.js';
import { queryAllQuestionsGemini } from './src/geminiClient_aeo.js';
import { queryAllQuestionsGoogleAIO, searchWeb } from './src/googleAIOClient.js';
import { scoreVisibility } from './src/visibilityScorer.js';
import { readWebPage } from './src/webReader.js';
import { analyzePageAndPrepare, findDirectCompetitors } from './src/competitorExtractor.js';
import { generateActionsOpenAI } from './src/actionGenerator.js';
import { saveRun } from './src/runLogger.js';
import { checkCrawlerAccess } from './src/robotsChecker.js';
import { analyzeCadence, recommendPace } from './src/blogCadenceAnalyzer.js';
import { generateTopics } from './src/topicIdeator.js';
import { generateOutline } from './src/outlineGenerator.js';
import { checkArticleQuality, BANNED_PHRASES } from './src/qualityChecks.js';
import { signState, verifyState } from './src/oauthState.js';
import { getPublisher } from './src/publishers/registry.js';

dotenv.config();

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
);

// Supabase admin client (service key bypasses RLS for server-side ops)
const supabaseAdmin = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

const hasKey = (name) => !!process.env[name];
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Shared auth helper — used by every /api/articles/* and /api/v3/runs route below.
async function authenticateUser(req) {
  if (!supabaseAdmin) return { error: 'no_supabase' };
  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!token) return { error: 'unauthorized' };
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { error: 'unauthorized' };
  return { user };
}

const ARTICLE_LIMITS = { starter: 20, growth: 40 };

// Single source of truth for the 30-day-rolling article quota, so /api/articles/generate,
// /api/articles/quota, and the topic/outline batch-size logic can't drift out of sync.
function getArticleQuota(profile) {
  const now = new Date();
  const resetAt = profile?.articles_reset_at ? new Date(profile.articles_reset_at) : null;
  const monthExpired = !resetAt || (now - resetAt) > 30 * 24 * 60 * 60 * 1000;
  const used = monthExpired ? 0 : (profile?.articles_used || 0);
  const limit = ARTICLE_LIMITS[profile?.plan] ?? 0;
  return {
    plan: profile?.plan || null,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    monthExpired,
    resetAt: profile?.articles_reset_at || null,
  };
}

const turndownService = new TurndownService({ headingStyle: 'atx' });
const markdownToHtml = (md) => marked.parse(md || '');
const htmlToMarkdown = (html) => turndownService.turndown(html || '');

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

    // Step 2: single GPT call returns description + competitors (grouped by product line) + prompts
    const { categoryDescription, category, categories, competitors: initialCompetitors, prompts } = await analyzePageAndPrepare(pageData);
    let competitors = initialCompetitors;
    let competitorCategories = categories;

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

    // Fallback: if pre-selected competitors all scored 0%, get a second Buyer-Test-filtered
    // opinion from the category description directly — NOT by extracting brand names out of
    // the LLM answers, since those answers are often generic and full of broad platform names
    // (Microsoft/Google/Amazon/IBM) that fail the Buyer Test for a narrow/niche product.
    const allCompetitorsZero = competitors.every(c => (visibility.aggregatePercentages[c] ?? 0) === 0)
    let competitorEvidence = {};
    if (allCompetitorsZero) {
      try {
        const found = (await findDirectCompetitors(categoryDescription))
          .filter(c => c.name.toLowerCase() !== brand.toLowerCase())
          .slice(0, 4)
        if (found.length > 0) {
          competitors = found.map(c => c.name)
          competitorCategories = [{ category: category || 'Alternate competitor read', competitors }]
          competitorEvidence = Object.fromEntries(
            found.filter(c => c.evidence).map(c => [c.name.toLowerCase(), c.evidence])
          )
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
      competitorCategories,
      competitorEvidence,
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

let dodoClient = null;
async function getDodoClient() {
  if (!dodoClient) {
    const { default: DodoPayments } = await import('dodopayments');
    dodoClient = new DodoPayments({
      bearerToken: process.env.DODO_API_KEY,
      environment: process.env.DODO_ENV === 'live' ? 'live_mode' : 'test_mode',
    });
  }
  return dodoClient;
}

// Live prices, pulled directly from Dodo so the pricing page never drifts from what's
// actually configured/charged. Short in-memory cache so normal page traffic doesn't
// hammer the Dodo API on every load, while still picking up a dashboard price change
// within a minute.
let pricingCache = { data: null, fetchedAt: 0 };
const PRICING_CACHE_MS = 60 * 1000;

app.get('/api/pricing', async (_req, res) => {
  if (!hasKey('DODO_API_KEY')) return res.status(503).json({ error: 'Payments not configured' });

  if (pricingCache.data && Date.now() - pricingCache.fetchedAt < PRICING_CACHE_MS) {
    return res.json(pricingCache.data);
  }

  try {
    const dodo = await getDodoClient();
    const entries = await Promise.all(
      Object.entries(DODO_PRODUCT_IDS).map(async ([plan, productId]) => {
        if (!productId) return [plan, null];
        const product = await dodo.products.retrieve(productId);
        const p = product.price;
        if (!p || p.type !== 'recurring_price') return [plan, null];

        // Normalize to a monthly amount regardless of the product's billing interval
        const amountPerCharge = p.price / 100;
        const count = p.payment_frequency_count || 1;
        let monthly = amountPerCharge; // fallback: assume already monthly
        if (p.payment_frequency_interval === 'Month') monthly = amountPerCharge / count;
        else if (p.payment_frequency_interval === 'Year') monthly = amountPerCharge / (12 * count);

        return [plan, { monthly: Math.round(monthly), currency: p.currency }];
      })
    );
    const data = Object.fromEntries(entries);
    pricingCache = { data, fetchedAt: Date.now() };
    res.json(data);
  } catch (err) {
    console.error('Dodo pricing fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch live pricing' });
  }
});

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
    const dodo = await getDodoClient();

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      feature_flags: { allow_currency_selection: false },
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

// ─── Article pipeline: run listing + quota ──────────────────────────────────
app.get('/api/v3/runs', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { data, error: dbErr } = await supabaseAdmin
    .from('runs')
    .select('id, url, brand, visibility_score, result_json, cadence_json, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (dbErr) return res.status(500).json({ error: dbErr.message });

  res.json((data || []).map((r) => ({
    id: r.id,
    url: r.url,
    brand: r.brand,
    visibilityScore: r.visibility_score,
    category: r.result_json?.category,
    competitors: r.result_json?.competitors || [],
    prompts: r.result_json?.prompts || [],
    gaps: r.result_json?.visibility?.gaps || [],
    cadence: r.cadence_json || null,
    createdAt: r.created_at,
  })));
});

app.get('/api/articles/quota', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('articles_used, articles_reset_at, plan')
    .eq('id', user.id)
    .single();

  const isAdmin = ADMIN_EMAILS.has((user.email || '').toLowerCase());
  const quota = getArticleQuota(profile);
  res.json(isAdmin ? { ...quota, admin: true, remaining: Infinity } : quota);
});

// ─── Stage 1: topics ─────────────────────────────────────────────────────────
app.post('/api/articles/topics/generate', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });
  if (!hasKey('OPENAI_API_KEY')) return res.status(400).json({ error: 'OPENAI_API_KEY is not configured' });

  const { runId } = req.body;
  if (!runId) return res.status(400).json({ error: 'runId is required' });

  const isAdmin = ADMIN_EMAILS.has((user.email || '').toLowerCase());
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('articles_used, articles_reset_at, plan')
    .eq('id', user.id)
    .single();
  const quota = getArticleQuota(profile);
  if (!isAdmin) {
    if (quota.limit === 0) return res.status(403).json({ error: 'upgrade_required' });
    if (quota.remaining === 0) return res.status(403).json({ error: 'article_limit_reached', used: quota.used, limit: quota.limit });
  }
  const targetCount = isAdmin ? 20 : quota.remaining;

  const { data: run, error: runErr } = await supabaseAdmin
    .from('runs')
    .select('brand, url, result_json, cadence_json')
    .eq('id', runId)
    .eq('user_id', user.id)
    .single();
  if (runErr || !run) return res.status(404).json({ error: 'run_not_found' });

  try {
    const brand = run.brand;
    const category = run.result_json?.category;
    const competitors = run.result_json?.competitors || [];
    const gaps = run.result_json?.visibility?.gaps || [];
    const prompts = run.result_json?.prompts || [];

    let cadence = run.cadence_json;
    if (!cadence) {
      cadence = await analyzeCadence(run.url).catch(() => ({ available: false }));
      supabaseAdmin.from('runs').update({ cadence_json: cadence }).eq('id', runId).then(() => {});
    }

    let siteContent = null;
    try {
      siteContent = await readWebPage(normalizeUrl(run.url));
    } catch {
      siteContent = null;
    }

    let competitorResearch = [];
    const siteIsThin = !siteContent || (siteContent.headings || []).length < 5;
    if ((!cadence?.available || siteIsThin) && hasKey('SERPER_API_KEY') && competitors.length > 0) {
      try {
        const results = await Promise.all(
          competitors.slice(0, 3).map((c) => searchWeb(`${c} blog`).catch(() => []))
        );
        competitorResearch = results.flat();
      } catch {
        competitorResearch = [];
      }
    }

    const { topics, shortfall } = await generateTopics({
      brand, siteContent, competitors, gaps, prompts, category, competitorResearch, count: targetCount,
    });

    const monthKey = new Date().toISOString().slice(0, 7);
    const rows = topics.map((t) => ({
      user_id: user.id,
      run_id: runId,
      brand,
      title: t.title,
      reasoning: t.reasoning,
      target_query: t.targetQuery || '',
      source: 'generated',
      status: 'proposed',
      month_key: monthKey,
    }));

    let inserted = [];
    if (rows.length > 0) {
      const { data, error: insErr } = await supabaseAdmin.from('article_topics').insert(rows).select();
      if (insErr) return res.status(500).json({ error: insErr.message });
      inserted = data || [];
    }

    const recommended = recommendPace(cadence, quota.limit || 20);
    res.json({
      topics: inserted,
      monthKey,
      generated: inserted.length,
      shortfall,
      cadence: {
        available: !!cadence?.available,
        avgPerMonth: cadence?.avgPerMonth ?? null,
        postsLast6Months: cadence?.postsLast6Months ?? null,
        recommended,
      },
    });
  } catch (err) {
    console.error('Topic generation error:', err.message);
    res.status(500).json({ error: 'Topic generation failed. Try again.' });
  }
});

app.post('/api/articles/topics', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { runId, title, reasoning, targetQuery } = req.body;
  if (!runId || !title) return res.status(400).json({ error: 'runId and title are required' });

  const { data: run, error: runErr } = await supabaseAdmin
    .from('runs').select('brand').eq('id', runId).eq('user_id', user.id).single();
  if (runErr || !run) return res.status(404).json({ error: 'run_not_found' });

  const monthKey = new Date().toISOString().slice(0, 7);
  const { data, error: insErr } = await supabaseAdmin.from('article_topics').insert({
    user_id: user.id, run_id: runId, brand: run.brand, title,
    reasoning: reasoning || 'Added manually by the user.',
    target_query: targetQuery || '', source: 'user_added', status: 'approved', month_key: monthKey,
  }).select().single();
  if (insErr) return res.status(500).json({ error: insErr.message });

  res.json({ topic: data });
});

app.patch('/api/articles/topics/:id', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { status, title, reasoning } = req.body;
  const patch = {};
  if (status) patch.status = status;
  if (title) patch.title = title;
  if (reasoning) patch.reasoning = reasoning;
  if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'nothing to update' });

  const { data, error: updErr } = await supabaseAdmin
    .from('article_topics').update(patch).eq('id', req.params.id).eq('user_id', user.id).select().single();
  if (updErr) return res.status(500).json({ error: updErr.message });
  if (!data) return res.status(404).json({ error: 'topic_not_found' });

  res.json({ topic: data });
});

app.get('/api/articles/topics', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  let query = supabaseAdmin.from('article_topics').select('*').eq('user_id', user.id);
  if (req.query.runId) query = query.eq('run_id', req.query.runId);
  if (req.query.monthKey) query = query.eq('month_key', req.query.monthKey);
  // Secondary sort by id: topics from one "generate this month's topics" batch share the
  // exact same created_at (single INSERT), so created_at alone doesn't guarantee a stable
  // order across repeated fetches — the frontend relies on this list's order staying put.
  const { data, error: dbErr } = await query.order('created_at', { ascending: true }).order('id', { ascending: true });
  if (dbErr) return res.status(500).json({ error: dbErr.message });

  res.json(data || []);
});

// ─── Stage 2: outlines ───────────────────────────────────────────────────────
app.post('/api/articles/outlines/generate', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });
  if (!hasKey('OPENAI_API_KEY')) return res.status(400).json({ error: 'OPENAI_API_KEY is not configured' });

  const { topicIds } = req.body;
  if (!Array.isArray(topicIds) || topicIds.length === 0) return res.status(400).json({ error: 'topicIds[] is required' });

  const { data: topics, error: topicErr } = await supabaseAdmin
    .from('article_topics').select('*').in('id', topicIds).eq('user_id', user.id).eq('status', 'approved');
  if (topicErr) return res.status(500).json({ error: topicErr.message });
  if (!topics || topics.length === 0) return res.status(404).json({ error: 'no_approved_topics_found' });

  const limit = pLimit(3);
  const results = await Promise.all(topics.map((topic) => limit(async () => {
    const outline = await generateOutline({
      title: topic.title, reasoning: topic.reasoning, targetQuery: topic.target_query,
      brand: topic.brand, category: null,
    }).catch(() => null);
    return { topic, outline };
  })));

  const rows = results
    .filter((r) => r.outline)
    .map((r) => ({
      user_id: user.id, topic_id: r.topic.id, h1: r.outline.h1,
      outline_json: r.outline.outline, status: 'draft',
      target_keyword: r.topic.target_query, angle: r.outline.angle, evidence_quote: r.topic.reasoning,
    }));

  const failed = results.filter((r) => !r.outline).map((r) => r.topic.id);

  let inserted = [];
  if (rows.length > 0) {
    const { data, error: insErr } = await supabaseAdmin.from('article_outlines').insert(rows).select();
    if (insErr) return res.status(500).json({ error: insErr.message });
    inserted = data || [];
  }

  res.json({ outlines: inserted, failed });
});

app.patch('/api/articles/outlines/:id', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { h1, outline_json, target_keyword, angle } = req.body;
  const patch = { updated_at: new Date().toISOString() };
  if (h1) patch.h1 = h1;
  if (outline_json) patch.outline_json = outline_json;
  if (target_keyword !== undefined) patch.target_keyword = target_keyword;
  if (angle !== undefined) patch.angle = angle;

  const { data, error: updErr } = await supabaseAdmin
    .from('article_outlines').update(patch).eq('id', req.params.id).eq('user_id', user.id).select().single();
  if (updErr) return res.status(500).json({ error: updErr.message });
  if (!data) return res.status(404).json({ error: 'outline_not_found' });

  res.json({ outline: data });
});

app.post('/api/articles/outlines/:id/approve', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { data, error: updErr } = await supabaseAdmin
    .from('article_outlines').update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', req.params.id).eq('user_id', user.id).select().single();
  if (updErr) return res.status(500).json({ error: updErr.message });
  if (!data) return res.status(404).json({ error: 'outline_not_found' });

  res.json({ outline: data });
});

app.get('/api/articles/outlines', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { data: topics, error: topicErr } = await supabaseAdmin
    .from('article_topics').select('id').eq('user_id', user.id);
  if (topicErr) return res.status(500).json({ error: topicErr.message });
  const topicIds = (topics || []).map((t) => t.id);
  if (topicIds.length === 0) return res.json([]);

  let query = supabaseAdmin.from('article_outlines').select('*').eq('user_id', user.id).in('topic_id', topicIds);
  const { data, error: dbErr } = await query.order('created_at', { ascending: true });
  if (dbErr) return res.status(500).json({ error: dbErr.message });

  res.json(data || []);
});

// ─── Stage 3: article generation + quality checks ───────────────────────────
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
    const quota = getArticleQuota(profile);
    if (quota.limit === 0) return res.status(403).json({ error: 'upgrade_required' });
    if (quota.remaining === 0) return res.status(403).json({ error: 'article_limit_reached', used: quota.used, limit: quota.limit });

    if (quota.monthExpired) {
      await supabaseAdmin.from('profiles').upsert({ id: user.id, articles_used: 1, articles_reset_at: new Date().toISOString() });
    } else {
      await supabaseAdmin.from('profiles').update({ articles_used: quota.used + 1 }).eq('id', user.id);
    }
  }

  let { title, h1, outline = [], targetQuery, brand, outlineId } = req.body;
  let angle = '';

  if (outlineId) {
    const { data: outlineRow, error: outlineErr } = await supabaseAdmin
      .from('article_outlines').select('*, article_topics(*)').eq('id', outlineId).eq('user_id', user.id).single();
    if (outlineErr || !outlineRow) return res.status(404).json({ error: 'outline_not_found' });
    if (outlineRow.status !== 'approved') return res.status(409).json({ error: 'outline_not_approved' });

    h1 = outlineRow.h1;
    outline = outlineRow.outline_json;
    title = outlineRow.article_topics?.title || h1;
    targetQuery = outlineRow.target_keyword || outlineRow.article_topics?.target_query || '';
    brand = outlineRow.article_topics?.brand || brand;
    angle = outlineRow.angle || '';
  }

  // Supports both the current { title, description } outline shape and the legacy
  // { h2, h3s } shape still produced by the ad-hoc Growth Actions blog-topic flow.
  const sectionPrompts = (outline || []).map((s) =>
    s.h2 ? `## ${s.h2}\n${(s.h3s || []).map((h) => `### ${h}`).join('\n')}` : `## ${s.title}\n${s.description || ''}`
  ).join('\n\n');

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 5500,
      messages: [{
        role: 'user',
        content: `You are a senior B2B content writer. Write a complete, publication-ready article in the style of ClickUp's blog and Hiver's guides — conversational but authoritative, evidence-backed, and written for busy professionals who scan before they read.

Brand writing this article: "${brand}"
H1: ${h1}
Target buyer query the article must answer: "${targetQuery}"
${angle ? `Angle to take: ${angle}` : ''}

---

The finished article (excluding the CTA) must be **1700–2300 words total**. Use the section-length targets below to get there — do not write a short, summary-style piece.

STYLE GUIDE (follow exactly):

**INTRODUCTION (200–250 words, 3–4 paragraphs)**
- Open with a vivid scenario, a surprising stat, or a bold claim — never "In today's world" or "As businesses grow"
- Use the problem-agitate-solve framework: name the challenge, make it feel real, then hint at the solution
- End the intro with 1 clear sentence that tells the reader what they'll learn
- Use "you" and "your team" throughout

**EACH SECTION (250–350 words of prose per section — this is the bulk of the article's length)**
- Open every section with 1–2 punchy sentences that state a problem or make a claim — not a dictionary definition
- Use the section's description as guidance for what to cover, then expand it substantially: multiple paragraphs, mixing short (1–2 sentence) punchy paras with longer 3–5 sentence explanatory ones
- Include at least one concrete example, real stat, or scenario per section — made up but believable (e.g. "teams using X saw a 40% drop in...")
- If a section has sub-headings (H3s) in the structure below, give each 100–150 words of its own; otherwise cover the same ground as flowing prose under the section heading
- Use bullet or numbered lists ONLY when you have 3+ items that genuinely benefit from scanning — never bullet everything, and never let a list substitute for the required prose length
- Numbered lists for steps/processes, bullet lists for features/benefits
- End each section with a transition sentence that flows into the next topic

**CONCLUSION (150–200 words, 3 paragraphs)**
- Paragraph 1: Summarise the core insight in 2-3 sentences
- Paragraph 2: Reframe why this matters for the reader's business specifically
- Paragraph 3: Bridge directly to the CTA

**CTA (final section, after conclusion)**
Use this exact format:
## Ready to [benefit relevant to article topic]?
[1 sentence describing what ${brand} does and how it solves the exact problem in this article.]
[Try/Start/See] ${brand} [free/today] → [link]

---

BANNED phrases (never use these):
${BANNED_PHRASES.map(p => `"${p}"`).join(', ')}

---

Structure to follow:
${sectionPrompts}

---

Return ONLY the full article in Markdown. Start with # ${h1} and end with the CTA section. No preamble, no "Here is your article:".`
      }]
    });

    const markdown = completion.choices[0].message.content.trim();
    const html = markdownToHtml(markdown);
    const quality = checkArticleQuality({ markdown, outline, brand });

    const { data: saved, error: saveErr } = await supabaseAdmin.from('articles').insert({
      user_id: user.id, title, h1, target_query: targetQuery,
      content_markdown: markdown, content_html: html, brand,
      outline_id: outlineId || null,
      quality_json: quality, quality_status: quality.passed ? 'pass' : 'flagged',
      word_count: quality.wordCount,
      created_at: new Date().toISOString(),
    }).select('id').single();
    if (saveErr || !saved) {
      // The article text still generated fine, but if it isn't actually persisted, showing
      // it as a success would be misleading — the user would see it once, then lose it the
      // moment they navigate away, with no indication anything went wrong.
      console.error('Article save error:', saveErr?.message || 'insert returned no row');
      return res.status(500).json({ error: 'Article was generated but could not be saved. Try again.' });
    }

    res.json({ markdown, html, quality, articleId: saved.id });
  } catch (err) {
    console.error('Article generation error:', err.message);
    res.status(500).json({ error: 'Article generation failed. Try again.' });
  }
});

app.get('/api/articles', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  let query = supabaseAdmin.from('articles')
    .select('id, title, h1, quality_status, word_count, outline_id, publish_status, published_target, created_at')
    .eq('user_id', user.id);
  if (req.query.outlineId) query = query.eq('outline_id', req.query.outlineId);
  const { data, error: dbErr } = await query.order('created_at', { ascending: false });
  if (dbErr) return res.status(500).json({ error: dbErr.message });

  res.json(data || []);
});

app.get('/api/articles/:id', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { data, error: dbErr } = await supabaseAdmin
    .from('articles').select('*, article_outlines(angle)').eq('id', req.params.id).eq('user_id', user.id).single();
  if (dbErr || !data) return res.status(404).json({ error: 'article_not_found' });

  res.json({ ...data, angle: data.article_outlines?.angle || null });
});

app.patch('/api/articles/:id', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { content_html } = req.body;
  if (!content_html) return res.status(400).json({ error: 'content_html is required' });

  const { data: existing, error: findErr } = await supabaseAdmin
    .from('articles').select('outline_id, brand, article_outlines(outline_json)')
    .eq('id', req.params.id).eq('user_id', user.id).single();
  if (findErr || !existing) return res.status(404).json({ error: 'article_not_found' });

  const markdown = htmlToMarkdown(content_html);
  const quality = checkArticleQuality({
    markdown, outline: existing.article_outlines?.outline_json || [], brand: existing.brand,
  });

  const { data, error: updErr } = await supabaseAdmin.from('articles').update({
    content_html, content_markdown: markdown,
    quality_json: quality, quality_status: quality.passed ? 'pass' : 'flagged',
    word_count: quality.wordCount,
  }).eq('id', req.params.id).eq('user_id', user.id).select().single();
  if (updErr) return res.status(500).json({ error: updErr.message });

  res.json(data);
});

app.post('/api/articles/:id/publish', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { target, targetId, publishedUrl } = req.body;
  if (!target) return res.status(400).json({ error: 'target is required' });

  const publisher = getPublisher(target);
  let resolvedUrl = publishedUrl || null;

  if (publisher && !publisher.clientSide) {
    if (!targetId) return res.status(400).json({ error: 'targetId is required for this connector' });

    const { data: targetRow, error: targetErr } = await supabaseAdmin
      .from('publish_targets').select('*').eq('id', targetId).eq('user_id', user.id).eq('type', target).single();
    if (targetErr || !targetRow) return res.status(404).json({ error: 'publish_target_not_found' });

    const { data: article, error: articleErr } = await supabaseAdmin
      .from('articles').select('title, content_markdown, content_html').eq('id', req.params.id).eq('user_id', user.id).single();
    if (articleErr || !article) return res.status(404).json({ error: 'article_not_found' });

    try {
      const result = await publisher.publish({
        title: article.title, markdown: article.content_markdown, html: article.content_html, config: targetRow.config_json,
      });
      resolvedUrl = result.url || null;
    } catch (err) {
      console.error('Publish error:', err.message);
      return res.status(502).json({ error: err.message || 'Publish failed' });
    }
  }

  const { data, error: updErr } = await supabaseAdmin.from('articles').update({
    publish_status: 'published', published_target: target, published_url: resolvedUrl, published_at: new Date().toISOString(),
  }).eq('id', req.params.id).eq('user_id', user.id).select().single();
  if (updErr) return res.status(500).json({ error: updErr.message });
  if (!data) return res.status(404).json({ error: 'article_not_found' });

  res.json(data);
});

// ─── Publish targets: generic CRUD ───────────────────────────────────────────
app.get('/api/publish-targets', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { data, error: dbErr } = await supabaseAdmin
    .from('publish_targets').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
  if (dbErr) return res.status(500).json({ error: dbErr.message });

  res.json((data || []).map((row) => {
    const publisher = getPublisher(row.type);
    if (publisher && !publisher.clientSide) {
      // Server-side connectors: never return the stored token/secret to the browser.
      const { token, ...safeConfig } = row.config_json || {};
      return { id: row.id, type: row.type, config: safeConfig };
    }
    // Client-side connectors (self-hosted WordPress): the browser needs the full config to publish directly.
    return { id: row.id, type: row.type, config: row.config_json || {} };
  }));
});

app.post('/api/publish-targets', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { type, config } = req.body;
  const publisher = getPublisher(type);
  if (!publisher) return res.status(400).json({ error: 'unknown_publisher_type' });
  if (!publisher.validateCreds(config)) return res.status(400).json({ error: 'invalid_config' });

  const { data, error: insErr } = await supabaseAdmin
    .from('publish_targets').insert({ user_id: user.id, type, config_json: config }).select().single();
  if (insErr) return res.status(500).json({ error: insErr.message });

  res.json({ id: data.id, type: data.type, config: publisher.clientSide ? data.config_json : {} });
});

app.patch('/api/publish-targets/:id', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { data: existing, error: findErr } = await supabaseAdmin
    .from('publish_targets').select('*').eq('id', req.params.id).eq('user_id', user.id).single();
  if (findErr || !existing) return res.status(404).json({ error: 'publish_target_not_found' });

  const config = { ...existing.config_json, ...req.body };
  const { data, error: updErr } = await supabaseAdmin
    .from('publish_targets').update({ config_json: config }).eq('id', req.params.id).eq('user_id', user.id).select().single();
  if (updErr) return res.status(500).json({ error: updErr.message });

  const publisher = getPublisher(data.type);
  res.json({ id: data.id, type: data.type, config: publisher?.clientSide ? data.config_json : {} });
});

app.delete('/api/publish-targets/:id', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const { error: delErr } = await supabaseAdmin
    .from('publish_targets').delete().eq('id', req.params.id).eq('user_id', user.id);
  if (delErr) return res.status(500).json({ error: delErr.message });

  res.json({ ok: true });
});

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────
app.get('/api/auth/github/start', async (req, res) => {
  const token = req.query.token;
  if (!token || !supabaseAdmin) return res.status(401).send('Unauthorized');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).send('Unauthorized');
  if (!hasKey('GITHUB_CLIENT_ID')) return res.status(503).send('GitHub integration not configured');

  const state = signState(user.id);
  const redirectUri = `${APP_URL}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(process.env.GITHUB_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo&state=${state}`;
  res.redirect(url);
});

app.get('/api/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;
  const userId = verifyState(state);
  if (!userId) return res.status(400).send('Invalid or expired request. Please try connecting again.');

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${APP_URL}/api/auth/github/callback`,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error(tokenData.error_description || 'No access token returned');

    const { data, error: insErr } = await supabaseAdmin
      .from('publish_targets').insert({ user_id: userId, type: 'github', config_json: { token: tokenData.access_token } }).select().single();
    if (insErr) throw new Error(insErr.message);

    res.redirect(`${APP_URL}/app?github_target=${data.id}`);
  } catch (err) {
    console.error('GitHub OAuth callback error:', err.message);
    res.redirect(`${APP_URL}/app?github_error=1`);
  }
});

app.get('/api/github/repos', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const targetId = req.query.targetId;
  const { data: targetRow, error: targetErr } = await supabaseAdmin
    .from('publish_targets').select('*').eq('id', targetId).eq('user_id', user.id).eq('type', 'github').single();
  if (targetErr || !targetRow) return res.status(404).json({ error: 'publish_target_not_found' });

  try {
    const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: { Authorization: `Bearer ${targetRow.config_json.token}`, Accept: 'application/vnd.github+json' },
    });
    if (!reposRes.ok) throw new Error(`GitHub API returned ${reposRes.status}`);
    const repos = await reposRes.json();
    res.json(repos.map((r) => ({ full_name: r.full_name, default_branch: r.default_branch })));
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// ─── WordPress.com OAuth ──────────────────────────────────────────────────────
app.get('/api/auth/wordpress/start', async (req, res) => {
  const token = req.query.token;
  if (!token || !supabaseAdmin) return res.status(401).send('Unauthorized');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).send('Unauthorized');
  if (!hasKey('WPCOM_CLIENT_ID')) return res.status(503).send('WordPress.com integration not configured');

  const state = signState(user.id);
  const redirectUri = `${APP_URL}/api/auth/wordpress/callback`;
  const url = `https://public-api.wordpress.com/oauth2/authorize?client_id=${encodeURIComponent(process.env.WPCOM_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=global&state=${state}`;
  res.redirect(url);
});

app.get('/api/auth/wordpress/callback', async (req, res) => {
  const { code, state } = req.query;
  const userId = verifyState(state);
  if (!userId) return res.status(400).send('Invalid or expired request. Please try connecting again.');

  try {
    const tokenRes = await fetch('https://public-api.wordpress.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.WPCOM_CLIENT_ID,
        client_secret: process.env.WPCOM_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${APP_URL}/api/auth/wordpress/callback`,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error(tokenData.error_description || 'No access token returned');

    const { data, error: insErr } = await supabaseAdmin
      .from('publish_targets').insert({ user_id: userId, type: 'wordpress_com', config_json: { token: tokenData.access_token } }).select().single();
    if (insErr) throw new Error(insErr.message);

    res.redirect(`${APP_URL}/app?wpcom_target=${data.id}`);
  } catch (err) {
    console.error('WordPress.com OAuth callback error:', err.message);
    res.redirect(`${APP_URL}/app?wpcom_error=1`);
  }
});

app.get('/api/wordpress/sites', async (req, res) => {
  const { user, error } = await authenticateUser(req);
  if (error) return res.status(error === 'no_supabase' ? 503 : 401).json({ error });

  const targetId = req.query.targetId;
  const { data: targetRow, error: targetErr } = await supabaseAdmin
    .from('publish_targets').select('*').eq('id', targetId).eq('user_id', user.id).eq('type', 'wordpress_com').single();
  if (targetErr || !targetRow) return res.status(404).json({ error: 'publish_target_not_found' });

  try {
    const sitesRes = await fetch('https://public-api.wordpress.com/rest/v1.1/me/sites', {
      headers: { Authorization: `Bearer ${targetRow.config_json.token}` },
    });
    if (!sitesRes.ok) throw new Error(`WordPress.com API returned ${sitesRes.status}`);
    const data = await sitesRes.json();
    res.json((data.sites || []).map((s) => ({ ID: s.ID, name: s.name, URL: s.URL })));
  } catch (err) {
    res.status(502).json({ error: err.message });
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
