import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'

const CLEAR = () => localStorage.removeItem('peach_last_result')

// ─── Heading font (SF Pro Rounded → system-ui fallback) ───────────────────────
const displayFont = { fontFamily: "'SF Pro Rounded', 'SF Pro Display', system-ui, -apple-system, sans-serif", fontWeight: 500 }

// ─── URL input pill (the "install snippet" of Peach) ─────────────────────────
function UrlPill() {
  const [val, setVal] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const run = () => {
    if (!val.trim()) return
    CLEAR()
    localStorage.setItem('peach_prefill_url', val.trim())
    navigate('/app')
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex items-center gap-3 bg-neutral-100 hover:bg-neutral-50 border border-transparent hover:border-neutral-300 rounded-full px-5 py-3 w-full max-w-md mx-auto cursor-text transition-all"
      style={{ height: 52 }}
    >
      <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && run()}
        placeholder="yourwebsite.com"
        className="flex-1 bg-transparent text-sm text-black placeholder-neutral-400 outline-none font-mono"
      />
      <button
        onClick={run}
        className="shrink-0 bg-black text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-neutral-800 transition-colors"
      >
        Check →
      </button>
    </div>
  )
}

// ─── Terminal-style mock report ───────────────────────────────────────────────
function TerminalCard() {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden w-full max-w-md mx-auto bg-white">
      {/* Traffic lights */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-neutral-100 bg-neutral-50">
        <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 text-xs text-neutral-400 font-mono">peach — freshdesk.com</span>
      </div>
      {/* Body */}
      <div className="px-5 py-4 font-mono text-sm space-y-1">
        <p><span className="text-neutral-400">$</span> <span className="text-black">peach check freshdesk.com</span></p>
        <p className="text-neutral-400">Reading homepage…</p>
        <p className="text-neutral-400">Identifying category: <span className="text-black">customer support software</span></p>
        <p className="text-neutral-400">Running 8 buyer questions through ChatGPT + Gemini…</p>
        <p className="mt-2"><span className="text-neutral-400">Visibility score  </span><span className="font-semibold text-black">38%</span></p>
        <p><span className="text-neutral-400">ChatGPT           </span><span className="text-black">50%</span></p>
        <p><span className="text-neutral-400">Gemini            </span><span className="text-black">25%</span></p>
        <p><span className="text-neutral-400">Top competitor    </span><span className="text-black">Zendesk (6/8 prompts)</span></p>
        <p className="mt-2 text-neutral-400"># 3 growth actions ready →</p>
      </div>
    </div>
  )
}

// ─── Feature bullet ───────────────────────────────────────────────────────────
function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-neutral-600">
      <span className="mt-[3px] text-black">✓</span>
      <span>{children}</span>
    </li>
  )
}

// ─── Hairline card ────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`border border-neutral-200 rounded-xl p-8 bg-white ${className}`}>
      {children}
    </div>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Which AI platforms does Peach track?', a: 'ChatGPT, Gemini, and Google AI Overviews. Perplexity and Claude are on the roadmap.' },
  { q: 'Is this different from SEO?', a: 'Yes. SEO gets you ranked in search results. Peach shows whether AI systems mention, recommend, or cite your brand in generated answers — a completely different signal.' },
  { q: 'Can I see what competitors are being cited instead of me?', a: 'Yes. Every report shows which competitors appear in the same prompts you missed, with the exact AI answer as evidence.' },
  { q: 'What do I get at the end?', a: 'A visibility score by platform, competitor citation gaps, the real AI answers word-for-word, and a specific content action plan.' },
  { q: 'Do I need an account?', a: 'No. Your first report is free and requires no signup — just enter your website URL above.' },
]

