# VisibilityAI — Comprehensive Requirements Document

**Project:** VisibilityAI (formerly SEO Rank Doctor)  
**Version:** 0.1.0  
**Type:** Full-stack Node.js + React Application  
**Repository:** https://github.com/pbhuvaneswaran/VisibilityAI  
**Last Updated:** 2026-06-21

---

## 1. PRODUCT OVERVIEW

### 1.1 Vision
VisibilityAI is a full-stack SaaS platform that helps brands understand and improve their visibility in **Answer Engine Optimization (AEO)** — specifically how often a brand appears in AI-generated responses across multiple LLM platforms (Claude, ChatGPT, Gemini).

### 1.2 Market Problem
Traditional SEO tools focus on search engine visibility, but with the rise of LLM-powered answer engines (ChatGPT, Perplexity, Claude), brands need to understand their visibility in AI-generated responses. VisibilityAI solves this gap.

### 1.3 Target Users
- **Content teams** at SaaS/product companies
- **Marketing agencies** managing multiple client brands
- **Brand managers** tracking competitive positioning
- **Product managers** monitoring brand visibility

### 1.4 Core Value Proposition
- **Visibility scoring** — See how often your brand appears in AI answers vs. competitors
- **Content gap analysis** — Get AI-powered recommendations on what content to create
- **Multi-LLM tracking** — Monitor visibility across Claude, ChatGPT, and Gemini simultaneously
- **Actionable insights** — Receive specific content recommendations to improve visibility

---

## 2. CORE FEATURES

### 2.1 AEO Visibility Analysis (Primary Feature)

**Purpose:** Analyze brand visibility across AI-powered search engines

**Input Requirements:**
```json
{
  "brand": "string (brand/product name)",
  "category": "string (product category)",
  "competitors": ["array of competitor names"],
  "llms": ["optional - which LLMs to query: 'claude', 'chatgpt', 'gemini'"],
  "demo": "boolean (optional - use dummy data)"
}
```

**Processing Flow:**
1. **Question Generation** (Claude API)
   - Generate 10 buyer-intent questions relevant to the category
   - Questions designed to trigger brand mentions in LLM responses
   - Example: For "project management software", questions like "What's the best PM tool for remote teams?"

2. **Multi-LLM Querying** (Parallel Execution)
   - Query Claude (via Anthropic API)
   - Query ChatGPT (via OpenAI API)
   - Query Gemini (via Google Generative AI API)
   - All queries run in parallel using `p-limit` to manage concurrency

3. **Visibility Scoring**
   - Count brand mentions per LLM across all questions
   - Compare against competitor mentions
   - Generate visibility score (0-100)
   - Identify top 3 visibility gaps

4. **Gap Recommendations** (Claude API)
   - For each gap, generate specific content recommendations
   - Recommendations explain what content to create and why

**Output Format:**
```json
{
  "brand": "string",
  "competitors": ["array"],
  "category": "string",
  "questions": ["10 generated questions"],
  "llmsQueried": ["claude", "chatgpt", "gemini"],
  "visibility": {
    "overallScore": 65,
    "scoreByLLM": {
      "claude": 70,
      "chatgpt": 65,
      "gemini": 60
    },
    "mentionsByLLM": {
      "claude": { "brand_name": 7, "competitor1": 5, "competitor2": 3 },
      "chatgpt": { "brand_name": 6, "competitor1": 8, "competitor2": 4 },
      "gemini": { "brand_name": 5, "competitor1": 6, "competitor2": 4 }
    },
    "gaps": [
      {
        "competitorName": "competitor1",
        "visibilityDifference": 1,
        "reason": "Mentioned more often in ChatGPT responses"
      }
    ]
  },
  "gapRecommendations": [
    {
      "gap": "gap_1",
      "recommendation": "Create content about [topic] that addresses [user need]...",
      "priority": "high"
    }
  ]
}
```

### 2.2 SEO Diagnosis (Secondary Feature)

**Purpose:** Traditional SEO analysis and competitive benchmarking

**Input Requirements:**
```json
{
  "url": "string (blog URL to analyze)",
  "keyword": "string (optional - primary keyword)"
}
```

**Processing Flow:**
1. **Page Audit** (Web scraper + Claude)
   - Parse page content, meta tags, headings
   - Infer primary keyword if not provided
   - Extract content structure

2. **Competitor Research** (Search API)
   - Fetch top 10 search results for keyword
   - Analyze competitor URLs and content

3. **Ranking Analysis**
   - Determine your page's current ranking for keyword
   - Compare against top competitors

