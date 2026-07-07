import { Link } from 'react-router-dom'

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
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-3">What Peach does</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Know exactly where you stand<br className="hidden sm:block" /> in AI search
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Peach shows you the actual AI answers about your category, which brands are cited, and what content to create to get mentioned.
          </p>
          <Link
            to="/app"
            onClick={() => localStorage.removeItem('peach_last_result')}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Check my AI visibility →
          </Link>
        </div>

        {/* 12-card grid */}
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

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm mb-4">All of this runs from a single URL input — no setup, no integrations.</p>
          <Link
            to="/app"
            onClick={() => localStorage.removeItem('peach_last_result')}
            className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Try it free — no card needed
          </Link>
        </div>

      </div>
    </div>
  )
}