function FAQ() {
  const [open, setOpen] = useState(-1)
  return (
    <div>
      {FAQS.map((item, i) => (
        <div key={item.q} className="border-b border-neutral-200 last:border-0">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between gap-4 py-4 text-left text-base font-medium text-black hover:text-neutral-700 transition-colors"
            style={displayFont}
          >
            {item.q}
            <span className={`text-neutral-400 text-lg transition-transform shrink-0 ${open === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {open === i && (
            <p className="pb-4 text-sm text-neutral-500 leading-relaxed">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomeV2() {
  return (
    <div className="bg-white text-black">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center" style={{ paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl leading-tight mb-6 tracking-tight" style={{ ...displayFont, fontSize: 36, lineHeight: 1.11 }}>
            Is your brand showing up<br />in AI search?
          </h1>
          <p className="text-base text-neutral-500 mb-8 leading-relaxed">
            ChatGPT and Gemini answer your buyers' questions every day.
            Peach shows you exactly where you appear — and what to do about it.
          </p>
          <UrlPill />
          <p className="text-xs text-neutral-400 mt-3">Free report · No account needed · Results in under 3 minutes</p>
        </div>
      </section>

      {/* ── Terminal preview ─────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-xl mx-auto">
          <TerminalCard />
        </div>
      </section>

      {/* ── Platform strip ───────────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 py-8 px-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs text-neutral-400 uppercase tracking-widest mb-5 font-medium">Tracks visibility across</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { name: 'ChatGPT', color: '#10A37F' },
              { name: 'Gemini', color: '#4285F4' },
              { name: 'Google AIO', color: '#EA4335' },
            ].map(p => (
              <span key={p.name} className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Automate / How it works ──────────────────────────────────────── */}
      <section className="px-6" style={{ paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-2xl mb-4 tracking-tight" style={{ ...displayFont, fontSize: 24, lineHeight: 1.33 }}>
                From URL to full report in under 3 minutes
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-8">
                Enter your website. Peach figures out your category, generates buyer questions, queries AI platforms, and delivers a prioritised action plan.
              </p>
              <ol className="space-y-6">
                {[
                  { n: '1', t: 'Enter your website URL', d: 'Peach reads your homepage and extracts your product category, positioning, and competitors.' },
                  { n: '2', t: 'We run 8 buyer questions through AI', d: 'The exact queries your customers ask ChatGPT and Gemini before choosing a tool like yours.' },
                  { n: '3', t: 'Get your visibility report', d: 'Citation rate by platform, competitor gaps with evidence, and a specific content plan.' },
                ].map(s => (
                  <li key={s.n} className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                    <div>
                      <p className="text-sm font-medium text-black mb-1">{s.t}</p>
                      <p className="text-sm text-neutral-500 leading-relaxed">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sample prompt cards */}
            <div className="space-y-2">
              <p className="text-xs text-neutral-400 uppercase tracking-widest mb-4 font-medium">Sample prompt results</p>
              {[
                { q: 'Best customer support software for startups?', cited: true },
                { q: 'Top alternatives to Zendesk?', cited: false },
                { q: 'Easiest help desk to set up?', cited: true },
                { q: 'CRM with built-in ticketing for SaaS?', cited: false },
              ].map(({ q, cited }, i) => (
                <div key={i} className="flex items-center justify-between gap-3 border border-neutral-200 rounded-lg px-4 py-3">
                  <span className="text-sm text-neutral-700 leading-snug">{q}</span>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
                    cited ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-900 text-white'
                  }`}>{cited ? 'Cited' : 'Missed'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What's inside ────────────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 px-6" style={{ paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl mb-2 tracking-tight" style={{ ...displayFont, fontSize: 24, lineHeight: 1.33 }}>
            Everything in every report
          </h2>
          <p className="text-sm text-neutral-500 mb-10">No raw data. Clear answers and next steps.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-base font-medium mb-3">Visibility score by platform</h3>
              <ul className="space-y-2">
                <Bullet>Citation rate on ChatGPT, Gemini, and Google AIO</Bullet>
                <Bullet>Side-by-side platform comparison</Bullet>
                <Bullet>Prompt-by-prompt breakdown</Bullet>
              </ul>
            </Card>

            <Card className="bg-neutral-950 border-neutral-800">
              <h3 className="text-base font-medium mb-3 text-white">Competitor citation gaps</h3>
              <ul className="space-y-2">
                <Bullet><span className="text-neutral-300">Which competitors appear in missed prompts</span></Bullet>
                <Bullet><span className="text-neutral-300">Exact AI answer as evidence</span></Bullet>
                <Bullet><span className="text-neutral-300">Citation rate comparison</span></Bullet>
              </ul>
            </Card>

            <Card>
              <h3 className="text-base font-medium mb-3">Real AI answers</h3>
              <ul className="space-y-2">
                <Bullet>Word-for-word answers from each LLM</Bullet>
                <Bullet>What AI understands about your category</Bullet>
                <Bullet>Brand language analysis</Bullet>
              </ul>
            </Card>

            <Card>
              <h3 className="text-base font-medium mb-3">Content action plan</h3>
              <ul className="space-y-2">
                <Bullet>Specific, writer-ready tasks</Bullet>
                <Bullet>Blog post outlines for each action</Bullet>
                <Bullet>Prioritised by impact</Bullet>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Who it's for ─────────────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 px-6" style={{ paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl mb-10 tracking-tight" style={{ ...displayFont, fontSize: 24, lineHeight: 1.33 }}>
            Built for teams who need to be in the answer
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { role: 'Content & SEO', desc: 'Turn missing AI citations into your next content priorities. Know exactly what to write.' },
              { role: 'Growth teams', desc: 'See if AI is sending high-intent buyers to you or competitors before it costs you pipeline.' },
              { role: 'Founders & marketers', desc: 'Know how AI describes your brand — and fix it before customers hear the wrong story.' },
              { role: 'Agencies', desc: 'Show clients exactly where they appear in AI answers and deliver a prioritised action plan.' },
            ].map(({ role, desc }) => (
              <div key={role}>
                <p className="text-sm font-medium text-black mb-1">{role}</p>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Your data stays yours ─────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 px-6 py-12">
        <div className="max-w-xl mx-auto text-center">
          <svg className="w-8 h-8 mx-auto mb-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V9m0 0a3 3 0 110-6 3 3 0 010 6zm0 0c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" />
          </svg>
          <p className="text-sm font-medium mb-1">Your data stays yours</p>
          <p className="text-sm text-neutral-500">Reports are generated live and never stored without your consent. No tracking beyond what's needed to run your report.</p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 px-6" style={{ paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl mb-10 tracking-tight" style={{ ...displayFont, fontSize: 30, lineHeight: 1.2 }}>
            Frequently asked questions
          </h2>
          <FAQ />
          <div className="mt-10 text-center">
            <p className="text-sm text-neutral-500 mb-2">Still curious?</p>
            <a href="mailto:hello@gotopeach.com" className="text-sm underline text-black hover:text-neutral-600">
              hello@gotopeach.com
            </a>
          </div>
        </div>
      </section>

      {/* ── Final CTA (dark strip) ────────────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-neutral-950 rounded-xl px-8 py-10 text-center">
            <h2 className="text-2xl text-white mb-3 tracking-tight" style={{ ...displayFont, fontSize: 24, lineHeight: 1.33 }}>
              Find out where you stand in AI search
            </h2>
            <p className="text-sm text-white/60 mb-6">Results in under 3 minutes. No setup required.</p>
            <Link to="/app" onClick={CLEAR}
              className="inline-block bg-white text-black text-sm font-medium px-6 py-2.5 rounded-full hover:bg-neutral-100 transition-colors">
              Check your AI visibility →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