4. **Content Analysis** (Claude API)
   - Analyze your page vs. competitors
   - Identify content gaps and strengths

5. **Diagnosis & Recommendations** (Claude API)
   - Provide specific SEO recommendations
   - Identify quick wins and long-term improvements

**Output Format:**
```json
{
  "mode": "MODE_A | MODE_B | MODE_C",
  "blogUrl": "string",
  "primaryKeyword": "string",
  "productCategory": "string",
  "inferredKeyword": "string",
  "audit": { "title": "...", "description": "...", "wordCount": 0, ... },
  "rank": { "position": 5, "searchVolume": 1200, ... },
  "competitors": [ { "url": "...", "title": "...", "description": "..." } ],
  "analysis": { "competitorSummaries": [...], "contentGaps": [...] },
  "diagnosis": { "strengths": [...], "weaknesses": [...], "recommendations": [...] },
  "gaps": [ { "gap": "...", "recommendation": "..." } ],
  "generatedAt": "ISO-8601 timestamp"
}
```

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Tech Stack

**Frontend:**
- React 18+ with Vite bundler
- Tailwind CSS v4 for styling
- Axios for HTTP requests
- Page router (Home / Visibility / Diagnosis)

**Backend:**
- Node.js 18+ (ESM modules)
- Express.js (REST API)
- CORS enabled for cross-origin requests

**External APIs:**
- Anthropic Claude API (question generation, analysis, recommendations)
- OpenAI API (ChatGPT querying)
- Google Generative AI API (Gemini querying)
- Serper API (search results)

**Utilities:**
- Cheerio (HTML/DOM parsing)
- Axios (HTTP requests)
- p-limit (concurrency control)
- dotenv (environment variables)

### 3.2 Project Structure

```
seo-rank-doctor/
├── client/                          # React frontend
│   ├── src/
│   │   ├── App.jsx                 # Main router
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── VisibilityFlow.jsx  # AEO visibility UI
│   │   │   ├── DiagnosisFlow.jsx   # SEO diagnosis UI
│   │   │   └── v2/                 # Alternative implementations
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── index.css               # Global styles
│   └── vite.config.js
├── src/                             # Backend modules
│   ├── questionGenerator.js        # Claude: Generate 10 questions
│   ├── claudeClient_aeo.js         # Query Claude with questions
│   ├── openaiClient_aeo.js         # Query ChatGPT with questions
│   ├── geminiClient_aeo.js         # Query Gemini with questions
│   ├── perplexityClient.js         # Query Perplexity (deprecated)
│   ├── visibilityScorer.js         # Score visibility across LLMs
│   ├── gapRecommender.js           # Claude: Generate recommendations
│   ├── auditor.js                  # Audit page for SEO
│   ├── analyzer.js                 # Analyze competitors
│   ├── ranker.js                   # Determine page ranking
│   ├── diagnostics.js              # Generate SEO diagnosis
│   ├── gapfinder.js                # Find content gaps
│   ├── reporter.js                 # Write Markdown + JSON reports
│   ├── search.js                   # Search API integration
│   ├── scraper.js                  # Web scraping (deprecated)
│   ├── utils.js                    # Helper functions
│   ├── input.js                    # CLI input parsing
│   └── dummy.js                    # Demo data
├── server.js                        # Express server (port 3001)
├── index.js                         # CLI entry + runDiagnosis export
├── package.json
├── .env.example                     # Environment template
├── .gitignore                       # Excludes .env, node_modules
├── output/                          # Generated reports
└── README.md
```

---

## 4. API ENDPOINTS

### 4.1 POST /api/visibility

**Purpose:** Analyze brand visibility in AI answers

**Request Body:**
```json
{
  "brand": "ProjectFlow",
  "category": "project management software",
  "competitors": ["Asana", "Monday.com", "Jira"],
  "llms": ["claude", "chatgpt", "gemini"],
  "demo": false
}
```

**Response (Success):**
```json
{
  "brand": "ProjectFlow",
  "competitors": ["Asana", "Monday.com", "Jira"],
  "category": "project management software",
  "questions": [10 generated questions],
  "llmsQueried": ["claude", "chatgpt", "gemini"],
  "visibility": { ... },
  "gapRecommendations": [ ... ]
}
```

**Response (Demo Mode):**
- Returns mock data if `demo: true` or `ANTHROPIC_API_KEY` missing
- Useful for frontend testing without API credentials

**Error Response:**
```json
{
  "error": "brand, category, and competitors[] are required"
}
```

