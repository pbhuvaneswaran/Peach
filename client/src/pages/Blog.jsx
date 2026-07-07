import { Link, useParams } from 'react-router-dom'

export const posts = [
  {
    slug: 'what-is-aeo',
    title: 'What Is AEO — And Why Your Brand Isn\'t Showing Up in AI Search',
    date: 'June 12, 2025',
    readTime: '6 min read',
    category: 'AEO / GEO',
    excerpt: 'Answer Engine Optimisation is the new SEO. Here\'s what it means, why most brands are invisible in AI-generated answers, and what you can do about it.',
    content: `
## The shift nobody prepared for

When someone types a question into ChatGPT or Perplexity today, they get an answer — not a list of links. That answer names brands. It cites sources. It makes recommendations.

The brands that show up in those answers aren't paying for placement. They're being pulled from content the LLM considers authoritative, relevant, and well-structured.

The brands that don't show up? They're invisible. And most of them don't even know it.

## What is AEO?

Answer Engine Optimisation (AEO) — sometimes called GEO (Generative Engine Optimisation) — is the practice of making your content more likely to be cited by AI search engines.

Traditional SEO targets Google's algorithm. AEO targets LLMs: ChatGPT, Perplexity, Gemini, Claude. The signals are different. The content strategy is different. The measurement is completely different.

## Why most brands are invisible

LLMs don't pull from whoever ranks #1. They pull from content that:

- **Directly answers specific questions** — not just "covers the topic"
- **Uses clear structure** — headings, lists, definitions, FAQs
- **Cites evidence** — data, case studies, specific examples
- **Comes from authoritative domains** — backlink profile still matters
- **Is indexed and accessible** — if Perplexity can't crawl it, it can't cite it

Most brand content is written to rank on Google. It's optimised for keywords, not questions. It's long-form when it should be specific. It's vague when it should be concrete.

## How to check where you stand

The fastest way to find out if your brand is being cited in AI search: ask the AI yourself.

Open Perplexity, ChatGPT, and Gemini. Type 5–10 questions your buyers would ask about your category. See which brands appear. See which don't. That's your baseline.

Or use a tool like Visibility.ai to do it systematically — 10 questions, across multiple LLMs, with a visibility score and gap analysis built in.

## What to do about the gaps

Once you know which questions your brand is missing from:

1. **Create content that directly answers each question** — not a long blog post, a specific answer page
2. **Use structured markup** — FAQ schema, HowTo schema, Article schema
3. **Build citations** — LLMs trust domains that other trusted sources link to
4. **Be specific** — replace "we help companies scale" with "we reduced support ticket volume by 40% for a 12-person team at Acme Corp"

AEO is not a replacement for SEO. It's an additional channel that most brands haven't started measuring yet. The brands that start now will build a significant head start.
    `,
  },
  {
    slug: 'diagnose-ranking-drop',
    title: 'How to Diagnose a Google Ranking Drop in Under 10 Minutes',
    date: 'June 8, 2025',
    readTime: '8 min read',
    category: 'SEO',
    excerpt: 'Most marketers spend 30–90 minutes tab-switching to diagnose a ranking drop. Here\'s a faster system — and a tool that does it in one click.',
    content: `
## The problem with manual rank drop diagnosis

Your blog post dropped from position 4 to position 17 overnight. You open GSC. Then Ahrefs. Then the competitor's page. Then your own page. Then Semrush. Then a SERP comparison tool.

45 minutes later, you have a pile of raw data and a half-formed hypothesis. You still need to write the brief for your content team.

This is how every content marketer diagnoses ranking drops. It's broken.

## The 5 reasons a page drops — ranked by frequency

In our analysis of hundreds of ranking drops, these are the most common causes:

### 1. Content gap (most common)
A competing page added a section you don't have. Or they went deeper on a topic you cover superficially. Google rewarded the depth.

**What to look for:** Open the top 3 ranking pages. What headings do they have that you don't? What questions do they answer that you skip?

### 2. Freshness signals
Your page was published in 2022. A competitor published on the same topic in 2025. Google prefers freshness for time-sensitive queries.

**What to look for:** Check the publish/update dates of the pages outranking you. If they're all recent, freshness is the likely factor.

### 3. SERP structure changes
The SERP added a featured snippet, a "People also ask" block, or more ads above the fold. Your position didn't change — but your click-through rate did.

**What to look for:** Compare the current SERP layout to what it looked like 3 months ago. Ahrefs and Semrush both have SERP history features.

### 4. E-E-A-T signals
Google updated how it weighs experience and authority for your query type. A competitor with more credentials, more author bio detail, or more external citations started outranking you.

**What to look for:** Check author bios, external links to/from competing pages, and whether any high-authority domains recently published on this topic.

### 5. Technical issues
Slow page load, broken internal links, canonicalization errors, or indexation issues can all cause ranking drops that look like content problems.

**What to look for:** Run a Core Web Vitals check and crawl your page with Screaming Frog or Ahrefs site audit.

## A faster diagnosis workflow

Here's how to cut this to under 10 minutes:

1. **Paste the URL and keyword into a diagnosis tool** (like Visibility.ai) — it scrapes your page, fetches the top 10 competitors, and produces a ranked list of issues automatically
2. **Read the diagnosis** — issues ranked by severity, each with a plain-English explanation of why it matters
3. **Copy the content brief** — the gap analysis outputs a writer-ready brief directly

You still need to make judgment calls. But you're starting from a structured diagnosis instead of a pile of open tabs.

## What the brief should contain

A good post-diagnosis content brief includes:

- Target keyword + intent (informational / commercial / transactional)
- Current rank and key competitor URLs
- List of content gaps (topics you're missing), each with a suggested heading and recommended depth
- Schema markup recommendations
- Freshness assessment — does the publish date need updating?

If you're handing this to a writer, that's everything they need.
    `,
  },
  {
    slug: 'geo-vs-seo',
    title: 'GEO vs SEO: What Content Marketers Need to Know in 2025',
    date: 'June 2, 2025',
    readTime: '5 min read',
    category: 'AEO / GEO',
    excerpt: 'GEO (Generative Engine Optimisation) and SEO are not the same game. Here\'s what\'s different, what overlaps, and how to run both without burning your team.',
    content: `
## Two games, one content team

Until 2023, content marketers had one primary distribution channel to optimise for: Google Search. The rules were clear (if constantly evolving): keyword research, on-page optimisation, backlinks, E-E-A-T.

In 2024, a second channel became significant: AI-generated answers. ChatGPT reached 100M daily users. Perplexity became the go-to for research queries. Google's own AI Overviews started appearing at the top of search results.

These channels are not the same. Optimising for one doesn't automatically help with the other.

## What SEO and GEO share

Both reward:
- **High-quality, authoritative content** — thin content gets punished in both systems
- **Strong domain authority** — LLMs trust sources that traditional search also trusts
- **Structured markup** — schema helps both Google and LLMs parse your content correctly
- **Clear, direct answers** — pages that beat around the bush rank poorly everywhere

## Where they diverge

| Factor | Traditional SEO | GEO / AEO |
|--------|----------------|-----------|
| Primary signal | Backlinks + keyword relevance | Content specificity + citation worthiness |
| Measurement | Rank position + clicks | Brand mention rate in AI answers |
| Content format | Long-form, comprehensive | Direct answers, specific examples |
| Freshness | Important for some queries | Critical — LLMs weight recency heavily |
| Technical factors | Core Web Vitals, crawlability | Accessibility to AI crawlers |

## The strategic implication

You can't treat GEO as a subset of SEO. You need a separate content layer:

**For SEO:** comprehensive pages that cover a topic in depth, optimised for a primary keyword and cluster of related terms.

**For GEO:** specific answer pages that directly respond to the questions your buyers ask AI search. Short, precise, citable. Not written for keywords — written for questions.

## What this means for your content calendar

A practical approach for a team of 2–5 content people:

1. **Track both channels** — know your rank positions AND your AI citation rate for your top 10 topics
2. **Identify gaps per channel** — some gaps need new content, some need existing content restructured
3. **Prioritise by overlap** — fix content gaps that help both SEO and GEO first
4. **Add a "GEO brief" to existing content audits** — when you refresh old content, check AI citation rate, not just rank position

The teams that move first on GEO measurement will build a data advantage. Six months from now, knowing your AI citation rate across 50 topics will be as standard as knowing your keyword rankings.
    `,
  },
]

