# Peach — Environment Setup Checklist

Every env var this project reads, where to get it, and what breaks if it's missing. Lives in `.env` locally and in Vercel → Project Settings → Environment Variables for production.

Legend: ✅ already set in `.env` as of this writing · ⬜ not yet added

## Already configured

| Var | ✅/⬜ | What it's for | Where to get it |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | All AEO query generation, competitor extraction, article writing (gpt-4o / gpt-4o-mini) | platform.openai.com → API keys |
| `GEMINI_API_KEY` | ✅ | Gemini AEO queries | Google AI Studio / Gemini Advanced — **must** be the Advanced format (`AQ.Ab8R...`), not a plain AI Studio key |
| `GEMINI_MODEL` | ✅ | Must be `gemini-2.5-flash` | — |
| `SERPER_API_KEY` | ✅ | Google AI Overview queries + competitor web-search grounding | serper.dev |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_KEY` | ✅ | Auth, all Supabase tables (`profiles`, `runs`, `articles`, `article_topics`, `article_outlines`, `publish_targets`) | Supabase project `olwcmaabbsnqhmbiybsk` → Settings → API |
| `ADMIN_EMAILS` | ✅ | Comma-separated emails that bypass run/article quotas | — |
| `DODO_API_KEY` / `DODO_ENV` / `DODO_WEBHOOK_SECRET` / `DODO_STARTER_PRODUCT_ID` / `DODO_GROWTH_PRODUCT_ID` | ✅ | Checkout + billing | Dodo Payments dashboard |
| `RESEND_API_KEY` | ✅ | Email reports | Resend dashboard |
| `APP_URL` | ✅ | Base URL used to build OAuth redirect URIs and checkout return URLs — **must match exactly** what's registered in the GitHub/WordPress.com OAuth apps below | `http://localhost:5173` locally, `https://gotopeach.com` in production |
| `ANTHROPIC_API_KEY` | ⬜ (intentionally empty) | Dead code path — Claude isn't used anywhere live | — |
| `PERPLEXITY_API_KEY` | ⬜ (intentionally empty) | Dead code path — Perplexity isn't wired up | — |

## Needed for the publishing integrations (not yet set)

These three power the GitHub and WordPress.com "Connect" buttons in the article editor's Publish menu. Without them, clicking Connect shows "`<X>` integration not configured" — that's the app correctly refusing to start rather than failing partway through.

| Var | ✅/⬜ | Where to get it |
|---|---|---|
| `GITHUB_CLIENT_ID` | ⬜ | GitHub → Settings → Developer settings → OAuth Apps → New OAuth App. Homepage URL = `APP_URL`, Authorization callback URL = `{APP_URL}/api/auth/github/callback` |
| `GITHUB_CLIENT_SECRET` | ⬜ | Same app page, "Generate a new client secret" (shown once) |
| `WPCOM_CLIENT_ID` | ⬜ | developer.wordpress.com/apps/ → Create New Application. Redirect URL = `{APP_URL}/api/auth/wordpress/callback`, Type = Web |
| `WPCOM_CLIENT_SECRET` | ⬜ | Same app page |
| `OAUTH_STATE_SECRET` | ⬜ | Not issued by either platform — make up any long random string yourself (e.g. `openssl rand -hex 32`). Shared by both OAuth flows to sign the redirect `state` param. |

**Important:** these are registered **once**, by whoever runs Peach — not per customer. Any customer logged into Peach can then click "Connect GitHub" / "Connect WordPress.com" and authorize their *own* account through that one shared app; each connection is stored separately per user in the `publish_targets` table.

Self-hosted WordPress (the third publish option) needs no env vars — it's per-site Application Passwords entered directly in the connect wizard, not a platform-level OAuth app.

**Vercel production note:** if you register separate OAuth apps for local vs production (different callback URLs), you'll need separate `GITHUB_CLIENT_ID`/`WPCOM_CLIENT_ID` values in Vercel's env vars vs your local `.env` — or register one app with production's callback URL and only test the OAuth flows against production. Either way, whatever URL you register as the callback must exactly match the `APP_URL` value active on that side.

## Other

| Var | ✅/⬜ | What it's for |
|---|---|---|
| `PORT` | ✅ | Port the Express server listens on locally (defaults to `3001` if unset — actually read by `server.js`, not legacy) |

## Unused / legacy (safe to ignore)

`PRIMARY_KEYWORD`, `PRODUCT_CATEGORY`, `YOUR_BLOG_URL` — only read by `src/input.js`, a standalone old CLI script (`node index.js --url ...`) that the live server never imports or runs.
