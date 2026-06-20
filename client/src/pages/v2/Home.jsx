import { Link } from 'react-router-dom'

function Step({ num, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{num}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function LLMBadge({ name, color }) {
  return <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{name}</span>
}

export default function HomeV2() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="flex justify-center gap-2 mb-6">
          <LLMBadge name="Claude" color="bg-orange-100 text-orange-700" />
          <LLMBadge name="ChatGPT" color="bg-green-100 text-green-700" />
          <LLMBadge name="Gemini" color="bg-blue-100 text-blue-700" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-5 max-w-4xl mx-auto tracking-tight">
          Does your brand show up<br className="hidden md:block" /> when AI is asked about you?
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          AEO Visibility tracks where your brand appears in AI-generated answers — across Claude, ChatGPT, and Gemini — and tells you exactly what to do about the gaps.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/v2/app"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base shadow-sm">
            Check my AI visibility →
          </Link>
          <Link to="/v2/pricing"
            className="bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-7 py-3.5 rounded-xl transition-colors text-base">
            See pricing
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Results in under 3 minutes · No credit card required</p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['3 AI engines', 'queried per report'], ['10 questions', 'generated per run'], ['< 3 min', 'full report'], ['Real-time', 'live API answers']].map(([v, l]) => (
            <div key={v}>
              <div className="text-xl font-bold text-gray-900">{v}</div>
              <div className="text-xs text-gray-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Three steps to your visibility report</h2>
            <div className="space-y-6">
              <Step num="1" title="Enter brand + competitors + category"
                desc="Tell us your brand, 2–3 competitors, and what category you compete in." />
              <Step num="2" title="We query all three AI engines live"
                desc="10 buyer-intent questions go to Claude, ChatGPT, and Gemini simultaneously. We parse which brands appear in each answer." />
              <Step num="3" title="Get scores + gap action plan"
                desc="See per-LLM visibility scores, where competitors are cited instead of you, and plain-English content actions to close each gap." />
            </div>
          </div>

          {/* Mock result card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Overall visibility</span>
            </div>
            {[['Your Brand', 38, true], ['Competitor A', 72, false], ['Competitor B', 61, false]].map(([name, pct, isUser]) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isUser ? 'font-semibold text-indigo-700' : 'text-gray-600'}>{name}</span>
                  <span className="font-bold">{pct}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full">
                  <div className={`h-2.5 rounded-full ${isUser ? 'bg-indigo-500' : 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-500 mb-3">Per AI engine</div>
              <div className="grid grid-cols-3 gap-2">
                {[['Claude', 30], ['ChatGPT', 45], ['Gemini', 40]].map(([llm, pct]) => (
                  <div key={llm} className="bg-white rounded-lg p-2.5 text-center border border-gray-100">
                    <div className="text-lg font-bold text-indigo-600">{pct}%</div>
                    <div className="text-xs text-gray-400 mt-0.5">{llm}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mt-2">
              <p className="text-xs font-semibold text-orange-700 mb-1">Top gap</p>
              <p className="text-xs text-orange-900">"Best customer support software for Gmail" — competitors cited, you're not. Publish a dedicated integration page.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What we track */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What you get in every report</h2>
            <p className="text-gray-500">No raw data dumps. Every output is ready to act on.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '📊', title: 'Visibility score per LLM', desc: 'See your mention rate on Claude, ChatGPT, and Gemini separately — not just an average.' },
              { icon: '🎯', title: 'Competitor citation gaps', desc: 'Every question where a competitor gets cited and you don\'t — ranked by impact.' },
              { icon: '✍️', title: 'Content action plan', desc: 'For each gap: a specific, writer-ready recommendation. No vague suggestions.' },
              { icon: '❓', title: '10 buyer-intent questions', desc: 'Generated by Claude for your exact category — the questions your real buyers ask AI.' },
              { icon: '🔄', title: 'Real-time LLM answers', desc: 'Live API calls — not cached or simulated data. What AI says today.' },
              { icon: '📋', title: 'Full question log', desc: 'Every question asked, every answer received — full transparency into the analysis.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Find out where you stand in AI search</h2>
        <p className="text-gray-500 mb-8">Results in under 3 minutes. No setup required.</p>
        <Link to="/v2/app"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base shadow-sm">
          Check my AI visibility →
        </Link>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link to="/v2/pricing" className="text-sm text-gray-500 hover:text-gray-700">See pricing →</Link>
        </div>
      </section>
    </div>
  )
}
