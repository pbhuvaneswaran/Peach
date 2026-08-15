import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const CLEAR = () => localStorage.removeItem('peach_last_result')

const DYNAMIC_WORDS = ['ChatGPT', 'Gemini', 'Perplexity', 'AI search']

function DynamicWord() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)
  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % DYNAMIC_WORDS.length)
        setFade(true)
      }, 300)
    }, 2200)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{ transition: 'opacity 0.3s', opacity: fade ? 1 : 0, color: '#93C5FD' }}>
      {DYNAMIC_WORDS[idx]}
    </span>
  )
}

function HeroVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-blue-200 text-xs font-mono ml-2">peach — freshdesk.com</span>
        </div>
        {[
          { label: 'AI Visibility Score', value: '42%', color: '#F59E0B', bar: 42 },
          { label: 'ChatGPT mentions', value: '3/8', color: '#10A37F', bar: 37 },
          { label: 'Gemini mentions', value: '4/8', color: '#4285F4', bar: 50 },
          { label: 'Top competitor', value: 'Zendesk', color: '#8B5CF6', bar: 75 },
        ].map(row => (
          <div key={row.label} className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-200">{row.label}</span>
              <span className="text-white font-semibold">{row.value}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${row.bar}%`, background: row.color }} />
            </div>
          </div>
        ))}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-blue-300 mb-2">Top gap opportunity</p>
          <p className="text-xs text-white">"Best helpdesk for SaaS startups" — Zendesk cited, you're not</p>
        </div>
      </div>
    </div>
  )
}

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
      className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-full px-5 py-3 w-full max-w-md mx-auto cursor-text transition-all backdrop-blur-sm"
      style={{ height: 52 }}
    >
      <svg className="w-4 h-4 text-blue-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && run()}
        placeholder="yourwebsite.com"
        className="flex-1 bg-transparent text-sm text-white placeholder-blue-200/70 outline-none font-mono"
      />
      <button
        onClick={run}
        className="shrink-0 bg-white text-blue-700 text-xs font-medium px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
      >
        Check →
      </button>
    </div>
  )
}

// ─── Terminal-style mock report (floats on the blue canvas) ──────────────────
function TerminalCard() {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden w-full max-w-md mx-auto bg-white shadow-xl">
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
      <span className="mt-[3px] text-blue-600">✓</span>
      <span>{children}</span>
    </li>
  )
}

// ─── White card that floats on the blue canvas ───────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`border border-white/10 rounded-xl p-8 bg-white shadow-lg ${className}`}>
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
    <div className="space-y-3">
      {FAQS.map((item, i) => (
        <div key={item.q} className="bg-white rounded-xl overflow-hidden shadow-lg">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-black hover:bg-blue-50/50 transition-colors"
            style={displayFont}
          >
            {item.q}
            <span className={`text-blue-500 text-lg transition-transform shrink-0 ${open === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {open === i && (
            <p className="px-5 pb-4 text-sm text-neutral-500 leading-relaxed">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
// Every fold stays on the blue palette, alternating dark / pale so sections
// stay visually distinct without ever breaking to white or gray.
export default function HomeV2() {
  useEffect(() => { document.title = 'Peach — AI Visibility Checker for Your Brand' }, [])
  return (
    <div>

      {/* ── Hero (dark) ──────────────────────────────────────────────────── */}
      <section className="bg-blue-900 px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <h1 className="text-white mb-6 tracking-tight leading-tight" style={{ ...displayFont, fontSize: 52, lineHeight: 1.08 }}>
              Is your brand showing up<br />on <DynamicWord />?
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed max-w-md">
              ChatGPT and Gemini answer your buyers' questions every day.
              Peach shows you exactly where you appear — and what to do about it.
            </p>
            <UrlPill />
            <p className="text-xs text-blue-300 mt-3">Sign in required · Results in under 3 minutes</p>
          </div>
          {/* Right — visual */}
          <div className="hidden md:block">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ── Terminal preview + platform strip (pale) ────────────────────── */}
      <section className="bg-blue-50 px-6 py-16">
        <div className="max-w-xl mx-auto">
          <TerminalCard />
          <div className="text-center mt-12">
            <p className="text-xs text-blue-500 uppercase tracking-widest mb-5 font-medium">Tracks visibility across</p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { name: 'ChatGPT', color: '#10A37F' },
                { name: 'Gemini', color: '#4285F4' },
                { name: 'Google AIO', color: '#EA4335' },
              ].map(p => (
                <span key={p.name} className="flex items-center gap-2 text-sm text-blue-900">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Automate / How it works (dark) ──────────────────────────────── */}
      <section className="bg-blue-900 px-6" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-2xl mb-4 tracking-tight text-white" style={{ ...displayFont, fontSize: 24, lineHeight: 1.33 }}>
                From URL to full report in under 3 minutes
              </h2>
              <p className="text-sm text-blue-100 leading-relaxed mb-8">
                Enter your website. Peach figures out your category, generates buyer questions, queries AI platforms, and delivers a prioritised action plan.
              </p>
              <ol className="space-y-6">
                {[
                  { n: '1', t: 'Enter your website URL', d: 'Peach reads your homepage and extracts your product category, positioning, and competitors.' },
                  { n: '2', t: 'We run 8 buyer questions through AI', d: 'The exact queries your customers ask ChatGPT and Gemini before choosing a tool like yours.' },
                  { n: '3', t: 'Get your visibility report', d: 'Citation rate by platform, competitor gaps with evidence, and a specific content plan.' },
                ].map(s => (
                  <li key={s.n} className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-white text-blue-700 text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                    <div>
                      <p className="text-sm font-medium text-white mb-1">{s.t}</p>
                      <p className="text-sm text-blue-100 leading-relaxed">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sample prompt cards */}
            <div className="space-y-2">
              <p className="text-xs text-blue-200 uppercase tracking-widest mb-4 font-medium">Sample prompt results</p>
              {[
                { q: 'Best customer support software for startups?', cited: true },
                { q: 'Top alternatives to Zendesk?', cited: false },
                { q: 'Easiest help desk to set up?', cited: true },
                { q: 'CRM with built-in ticketing for SaaS?', cited: false },
              ].map(({ q, cited }, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-3 shadow-lg">
                  <span className="text-sm text-neutral-700 leading-snug">{q}</span>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
                    cited ? 'bg-blue-50 text-blue-700' : 'bg-blue-900 text-white'
                  }`}>{cited ? 'Cited' : 'Missed'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What's inside (pale) ────────────────────────────────────────── */}
      <section className="bg-blue-50 px-6" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl mb-2 tracking-tight text-blue-950" style={{ ...displayFont, fontSize: 24, lineHeight: 1.33 }}>
            Everything in every report
          </h2>
          <p className="text-sm text-blue-700 mb-10">No raw data. Clear answers and next steps.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-base font-medium mb-3 text-black">Visibility score by platform</h3>
              <ul className="space-y-2">
                <Bullet>Citation rate on ChatGPT, Gemini, and Google AIO</Bullet>
                <Bullet>Side-by-side platform comparison</Bullet>
                <Bullet>Prompt-by-prompt breakdown</Bullet>
              </ul>
            </Card>

            <Card>
              <h3 className="text-base font-medium mb-3 text-black">Competitor citation gaps</h3>
              <ul className="space-y-2">
                <Bullet>Which competitors appear in missed prompts</Bullet>
                <Bullet>Exact AI answer as evidence</Bullet>
                <Bullet>Citation rate comparison</Bullet>
              </ul>
            </Card>

            <Card>
              <h3 className="text-base font-medium mb-3 text-black">Real AI answers</h3>
              <ul className="space-y-2">
                <Bullet>Word-for-word answers from each LLM</Bullet>
                <Bullet>What AI understands about your category</Bullet>
                <Bullet>Brand language analysis</Bullet>
              </ul>
            </Card>

            <Card>
              <h3 className="text-base font-medium mb-3 text-black">Content action plan</h3>
              <ul className="space-y-2">
                <Bullet>Specific, writer-ready tasks</Bullet>
                <Bullet>Blog post outlines for each action</Bullet>
                <Bullet>Prioritised by impact</Bullet>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Your data stays yours (dark, small band) ────────────────────── */}
      <section className="bg-blue-900 px-6 py-12">
        <div className="max-w-xl mx-auto text-center">
          <svg className="w-8 h-8 mx-auto mb-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V9m0 0a3 3 0 110-6 3 3 0 010 6zm0 0c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" />
          </svg>
          <p className="text-sm font-medium mb-1 text-white">Your data stays yours</p>
          <p className="text-sm text-blue-100">Reports are generated live and never stored without your consent. No tracking beyond what's needed to run your report.</p>
        </div>
      </section>

      {/* ── FAQ (pale) ───────────────────────────────────────────────────── */}
      <section className="bg-blue-50 px-6" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl mb-10 tracking-tight text-blue-950 text-center" style={{ ...displayFont, fontSize: 30, lineHeight: 1.2 }}>
            Frequently asked questions
          </h2>
          <FAQ />
          <div className="mt-10 text-center">
            <p className="text-sm text-blue-700 mb-2">Still curious?</p>
            <a href="mailto:hello@gotopeach.com" className="text-sm underline text-blue-950 hover:text-blue-700">
              hello@gotopeach.com
            </a>
          </div>
        </div>
      </section>

      {/* ── Final CTA (dark) ─────────────────────────────────────────────── */}
      <section className="bg-blue-900 px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl text-white mb-3 tracking-tight" style={{ ...displayFont, fontSize: 24, lineHeight: 1.33 }}>
            Find out where you stand in AI search
          </h2>
          <p className="text-sm text-blue-100 mb-6">Results in under 3 minutes. No setup required.</p>
          <Link to="/app" onClick={CLEAR}
            className="inline-block bg-white text-blue-700 text-sm font-medium px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors">
            Check your AI visibility →
          </Link>
        </div>
      </section>

    </div>
  )
}
