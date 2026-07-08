import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const CLEAR_LAST_RESULT = () => localStorage.removeItem('peach_last_result')

// ─── Typewriter ────────────────────────────────────────────────────────────────

const ROTATING_WORDS = ['cited', 'recommended', 'mentioned', 'trusted']

function useRotatingWord(intervalMs = 2400) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ROTATING_WORDS.length), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return ROTATING_WORDS[idx]
}

// ─── Glow Badge ────────────────────────────────────────────────────────────────

function GlowBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" />
      {children}
    </span>
  )
}

// ─── LLM Pills ─────────────────────────────────────────────────────────────────

function LLMPill({ name, score, color }) {
  return (
    <div className="flex items-center gap-2 bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 backdrop-blur-sm">
      <span className="text-sm">{name}</span>
      <span className="ml-auto text-xs font-bold" style={{ color }}>{score}%</span>
      <div className="w-10 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Mock Report Card ──────────────────────────────────────────────────────────

function MockReport() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glow behind card */}
      <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
        style={{ background: 'radial-gradient(ellipse at center, #5B3DF5 0%, transparent 70%)' }} />

      <div className="relative bg-[#13172B] border border-white/10 rounded-3xl p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#5B3DF5]/20 flex items-center justify-center text-xs font-bold text-[#9B7DFF]">F</div>
          <div>
            <p className="text-xs font-semibold text-white">freshdesk.com</p>
            <p className="text-[10px] text-white/40">AI Visibility Report</p>
          </div>
          <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Live</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3.5 mb-3">
          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#5B3DF5" strokeWidth="4"
                strokeDasharray="33 55" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">38%</span>
          </div>
          <div>
            <p className="text-[11px] text-white/40 mb-0.5">Visibility score</p>
            <p className="text-base font-bold text-white">Partially visible</p>
            <p className="text-[10px] text-white/40">5 of 8 prompts missed</p>
          </div>
        </div>

        {/* Per LLM */}
        <div className="space-y-1.5 mb-3">
          <LLMPill name="ChatGPT" score={50} color="#10B981" />
          <LLMPill name="Gemini" score={25} color="#F59E0B" />
          <LLMPill name="Google AIO" score={38} color="#6366F1" />
        </div>

        {/* Top competitor callout */}
        <div className="bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-red-400/80 font-semibold uppercase tracking-wide mb-0.5">Top competitor winning</p>
          <p className="text-xs text-white/70">Zendesk · cited in 6 of 8 prompts you missed</p>
        </div>
      </div>

      {/* Floating action badge */}
      <div className="absolute -bottom-3 -right-3 bg-[#5B3DF5] border border-[#7C5DFF] rounded-2xl px-3 py-2 shadow-lg">
        <p className="text-[10px] text-white/60 font-medium">Next best move</p>
        <p className="text-xs font-bold text-white">3 actions ready →</p>
      </div>
    </div>
  )
}

