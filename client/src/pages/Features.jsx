import { Link } from 'react-router-dom'

const pillars = [
  {
    label: 'Pillar 1 — AEO / GEO Visibility',
    color: 'indigo',
    features: [
      {
        icon: '📡',
        title: 'Brand Visibility Tracker',
        desc: 'Enter your brand + competitors + category. We generate 20–30 buyer-intent questions, send them to Claude, ChatGPT, and Gemini, then score which brands appear in the answers.',
      },
      {
        icon: '🎯',
        title: 'Competitor Citation Gap',
        desc: 'Identifies which questions your brand is missing from. Shows which competitor is being cited instead and flags citation patterns — is one competitor dominating a specific question type?',
      },
      {
        icon: '🔮',
        title: 'Pre-Publish AI Visibility Prediction',
        desc: 'Before publishing, predict whether your content will get cited by LLMs. Topic and entity coverage check, search intent validation, and heading/FAQ structure suggestions.',
      },
      {
        icon: '✍️',
        title: 'Optimisation Recommendations',
        desc: 'Plain-English guidance on what to write, where to publish, how to structure. Output formatted as a content brief — paste directly to your writer.',
      },
      {
        icon: '🧩',
        title: 'Holistic Page Improvement',
        desc: 'Goes beyond content gaps. Recommends video embeds, interactive elements, and anything that increases time on page — signals LLMs treat as authority indicators.',
      },
      {
        icon: '📈',
        title: 'Rank Improvement Forecasting',
        desc: 'For each recommended action, see the expected improvement. Not just what to fix — what result fixing it will likely produce.',
      },
    ],
  },
  {
    label: 'Pillar 2 — SEO Rank Diagnosis',
    color: 'emerald',
    features: [
      {
        icon: '🔍',
        title: 'Ranking Drop Diagnosis',
        desc: 'Paste a blog URL + keyword. We scrape your page, fetch the top 10 competing pages, and Claude produces a plain-English diagnosis ranked by severity — highest impact first.',
      },
      {
        icon: '📋',
        title: 'Content Gap List',
        desc: 'Every topic, subtopic, and angle competitors cover that your page is missing. Each gap scored by ranking impact with a suggested heading and recommended word count.',
      },
      {
        icon: '📝',
        title: 'Writer-Ready Content Brief',
        desc: 'Gap analysis auto-generates a complete content brief. No extra step between analysis and handing it to your writer.',
      },
      {
        icon: '🔬',
        title: 'Pre-Publish Content Gap Analysis',
        desc: 'Before publishing, check your draft against current top-ranking pages. Topic and entity coverage, keyword cannibalization check, and content structure suggestions.',
      },
      {
        icon: '📊',
        title: 'SERP Structure Analysis',
        desc: 'Check if the SERP layout changed between two dates — more ads, different features, position zero changes. Explains if a click drop is from ranking or layout.',
      },
      {
        icon: '🏷️',
        title: 'Schema Markup Check',
        desc: 'Check if competing pages added schema your page is missing. Flags FAQ, HowTo, Article, and Review schema types.',
      },
      {
        icon: '🏆',
        title: 'Topical Authority Score',
        desc: 'Content cluster analysis — which clusters helped competitors win. Topical authority score per domain with actionable metrics to regain ranking.',
      },
      {
        icon: '📉',
        title: 'Google Trends Integration',
        desc: 'Pulls trend data for your target keyword. Flags if search interest dropped — which may explain a ranking drop independently of content quality.',
      },
    ],
  },
  {
    label: 'Monitoring & Alerts',
    color: 'orange',
    features: [
      {
        icon: '🚨',
        title: 'Rank Drop Alerts',
        desc: 'Daily alerts via email, Telegram, and WhatsApp. Each alert includes rank status, drop details, likely reasons, and short tips — so you know before your client does.',
      },
      {
        icon: '🔔',
        title: 'Passive Background Monitoring',
        desc: 'Runs in the background. Sends a notification when rankings drop — no login needed.',
      },
      {
        icon: '🕵️',
        title: 'Competitor Blog Monitor',
        desc: 'Tracks competitor blogs and landing pages weekly. Flags every new post and messaging shift, and surfaces keywords competitors rank for that you haven\'t touched.',
      },
    ],
  },
  {
    label: 'Integrations',
    color: 'blue',
    features: [
      {
        icon: '🔗',
        title: 'Google Search Console Integration',
        desc: 'Connect GSC directly. Pull traffic, impression, CTR, and position data without switching tools. Reporting inside the tool without exporting from GSC.',
      },
    ],
  },
]

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function Features() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Every feature, explained</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Built from direct feedback from 20+ SEO managers, content marketers, and agency owners.
          </p>
        </div>

        <div className="space-y-14">
          {pillars.map(({ label, color, features }) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-0.5 flex-1 bg-${color}-200`} />
                <span className={`text-xs font-bold text-${color}-700 uppercase tracking-wider`}>{label}</span>
                <div className={`h-0.5 flex-1 bg-${color}-200`} />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f) => (
                  <FeatureCard key={f.title} {...f} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-indigo-600 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to see where you stand?</h2>
          <p className="text-indigo-200 mb-6">Full visibility report in under 3 minutes.</p>
          <Link to="/app" className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
            Check my AI visibility →
          </Link>
        </div>
      </div>
    </div>
  )
}