**HTTP Status Codes:**
- `200` — Success
- `400` — Missing required fields
- `500` — Server error

---

### 4.2 POST /api/diagnose

**Purpose:** Run SEO diagnosis on a blog URL

**Request Body:**
```json
{
  "url": "https://yourblog.com/article-about-pm",
  "keyword": "best project management software for remote teams"
}
```

**Response (Success):**
```json
{
  "mode": "MODE_C",
  "blogUrl": "https://yourblog.com/article-about-pm",
  "primaryKeyword": "best project management software for remote teams",
  "audit": { ... },
  "rank": { "position": 5, ... },
  "competitors": [ ... ],
  "analysis": { ... },
  "diagnosis": { ... },
  "gaps": [ ... ],
  "generatedAt": "2026-06-21T10:30:00Z"
}
```

**Error Response:**
```json
{
  "error": "url or keyword is required"
}
```

---

### 4.3 GET /api/health

**Purpose:** Check server health and API key status

**Response:**
```json
{
  "ok": true,
  "keys": {
    "anthropic": true,
    "claude_aeo": true,
    "openai": false,
    "gemini": true,
    "supabase": false,
    "stripe": false
  }
}
```

---

## 5. ENVIRONMENT CONFIGURATION

### 5.1 Required Variables

```env
# Claude API (for question generation, analysis, recommendations)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI API (for ChatGPT querying in visibility analysis)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini

# Google Gemini API (for Gemini querying in visibility analysis)
GEMINI_API_KEY=AIz...

# Serper API (for search results in SEO diagnosis)
SERPER_API_KEY=...

# Server Configuration
PORT=3001

# CLI Mode Variables (for runDiagnosis CLI)
YOUR_BLOG_URL=https://yourblog.com/article
PRIMARY_KEYWORD=best project management software for remote teams
PRODUCT_CATEGORY=project management software
```

### 5.2 Optional Variables (Future Features)

```env
# Database (Supabase)
SUPABASE_URL=https://...
SUPABASE_KEY=...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 5.3 Environment Setup

```bash
# Copy template and fill in your API keys
cp .env.example .env

# Edit .env with your credentials
nano .env
```

---

## 6. DATA FLOW

### 6.1 AEO Visibility Analysis Flow

```
User Input (brand, competitors, category)
    ↓
[Express API: POST /api/visibility]
    ↓
Generate Buyer Questions (Claude API)
    ↓
Query Multiple LLMs in Parallel:
├─ Claude (Anthropic API)
├─ ChatGPT (OpenAI API)
└─ Gemini (Google API)
    ↓
Score Visibility Across LLMs
    ↓
Generate Gap Recommendations (Claude API)
    ↓
Return Results to Frontend
    ↓
React UI Displays Scores, Gaps, Recommendations
```

### 6.2 SEO Diagnosis Flow

```
User Input (URL, optional keyword)
    ↓
[Express API: POST /api/diagnose]
    ↓
runDiagnosis() function
    ↓
Audit Page (scrape & parse)
    ↓
Fetch Search Results (Serper API)
    ↓
Determine Page Ranking
    ↓
Analyze Competitors (Claude API)
    ↓
Generate Diagnosis (Claude API)
    ↓
Find Content Gaps (Claude API)
    ↓
Write Reports (Markdown + JSON)
    ↓
Return to Frontend
```

---

## 7. DEPENDENCIES

### 7.1 Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web server framework |
| cors | ^2.8.5 | Enable cross-origin requests |
| dotenv | ^16.3.1 | Load environment variables |
| axios | ^1.5.0 | HTTP client |
| cheerio | ^1.0.0-rc.12 | HTML parsing |
| @anthropic-ai/sdk | ^0.101.0 | Claude API client |
| @google/generative-ai | ^0.24.1 | Gemini API client |
| openai | ^4.1.0 | OpenAI/ChatGPT client |
| p-limit | ^4.0.0 | Concurrency control |
| @supabase/supabase-js | ^2.108.2 | Supabase client (future) |
| stripe | ^22.2.2 | Stripe payment client (future) |

### 7.2 Development Dependencies

| Package | Purpose |
|---------|---------|
| concurrently | Run multiple processes (server + React) |
| vite | React bundler and dev server |
| tailwindcss | Utility CSS framework |

---

## 8. INSTALLATION & SETUP

### 8.1 Prerequisites
- Node.js 18+ (ESM support required)
- npm or yarn
- API keys for Claude, OpenAI, and Gemini

### 8.2 Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/pbhuvaneswaran/VisibilityAI.git
cd VisibilityAI

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env and add your API keys
nano .env

# 4. Start development (server + React)
npm run dev

# Server runs at: http://localhost:3001
# React app runs at: http://localhost:5173
```

