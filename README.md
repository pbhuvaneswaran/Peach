# SEO Rank Doctor

A Node.js CLI tool for auditing blog pages, analyzing SEO performance, and researching top competitors using OpenAI / Gemini and Serper.

## Overview

`seo-rank-doctor` can run in three modes:
- `MODE_A`: analyze a blog URL only
- `MODE_B`: research using a keyword or category only
- `MODE_C`: combine a blog URL with a keyword/category for full analysis

The tool outputs both Markdown and JSON reports to the `output/` folder.

## Prerequisites

- Node.js 18+ (ESM support)
- npm

## Installation

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd seo-rank-doctor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

## Environment Variables

Set these in `.env` or export them before running:

- `GEMINI_API_KEY` or `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional, defaults to `gpt-4.1-mini`)
- `SERPER_API_KEY`
- `YOUR_BLOG_URL`
- `PRIMARY_KEYWORD`
- `PRODUCT_CATEGORY`

> If neither `GEMINI_API_KEY` nor `OPENAI_API_KEY` is present, the tool will run in dummy mode with placeholder analysis. If `SERPER_API_KEY` is not present, the tool will use placeholder search results as well.

Example `.env` values:
```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_MODEL=gemini-1.5-pro
SERPER_API_KEY=...
YOUR_BLOG_URL=https://yourblog.com/your-article
PRIMARY_KEYWORD=best project management software for remote teams
PRODUCT_CATEGORY=project management software
```

## Usage

Run the tool with `node index.js` and the appropriate flags.

### MODE_A: Blog URL only

```bash
node index.js --url "https://yourblog.com/article"
```

### MODE_B: Keyword or category only

```bash
node index.js --keyword "best project management software for remote teams"
```

or

```bash
node index.js --category "project management software"
```

### MODE_C: Blog URL + keyword/category

```bash
node index.js --url "https://yourblog.com/article" --keyword "best project management software for remote teams"
```

### Dummy mode

```bash
node index.js --keyword "best project management software for remote teams" --dummy
```

or

```bash
node index.js --keyword "best project management software for remote teams" --dry-run
```

### Run with npm

```bash
npm start -- --url "https://yourblog.com/article" --keyword "best project management software for remote teams"
```

> Note: include `--` after `npm start` to pass flags to the script.

## Output

Reports are written to:

- `output/seo-rank-doctor-report.md`
- `output/seo-rank-doctor-report.json`

The folder is created automatically when the tool runs.

## Troubleshooting

- Ensure `OPENAI_API_KEY` and `SERPER_API_KEY` are set in `.env`.
- If the CLI exits early, verify you provided at least `--url` or `--keyword`/`--category`.
- If the report is empty, confirm the target page is reachable and the keyword is correct.
