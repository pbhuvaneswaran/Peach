import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const CLEAR = () => localStorage.removeItem('peach_last_result')

const DYNAMIC_WORDS = ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'AI search']

function DynamicWord() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)
  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % DYNAMIC_WORDS.length)
        setFade(true)
      }, 200)
    }, 1800)
    return () => clearInterval(t)
  }, [])
  return (
    <span
      className="inline-block text-blue-300"
      style={{ transition: 'opacity 0.2s ease, transform 0.2s ease', opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(9px)' }}
    >
      {DYNAMIC_WORDS[idx]}
    </span>
  )
}

// ─── URL checker form — shared by hero + final CTA ────────────────────────────
function Checker({ dark = false }) {
  const [val, setVal] = useState('')
  const navigate = useNavigate()

  const run = e => {
    e.preventDefault()
    if (!val.trim()) return
    CLEAR()
    localStorage.setItem('peach_prefill_url', val.trim())
    navigate('/app')
  }

  return (
    <form onSubmit={run} className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-[0_20px_55px_rgba(3,15,50,0.26)]">
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="yourwebsite.com"
        className="flex-1 min-w-0 px-5 py-4 text-lg text-[#151c31] placeholder-neutral-400 outline-none rounded-xl"
      />
      <button
        type="submit"
        className="shrink-0 bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors"
      >
        Check my brand →
      </button>
    </form>
  )
}

function CheckIcon() {
  return (
    <span className="grid place-items-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold shrink-0">✓</span>
  )
}

function ScanCheck({ color = '#1d4ed8' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M3 8.5L6.5 12L13 4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Hero product visual — score card + live-audit card ───────────────────────
function HeroVisual() {
  return (
    <div className="relative hidden md:block" style={{ height: 620 }}>
      <div
        className="absolute right-0 top-1 rounded-[26px] border border-white/20 p-6.5"
        style={{ width: 400, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(14px)', boxShadow: '0 36px 90px rgba(1,15,49,0.32)', padding: 26 }}
      >
        <div className="flex items-center gap-2.5 text-xs text-blue-100 mb-5.5" style={{ marginBottom: 22 }}>
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </span>
          peach — yourbrand.com
        </div>

        {[
          { label: 'AI Visibility Score', value: '42%', pct: 42, color: '#f4aa16' },
          { label: 'ChatGPT mentions', value: '3/8', pct: 38, color: '#34d399' },
          { label: 'Gemini mentions', value: '4/8', pct: 50, color: '#60a5fa' },
          { label: 'Top competitor', value: 'Zendesk', pct: 76, color: '#a78bfa' },
        ].map(row => (
          <div key={row.label} style={{ margin: '16px 0' }}>
            <div className="flex items-center justify-between gap-3 text-[13px] text-[#cfdbf7]">
              <span>{row.label}</span>
              <strong className="text-[14px] font-semibold text-white">{row.value}</strong>
            </div>
            <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.14)' }}>
              <span className="block h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
            </div>
          </div>
        ))}

        <div className="mt-5 pt-4.5 border-t border-white/15" style={{ paddingTop: 18, marginTop: 20 }}>
          <small className="block text-[11px] uppercase tracking-wide text-[#a9bbe6] mb-2">Top gap opportunity</small>
          <p className="m-0 text-[14px] leading-snug text-white">“Best helpdesk for SaaS startups” — Zendesk cited, you're not.</p>
        </div>
      </div>

      <div
        className="absolute bg-white rounded-[20px] p-5"
        style={{ left: -32, bottom: -10, width: 296, boxShadow: '0 26px 65px rgba(2,13,46,0.28)', transform: 'rotate(-2.2deg)' }}
      >
        <div className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-3">PEACH LIVE AUDIT</div>
        <div className="grid gap-1.5">
          {[
            'reading homepage',
            'category: customer support',
            'running buyer-intent prompts',
            'checking AI answers',
          ].map(line => (
            <div key={line} className="flex items-center gap-2 text-xs text-[#3d485f]" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
              <ScanCheck />{line}
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs text-[#3d485f]" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            <ScanCheck color="#f4aa16" />6 visibility gaps found
          </div>
        </div>
        <span className="inline-flex items-center gap-1 mt-3.5 px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
          3 actions ready →
        </span>
      </div>
    </div>
  )
}

const BENEFITS = [
  { n: '01', title: 'See where you show up', body: 'Track your brand across leading AI platforms and buyer-intent prompts.' },
  { n: '02', title: 'See who gets cited instead', body: 'Find the competitors AI recommends when your brand is missing.' },
  { n: '03', title: 'Get a plan to improve', body: 'Turn visibility gaps into concrete content and optimization actions.' },
]

const CHECKLIST = [
  'Visibility score by AI platform and prompt',
  'Competitors cited when your brand is missed',
  'Actual LLM answer text as evidence',
  'Specific actions and article ideas',
]

export default function HomeV2() {
  useEffect(() => { document.title = 'Peach — AI Visibility Checker for Your Brand' }, [])

  return (
    <div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white px-6"
        style={{
          background:
            'radial-gradient(circle at 90% 5%, rgba(110,150,255,0.32), transparent 32%), linear-gradient(120deg, #061d54 0%, #0c2f83 52%, #315dce 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-[1.05fr_0.95fr] gap-16 items-center" style={{ paddingTop: 48, paddingBottom: 64 }}>
          <div>
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[15px] text-blue-50">
              <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 0 7px rgba(52,211,153,0.12)' }} />
              AI Visibility
            </span>

            <h1 className="mt-8 tracking-tight font-semibold" style={{ fontSize: 'clamp(38px, 4.8vw, 60px)', lineHeight: 1.06, letterSpacing: '-0.03em' }}>
              Are your buyers finding you in <DynamicWord />?
            </h1>

            <p className="mt-6 max-w-lg text-blue-100" style={{ fontSize: 'clamp(17px, 1.4vw, 19px)', lineHeight: 1.6 }}>
              See where your brand appears across AI answers and LLMs, find out which competitors get cited instead, and get a clear plan to improve your AI visibility.
            </p>

            <div className="mt-9 max-w-lg">
              <Checker />
            </div>

            <p className="mt-4 text-sm text-blue-200">Free run · Results in about 40 seconds</p>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="px-6" style={{ paddingTop: 95, paddingBottom: 95, background: 'linear-gradient(180deg, #f7faff, #edf4ff)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">From visibility to action</p>
          <h2 className="mt-3 mb-4 font-semibold tracking-tight text-blue-950" style={{ fontSize: 'clamp(32px, 3.6vw, 44px)', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
            Don't just see the gap. Know what to do next.
          </h2>
          <p className="max-w-xl text-[17px] leading-relaxed text-neutral-500">
            Peach connects your AI visibility to the evidence behind it and gives you a clear plan for improving where your brand gets mentioned and cited.
          </p>

          <div className="mt-11 grid md:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.n} className="p-8 rounded-[22px] border border-blue-100 bg-white shadow-[0_12px_34px_rgba(27,62,130,0.06)]">
                <h3 className="mb-3 text-xl font-semibold tracking-tight text-black">{b.title}</h3>
                <p className="text-[15px] leading-relaxed text-neutral-500">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Actual AI answers ────────────────────────────────────────────── */}
      <section className="px-6" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-[0.75fr_1.25fr] gap-16 items-center">

          <div>
            <h2 className="mb-6 font-semibold tracking-tight text-blue-950" style={{ fontSize: 'clamp(30px, 3.6vw, 42px)', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
              See what the AI actually said.
            </h2>
            <p className="text-[16px] leading-relaxed text-neutral-500">
              A score is useful only when you can explain it. Peach keeps the answer text, competitor evidence and recommended actions together.
            </p>

            <div className="mt-7 space-y-3.5">
              {CHECKLIST.map(item => (
                <div key={item} className="flex items-center gap-3 text-[15px] text-neutral-700">
                  <CheckIcon />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Report mockup */}
          <div className="p-6 rounded-[24px] border border-blue-100 bg-white shadow-[0_20px_50px_rgba(15,35,90,0.08)]">
            <div className="flex flex-wrap gap-2 mb-5">
              {['Answers', 'Competitors', 'Citations', 'Actions'].map((t, i) => (
                <span key={t} className={`px-3 py-2 rounded-full text-[13px] font-medium border ${i === 0 ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-blue-100 text-neutral-500'}`}>
                  {t}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              <div className="p-5 rounded-[16px] border border-blue-100 bg-white">
                <div className="flex items-center justify-between gap-2.5">
                  <strong className="text-[15px] font-semibold text-black">Best customer support software for startups?</strong>
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">ChatGPT</span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-neutral-500">
                  For startups that need a simple shared inbox, <span className="px-1 rounded bg-blue-100 text-blue-800 font-medium">Zendesk</span> and Freshdesk are common options…
                </p>
              </div>

              <div className="p-5 rounded-[16px] border border-blue-100 bg-white">
                <div className="flex items-center justify-between gap-2.5">
                  <strong className="text-[15px] font-semibold text-black">Top alternatives to Zendesk?</strong>
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">Gemini</span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-neutral-500">
                  Common alternatives include Freshdesk, Intercom, Help Scout and HubSpot Service Hub…
                </p>
              </div>

              <div className="p-5 rounded-[16px] text-white" style={{ background: 'linear-gradient(145deg, #08245f, #1949c6)' }}>
                <small className="block text-[11px] uppercase tracking-wide text-blue-200 mb-2">Peach action plan</small>
                <strong className="text-[15px] font-semibold">Create a "Zendesk alternatives for SaaS teams" page</strong>
                <p className="mt-2 text-sm leading-relaxed text-blue-100">
                  This buying intent appears repeatedly in prompts where your brand is currently absent.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="px-6" style={{ paddingTop: 90, paddingBottom: 90 }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center text-white rounded-[30px] px-6 sm:px-12"
            style={{
              paddingTop: 65,
              paddingBottom: 65,
              background:
                'radial-gradient(circle at 10% 20%, rgba(122,160,255,0.2), transparent 35%), linear-gradient(120deg, #08275f, #1949c6 70%, #315ed2)',
            }}
          >
            <h2 className="max-w-xl mx-auto mb-3.5 font-semibold tracking-tight text-white" style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Find out where your brand disappears from AI search.
            </h2>
            <p className="mb-7 text-blue-100">Run a free visibility check and get a clear plan for what to improve.</p>
            <Checker />
          </div>
        </div>
      </section>

    </div>
  )
}