### 8.3 Alternative Run Modes

```bash
# Backend server only (port 3001)
npm run server

# React frontend only (port 5173, proxies /api to 3001)
cd client && npm run dev

# CLI mode (generates report in output/)
node index.js --url "https://example.com" --keyword "example"

# Demo mode (no API keys required)
node index.js --keyword "example" --demo
```

---

## 9. USER WORKFLOWS

### 9.1 Workflow A: Check Brand Visibility

1. User opens homepage
2. Clicks "Check Visibility" card
3. Fills form:
   - Brand name: "ProjectFlow"
   - Category: "Project Management"
   - Competitors: "Asana, Monday.com, Jira"
4. Clicks "Analyze"
5. System generates 10 questions
6. System queries Claude, ChatGPT, Gemini in parallel
7. Results display:
   - Overall visibility score
   - Breakdown by LLM
   - Brand mentions vs. competitors
   - Top 3 content gaps
   - Specific recommendations

### 9.2 Workflow B: Run SEO Diagnosis

1. User opens homepage
2. Clicks "SEO Diagnosis" card
3. Fills form:
   - Blog URL: "https://projectflow.com/blog/pm-guide"
   - Keyword: "best pm tool for remote teams"
4. Clicks "Diagnose"
5. System audits page
6. System searches for keyword
7. System analyzes competitors
8. Results display:
   - Your current ranking
9. System generates diagnosis
10. Recommendations shown:
    - Content strengths
    - Content gaps
    - Quick wins
    - Long-term improvements

### 9.3 Workflow C: Use CLI for Batch Analysis

```bash
# Analyze multiple articles
node index.js --url "https://blog.com/article1" --keyword "topic1"
node index.js --url "https://blog.com/article2" --keyword "topic2"

# Each generates:
# - output/seo-rank-doctor-report.md (readable format)
# - output/seo-rank-doctor-report.json (machine-readable)
```

---

## 10. OUTPUT & REPORTING

### 10.1 Report Formats

**Markdown Report** (`output/seo-rank-doctor-report.md`)
- Human-readable format
- Sections: Audit, Ranking, Competitors, Analysis, Diagnosis, Gaps
- Tables for easy scanning

**JSON Report** (`output/seo-rank-doctor-report.json`)
- Machine-readable format
- Structured data for programmatic access
- Complete data dump for archival

### 10.2 Report Contents

```
Analysis Report
├── Metadata
│   ├── Generated date/time
│   ├── Mode (A/B/C)
│   └── Keywords analyzed
├── Audit Results
│   ├── Page title, meta description
│   ├── Word count, headings
│   └── Content quality assessment
├── Ranking Data
│   ├── Current position
│   ├── Search volume
│   └── Keyword difficulty
├── Competitor Analysis
│   ├── Top 10 competitors
│   ├── Their content quality
│   └── Their ranking positions
├── Content Gap Analysis
│   ├── Missing topics
│   ├── Underexplored angles
│   └── Keyword gaps
└── Recommendations
    ├── Quick wins (<1 day to implement)
    ├── Medium-term improvements (1-4 weeks)
    └── Long-term strategy (1-3 months)
```

---

## 11. ERROR HANDLING

### 11.1 Graceful Degradation

**Missing API Keys:**
- If `ANTHROPIC_API_KEY` missing → Return demo data
- If `OPENAI_API_KEY` missing → Skip ChatGPT in visibility analysis
- If `GEMINI_API_KEY` missing → Skip Gemini in visibility analysis
- If `SERPER_API_KEY` missing → Use placeholder search results

**API Failures:**
- Claude API timeout → Return partial results with available data
- Search API failure → Return competitors from cached data
- Network errors → Return 500 error with descriptive message

### 11.2 Validation

**Input Validation:**
```
POST /api/visibility:
✓ brand (required, string)
✓ category (required, string)
✓ competitors (required, non-empty array)

POST /api/diagnose:
✓ url or keyword (at least one required)
```

**Output Validation:**
- All reports include timestamp
- All scores are 0-100 range
- All recommendations include reasoning

---

## 12. SUPPORTED LLM PLATFORMS

### 12.1 Implemented

| LLM | API Provider | Status | Notes |
|-----|--------------|--------|-------|
| Claude | Anthropic | ✅ Active | Primary for question generation |
| ChatGPT | OpenAI | ✅ Active | Parallel querying |
| Gemini | Google | ✅ Active | Parallel querying |