// ─── Feature Card ──────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, desc, highlight = false }) {
  return (
    <div className={`rounded-2xl p-6 border transition-all hover:scale-[1.01] ${
      highlight
        ? 'bg-[#5B3DF5] border-[#7C5DFF] text-white'
        : 'bg-white border-[#E8E3F4] hover:border-[#5B3DF5]/30 hover:shadow-md'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${highlight ? 'bg-white/15' : 'bg-[#F1EDFF]'}`}>
        <svg className={`w-5 h-5 ${highlight ? 'text-white' : 'text-[#5B3DF5]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
        </svg>
      </div>
      <h3 className={`font-semibold mb-1.5 ${highlight ? 'text-white' : 'text-[#14182B]'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${highlight ? 'text-white/70' : 'text-[#677085]'}`}>{desc}</p>
    </div>
  )
}

// ─── Step ─────────────────────────────────────────────────────────────────────

function Step({ num, title, desc }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl bg-[#5B3DF5] flex items-center justify-center text-sm font-bold text-white shrink-0">{num}</div>
        {num < 3 && <div className="w-px flex-1 bg-[#E8E3F4] my-2" />}
      </div>
      <div className="pb-8">
        <h4 className="font-semibold text-[#14182B] mb-1">{title}</h4>
        <p className="text-sm text-[#677085] leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Which AI platforms does Peach track?',
    a: 'ChatGPT, Gemini, and Google AI Overviews. Perplexity and Claude are on the roadmap.',
  },
  {
    q: 'Is this different from SEO?',
    a: 'Yes. SEO gets you ranked in search results. Peach shows whether AI systems mention, recommend, or cite your brand in generated answers — which is a completely different signal.',
  },
  {
    q: 'Can I see what competitors are being cited instead of me?',
    a: 'Yes. Every report shows which competitors appear in the same prompts you missed, with the exact AI answer as evidence.',
  },
  {
    q: 'What do I get at the end?',
    a: 'A full report: visibility score by platform, competitor citation gaps, the real AI answers, and a specific content action plan to improve your citations.',
  },
  {
    q: 'Do I need an account to run a report?',
    a: 'No. Your first report is free and requires no signup — just enter your website URL.',
  },
]

function FAQItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-[#E8E3F4] last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 py-4 text-left">
        <span className="font-semibold text-[#14182B]">{item.q}</span>
        <span className={`w-6 h-6 rounded-full border border-[#E8E3F4] flex items-center justify-center text-sm shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <p className="pb-4 text-sm text-[#677085] leading-relaxed">{item.a}</p>}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HomeV2() {
  const [openFaq, setOpenFaq] = useState(-1)
  const word = useRotatingWord()

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(160deg, #09091A 0%, #0F0C29 45%, #1A0F3A 100%)' }}
        className="relative overflow-hidden min-h-[92vh] flex flex-col items-center justify-center px-6 py-24">

        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, #5B3DF5 0%, #8B5CF6 40%, transparent 70%)' }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <GlowBadge>Free report · No signup required</GlowBadge>

          <h1 className="mt-8 text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Is your brand{' '}
            <span className="relative">
              <span key={word} style={{
                background: 'linear-gradient(135deg, #9B7DFF 0%, #C084FC 50%, #FB7185 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}>
                {word}
              </span>
            </span>
            <br />by AI?
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            ChatGPT and Gemini answer your buyers' questions every day.
            Peach shows you exactly where you appear — and where competitors win instead.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link to="/app" onClick={CLEAR_LAST_RESULT}
              className="group inline-flex items-center gap-2 bg-[#5B3DF5] hover:bg-[#4c30dd] text-white font-semibold px-8 py-4 rounded-xl transition-all text-base shadow-[0_0_30px_rgba(91,61,245,0.4)] hover:shadow-[0_0_40px_rgba(91,61,245,0.6)]">
              Check your AI visibility
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm font-medium transition-colors">
              See pricing →
            </Link>
          </div>

          {/* Mock report */}
          <div className="mt-6 max-w-sm mx-auto">
            <MockReport />
          </div>
        </div>
      </section>

      {/* ── Logos / social proof ── */}
      <section className="bg-[#FAFAFA] border-b border-[#F0EBF8] py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-6">Tracks visibility on</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { name: 'ChatGPT', bg: '#10A37F', letter: 'C' },
              { name: 'Gemini', bg: '#4285F4', letter: 'G' },
              { name: 'Google AIO', bg: '#EA4335', letter: 'A' },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-2 text-[#677085]">
                <span className="w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center" style={{ background: p.bg }}>{p.letter}</span>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold text-[#5B3DF5] uppercase tracking-widest mb-4">How it works</p>
              <h2 className="text-4xl font-bold text-[#14182B] leading-tight mb-6">
                From URL to full report in under 3 minutes
              </h2>
              <div className="mt-8">
                <Step num={1} title="Enter your website URL" desc="Peach reads your homepage and identifies your product category, competitors, and what makes you different." />
                <Step num={2} title="We run 8 buyer questions through AI" desc="The exact questions customers ask ChatGPT and Gemini before choosing a tool — like yours." />
                <Step num={3} title="Get your visibility report" desc="See your citation rate by platform, where competitors beat you, and a specific plan to close the gap." />
              </div>
            </div>

            {/* Right: question preview cards */}
            <div className="space-y-3">
              {[
                { q: 'Best customer support software for startups?', cited: true },
                { q: 'What are the top alternatives to Zendesk?', cited: false },
                { q: 'Which help desk tool is easiest to set up?', cited: true },
                { q: 'CRM with built-in ticketing for SaaS teams?', cited: false },
              ].map(({ q, cited }, i) => (
                <div key={i} className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 border text-sm ${
                  cited ? 'bg-emerald-50 border-emerald-200 text-[#14182B]' : 'bg-[#FEF2F2] border-red-100 text-[#14182B]'
                }`}>
                  <span className="leading-snug">{q}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    cited ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                  }`}>{cited ? 'Cited ✓' : 'Missed ✗'}</span>
                </div>
              ))}
              <p className="text-xs text-center text-[#9CA3AF] pt-1">Sample from an actual report</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features bento ── */}
      <section className="py-20 px-6 bg-[#F8F6FF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#5B3DF5] uppercase tracking-widest mb-3">What's inside</p>
            <h2 className="text-4xl font-bold text-[#14182B]">Everything in every report</h2>
            <p className="text-[#677085] mt-3">No raw data. Just clear answers and next steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard highlight
              icon="M9 19V6l7-3v13M9 19l-6 2V8l6-2m0 13l7-3V6m-7 13l7-3"
              title="Visibility score by platform"
              desc="See your citation rate on ChatGPT, Gemini, and Google AIO side by side." />
            <FeatureCard
              icon="M17 20h5v-2a4 4 0 00-5.6-3.7M9 20H4v-2a4 4 0 015.6-3.7M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              title="Competitor citation gaps"
              desc="Exactly which competitors are cited in the prompts you miss — with the AI answer as proof." />
            <FeatureCard
              icon="M8 10h.01M12 10h.01M16 10h.01M21 16a2 2 0 01-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"
              title="Real AI answers"
              desc="Read word-for-word what ChatGPT and Gemini say about your category." />
            <FeatureCard
              icon="M13 10V3L4 14h7v7l9-11h-7z"
              title="Content action plan"
              desc="Specific, writer-ready tasks: what to create, improve, or prove to earn citations." />
            <FeatureCard
              icon="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              title="Citation sources"
              desc="Which domains AI trusts for your category and why they outrank you." />
            <FeatureCard
              icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              title="Site audit"
              desc="Check if AI crawlers can access your site and what they understand when they do." />
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#14182B]">Built for teams who need to be in the answer</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { emoji: '✍️', role: 'Content & SEO', desc: 'Turn missing AI citations into your next content priorities. Know exactly what to write.' },
              { emoji: '📈', role: 'Growth Teams', desc: 'See if AI is sending high-intent buyers to you or competitors before it costs you pipeline.' },
              { emoji: '🎯', role: 'Founders & Marketers', desc: 'Know how AI describes your brand — and fix it before customers hear the wrong story.' },
              { emoji: '🏢', role: 'Agencies', desc: 'Show clients exactly where they appear in AI answers and deliver a prioritised action plan.' },
            ].map(({ emoji, role, desc }) => (
              <div key={role} className="flex gap-4 p-5 rounded-2xl border border-[#E8E3F4] hover:border-[#5B3DF5]/30 hover:shadow-sm transition-all">
                <span className="text-2xl shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <p className="font-semibold text-[#14182B] mb-1">{role}</p>
                  <p className="text-sm text-[#677085] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 bg-[#F8F6FF]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#14182B] mb-3">Questions</h2>
            <p className="text-[#677085]">Everything you need to know about Peach.</p>
          </div>
          <div className="bg-white rounded-3xl border border-[#E8E3F4] px-6 divide-y divide-[#E8E3F4]">
            {FAQS.map((item, i) => (
              <FAQItem key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ background: 'linear-gradient(160deg, #09091A 0%, #0F0C29 45%, #1A0F3A 100%)' }}
        className="relative overflow-hidden py-28 px-6 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full opacity-25 blur-[80px]"
          style={{ background: 'radial-gradient(ellipse, #5B3DF5 0%, #8B5CF6 50%, transparent 70%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-5 leading-tight">Find out where you stand<br />in AI search</h2>
          <p className="text-white/50 mb-10 text-lg">Results in under 3 minutes. No setup required.</p>
          <Link to="/app" onClick={CLEAR_LAST_RESULT}
            className="inline-flex items-center gap-2 bg-white text-[#14182B] font-bold px-8 py-4 rounded-xl transition-all text-base hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            Check your AI visibility
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-white/30 text-xs mt-4">Free report · No credit card needed</p>
        </div>
      </section>

    </div>
  )
}
