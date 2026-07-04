import { Link } from 'react-router-dom'

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-indigo-600 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function FeatureCard({ icon, title, desc, badge }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="text-2xl mb-3">{icon}</div>
      {badge && (
        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded mb-2">
          {badge}
        </span>
      )}
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function Step({ num, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
        {num}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
          AEO + GEO + SEO — one tool
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
          Rank your content<br className="hidden md:block" /> in AI search
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          When someone asks ChatGPT, Claude, or Gemini about your category — does your brand show up? Find out in under 3 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-base"
          >
            Check my AI visibility →
          </Link>
          <Link
            to="/pricing"
            className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-6 py-3.5 rounded-xl transition-colors text-base"
          >
            See pricing
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">No credit card required · Results in under 3 minutes</p>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-gray-200 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value="10+" label="AI questions per run" />
          <Stat value="3 LLMs" label="ChatGPT, Claude, Gemini" />
          <Stat value="< 3 min" label="Full visibility report" />
          <Stat value="17" label="Signals tracked per brand" />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">How it works</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-8">From zero to visibility report in 3 steps</h2>
            <div className="space-y-6">
              <Step num="1" title="Enter your brand + competitors + category"
                desc="Tell us who you are, who you're competing with, and what space you're in." />
              <Step num="2" title="We ask AI the questions your buyers ask"
                desc="We generate 10 buyer-intent questions and send them to Claude, ChatGPT, and Gemini in real time." />
              <Step num="3" title="Get your visibility score + action plan"
                desc="See exactly where each brand shows up, where you're invisible, and get plain-English content recommendations to close the gap." />
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm">
              Try it now →
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-400 mb-2">Question asked to Claude →</p>
              <p className="text-sm font-medium text-gray-800">"What is the best customer support software for Gmail users?"</p>
            </div>
            <div className="space-y-2">
              {[['Your Brand', 40, false], ['Competitor A', 70, false], ['Competitor B', 90, true]].map(([brand, pct, isTop]) => (
                <div key={brand}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isTop ? 'font-semibold text-gray-900' : 'text-gray-600'}>{brand}</span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className={`h-2 rounded-full ${isTop ? 'bg-indigo-500' : 'bg-gray-300'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-700 mb-1">Gap found</p>
              <p className="text-xs text-orange-900">Your brand isn't cited for this query — but competitors are. A targeted content page covering this exact question would close the gap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-gray-200 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Two pillars</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Everything you need to win AI search</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard badge="MAIN FEATURE" icon="📡" title="AI Visibility Tracker"
              desc="See exactly where your brand appears (or doesn't) across ChatGPT, Claude, and Gemini answers." />
            <FeatureCard icon="🎯" title="Competitor Citation Gap"
              desc="Find out which questions your competitors are getting cited for — but you aren't." />
            <FeatureCard icon="✍️" title="Content Recommendations"
              desc="Get specific, writer-ready content briefs to close each visibility gap." />
            <FeatureCard icon="🔍" title="Rank Drop Diagnosis"
              desc="Paste a blog URL + keyword. Get a plain-English breakdown of why it dropped and exactly how to fix it." />
            <FeatureCard icon="📋" title="Content Gap List"
              desc="Every topic your competitors cover that you're missing — scored by ranking impact." />
            <FeatureCard icon="🚨" title="Rank Drop Alerts"
              desc="Daily alerts on email and Telegram when your rankings move, with likely reasons and short tips." />
          </div>
          <div className="text-center mt-8">
            <Link to="/features" className="text-indigo-600 text-sm font-medium hover:underline">
              See all 17 features →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Pricing</span>
        <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Flat monthly pricing. Unlimited reports.</h2>
        <p className="text-gray-500 mb-8">
          No credits. No per-report charges. One domain or unlimited — pick what fits your team.
          Starting at <strong className="text-gray-900">₹2,999/month</strong>.
        </p>
        <Link to="/pricing" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          See all plans →
        </Link>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Find out where you stand in AI search</h2>
          <p className="text-indigo-200 mb-8">Results in under 3 minutes. No setup required.</p>
          <Link to="/login" className="bg-white text-indigo-600 font-bold px-6 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors text-base">
            Check my AI visibility →
          </Link>
        </div>
      </section>
    </div>
  )
}