### 12.2 Planned

| LLM | Status | Eta |
|-----|--------|-----|
| Perplexity | 🔄 Implemented | Future |
| LLaMA | 📋 Planned | TBD |
| Mistral | 📋 Planned | TBD |

---

## 13. DEPLOYMENT REQUIREMENTS

### 13.1 Backend Deployment

**Platforms Supported:**
- Vercel (serverless)
- Heroku (dyno)
- AWS Lambda (serverless)
- Digital Ocean (VPS)
- Any Node.js host

**Requirements:**
- Node.js 18+ runtime
- Environment variables configured
- Port 3001 (or configurable via `PORT` env var)
- Inbound access from frontend

**Pre-Deployment Checklist:**
- [ ] All API keys configured
- [ ] CORS properly configured for frontend domain
- [ ] Health check endpoint working (`GET /api/health`)
- [ ] Error logging configured
- [ ] Rate limiting implemented (recommended)

### 13.2 Frontend Deployment

**Platforms Supported:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- AWS Amplify

**Build Command:**
```bash
cd client && npm run build
# Outputs to: client/dist/
```

**Environment:**
```env
VITE_API_URL=https://api.yourdomain.com
# or
VITE_API_URL=http://localhost:3001  # Development
```

### 13.3 Infrastructure (Recommended)

```
┌─────────────────┐
│  React Frontend │ (Vercel / Netlify)
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP requests
         ↓
┌─────────────────┐
│  Express Server │ (Vercel / Heroku / AWS)
│  (Port 3001)    │
└────────┬────────┘
         │ API calls
         ├─→ Anthropic API
         ├─→ OpenAI API
         ├─→ Google API
         └─→ Serper API
```

---

## 14. OPERATING MODES

### 14.1 Production Mode

```bash
npm run dev
```
- Full API access
- All LLMs queried in parallel
- Results cached where applicable
- Error logging enabled
- Real reports generated

### 14.2 Demo Mode

```bash
node index.js --keyword "example" --demo
# or POST to /api/visibility with demo: true
```
- No API keys required
- Mock data returned instantly
- Useful for:
  - Frontend development/testing
  - Demos to prospects
  - Performance testing

### 14.3 CLI Mode

```bash
node index.js --url "URL" --keyword "KEYWORD"
```
- Runs analysis without server
- Generates local reports
- Useful for:
  - Batch processing
  - Automation/cron jobs
  - Integration with other tools

---

## 15. FUTURE ROADMAP

### Phase 2: Authentication & Multi-Tenancy
- User accounts (Supabase)
- Team management
- API key management
- Usage billing (Stripe)

### Phase 3: Advanced Analytics
- Historical trend tracking
- Competitive benchmarking dashboard
- Alert system (low visibility)
- Content recommendation engine v2

### Phase 4: Integrations
- Slack notifications
- Google Sheets export
- Zapier integration
- Custom webhooks

### Phase 5: Enterprise Features
- Custom LLM models
- On-premise deployment
- White-label branding
- Advanced permissions

---

## 16. SUPPORT & MAINTENANCE

### 16.1 Health Monitoring

```bash
# Check API health
curl http://localhost:3001/api/health

# Response shows:
# - API keys configured
# - All critical systems operational
```

### 16.2 Logging

**Backend Logs:**
- Request/response times
- API errors
- LLM query failures
- Visibility score calculations

**Frontend Logs:**
- Form submissions
- API response times
- UI errors
- User interactions

### 16.3 Performance Metrics

**Target Performance:**
- Visibility analysis: < 30 seconds
- SEO diagnosis: < 45 seconds
- API health check: < 500ms

---

## 17. GLOSSARY

| Term | Definition |
|------|-----------|
| **AEO** | Answer Engine Optimization - optimizing content for AI-generated answers |
| **LLM** | Large Language Model (Claude, ChatGPT, Gemini, etc.) |
| **Visibility Score** | 0-100 rating of how often a brand appears in LLM responses |
| **Content Gap** | Topic or angle underrepresented in your content vs. competitors |
| **Buyer Intent** | Question type that shows purchase intent (e.g., "best tool for...") |
| **Mode A/B/C** | CLI modes: A=URL only, B=keyword only, C=both |
| **Dummy Mode** | Test mode using mock data instead of real API calls |

---

## 18. CONTACT & SUPPORT

**GitHub Repository:** https://github.com/pbhuvaneswaran/VisibilityAI  
**Project Owner:** Bhuvaneswaran P  
**Email:** pbhuvanesh25@gmail.com

