import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { btnBase, btnStyle } from '../lib/motion'

const COMING_SOON = [
  {
    icon: '🔔',
    title: 'Scheduled Monitoring',
    desc: 'Set it and forget it. Peach re-runs your visibility report every week and emails you when your score changes — no manual checks needed.',
  },
  {
    icon: '💜',
    title: 'Perplexity Tracking',
    desc: 'Track how often Perplexity cites your brand in buyer-intent answers. The fastest-growing AI search engine for B2B buyers.',
  },
  {
    icon: '✍️',
    title: '30 AI Content Briefs / Month',
    desc: "Every visibility gap becomes a ready-to-publish content brief. Get 30 structured briefs per month, each targeting a specific buyer query where AI doesn't cite you yet.",
  },
  {
    icon: '🔗',
    title: '50 Citation-Building Credits / Month',
    desc: 'Peach identifies the exact domains AI cites in your category. Use your 50 monthly credits to discover, prioritise, and track citation-building opportunities.',
  },
  {
    icon: '🔌',
    title: 'Integrations',
    desc: 'Connect Peach to the tools you already use. Publish content briefs to Notion, trigger Slack alerts on score drops, sync gaps to HubSpot, Ahrefs, Semrush, Contentful, Framer, and more.',
  },
  {
    icon: '🌍',
    title: 'Multi-Language Visibility',
    desc: 'Check how AI describes your brand to buyers searching in French, Spanish, German, and 20+ other languages. Global visibility at a glance.',
  },
  {
    icon: '🏢',
    title: 'Multi-Domain Tracking',
    desc: 'Track multiple websites from one dashboard — ideal for agencies, holding companies, or brands with multiple product lines.',
  },
  {
    icon: '👥',
    title: 'Team Collaboration',
    desc: 'Invite teammates to view reports, comment on gaps, and track progress together. Keep your whole marketing team aligned on AI visibility.',
  },
  {
    icon: '⚡',
    title: 'Slack & Email Alerts',
    desc: 'Get instant notifications when a competitor gains ground, a new citation source appears, or your visibility score drops. Never miss a shift.',
  },
  {
    icon: '🔑',
    title: 'API Access',
    desc: 'Pull your AI visibility scores, gaps, and competitor data into your own dashboards, CRMs, or BI tools via a simple REST API.',
  },
]

const FEATURES = [
  {
    icon: '🔍',
    title: 'AI Visibility Score',
    desc: 'Enter your URL — we test your brand across real buyer queries on ChatGPT and Gemini. See exactly what % of AI answers mention you.',
  },
  {
    icon: '💬',
    title: 'Real AI Answers',
    desc: 'Read the exact text ChatGPT and Gemini give when asked about your category. No guessing — see the actual responses word for word.',
  },
  {
    icon: '🏆',
    title: 'Competitor Comparison',
    desc: 'See which brands AI cites instead of you — and how often. Know your competitive position in AI search before your customers do.',
  },
  {
    icon: '🎯',
    title: 'Gap Opportunities',
    desc: 'Every query where a competitor appears but you don\'t is a content opportunity. We surface them all, ranked by impact.',
  },
  {
    icon: '⚡',
    title: 'Action Plan',
    desc: 'Get 3 specific content pieces you need to create — backed by evidence from actual AI answers, not generic SEO advice.',
  },
  {
    icon: '🤖',
    title: 'Crawler Access Audit',
    desc: 'Check if GPTBot, Google-Extended, ClaudeBot, and PerplexityBot can crawl your site. A blocked bot means invisible to that AI.',
  },
  {
    icon: '📄',
    title: 'AI Crawler Preview',
    desc: 'See exactly what AI crawlers read from your homepage — the text, structure, and character count. What they see is what they cite.',
  },
  {
    icon: '🌐',
    title: 'Top Cited Sources',
    desc: 'Discover which domains AI references most in your category. These are your benchmark sources — and your link targets.',
  },
  {
    icon: '📊',
    title: 'Multi-Platform Coverage',
    desc: 'Tested on ChatGPT, Gemini, and Google AI Overview — the three AI surfaces where your customers discover and evaluate brands.',
  },
  {
    icon: '📥',
    title: 'Export & Share',
    desc: 'Download your full report as CSV, copy a shareable link, or print — all in one click from the results page.',
  },
  {
    icon: '📈',
    title: 'Visibility Dashboard',
    desc: 'Track your AI visibility score across runs. See which content changes moved the needle and which competitor gained ground.',
  },
  {
    icon: '🧠',
    title: 'Buyer-Intent Queries',
    desc: 'We auto-generate the exact questions your real customers type into AI — not branded, not generic. Category-specific and accurate.',
  },
]

export default function Features() {
  useEffect(() => { document.title = 'Features — Peach' }, [])
  return (
    <div className="bg-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Live features */}
        <div className="mb-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">What's live now</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold text-gray-900 text-base">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-14 mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coming soon</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMING_SOON.map((f) => (
            <div
              key={f.title}
              className="bg-white/60 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col gap-3 relative"
            >
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wide">Soon</span>
              </div>
              <span className="text-3xl opacity-60">{f.icon}</span>
              <h3 className="font-bold text-slate-500 text-base">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm mb-4">All of this runs from a single URL input — no setup, no integrations.</p>
          <Link
            to="/app"
            onClick={() => localStorage.removeItem('peach_last_result')}
            className={`inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors ${btnBase}`}
            style={btnStyle()}
          >
            Try it free — no card needed
          </Link>
        </div>

      </div>
    </div>
  )
}