export function BlogList() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Blog</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Guides & insights</h1>
          <p className="text-lg text-gray-500">
            Plain-English guides on AEO, GEO, and SEO — written for content marketers and agency teams.
          </p>
        </div>
        <div className="space-y-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">{post.date} · {post.readTime}</span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg mb-2 leading-snug">{post.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const post = posts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
        <Link to="/blog" className="text-indigo-600 hover:underline">← Back to blog</Link>
      </div>
    )
  }

  const paragraphs = post.content.trim().split('\n')

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to blog
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{post.category}</span>
          <span className="text-xs text-gray-400">{post.date} · {post.readTime}</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>
        <p className="text-lg text-gray-500 mb-10 leading-relaxed border-l-4 border-indigo-200 pl-4">{post.excerpt}</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 prose prose-gray max-w-none">
          {paragraphs.map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3 first:mt-0">{line.replace('## ', '')}</h2>
            if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-gray-900 mt-6 mb-2">{line.replace('### ', '')}</h3>
            if (line.startsWith('| ')) return null
            if (line.startsWith('- ')) {
              return (
                <li key={i} className="text-sm text-gray-600 leading-relaxed ml-4 mb-1 list-disc">
                  <span dangerouslySetInnerHTML={{ __html: line.replace(/^- /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                </li>
              )
            }
            if (line.startsWith('1. ') || line.match(/^\d+\. /)) {
              return (
                <li key={i} className="text-sm text-gray-600 leading-relaxed ml-4 mb-1 list-decimal">
                  <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                </li>
              )
            }
            if (line.trim() === '') return <div key={i} className="h-3" />
            return (
              <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3"
                dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }}
              />
            )
          })}
        </div>

        <div className="mt-10 bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-indigo-900 mb-2">Check your AI visibility</h3>
          <p className="text-sm text-indigo-700 mb-4">See exactly where your brand shows up in AI search — in under 3 minutes.</p>
          <Link to="/app" className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            Try it free →
          </Link>
        </div>
      </div>
    </div>
  )
}
