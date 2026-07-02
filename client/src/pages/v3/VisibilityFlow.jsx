import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LLM_COLORS } from '../../components/llmConfig'
import { PromptTable, ActionCard, CrawlerCheck } from '../../components/VisibilityComponents'

const EXAMPLES = [
  { label: 'copilotverse.io', value: 'copilotverse.io' },
  { label: 'freshdesk.com', value: 'freshdesk.com' },
  { label: 'intercom.com', value: 'intercom.com' },
]

const OUTPUT_TABS = ['Overview', 'AI Answers', 'Site Audit', "Let's get you cited in LLMs"]

const TIPS = [
  { icon: '📊', text: '40% of consumers now use AI tools to discover businesses before visiting a website.' },
  { icon: '🔗', text: 'AI tools cite Reddit, Wikipedia, and brand pages most frequently in their answers.' },
  { icon: '💡', text: '85% of AI brand mentions come from third-party sources — not the brand\'s own site.' },
  { icon: '📝', text: 'Brands with dedicated FAQ pages are 3× more likely to appear in AI answers.' },
  { icon: '🌍', text: 'AI search results vary by region — the same brand may rank differently in India vs the US.' },
  { icon: '🕐', text: 'Publishing new content today can appear in live-web AI answers within hours.' },
]

const STEPS = [
  { label: 'Fetching your page',        detail: 'Reading content, headings, and page structure',                   ms: 2500 },
  { label: 'Identifying your niche',    detail: 'Finding which category you\'re in and who your real competitors are', ms: 5000 },
  { label: 'Generating buyer queries',  detail: 'Creating the exact questions your customers type into AI',         ms: 3000 },
  { label: 'Asking ChatGPT',           detail: 'Querying 3 buyer prompts — seeing if you appear',                  ms: 8000 },
  { label: 'Asking Gemini',            detail: 'Querying 3 buyer prompts — comparing results',                     ms: 8000 },
  { label: 'Scoring your visibility',   detail: 'Counting how often you and competitors appear in answers',         ms: 2000 },
  { label: 'Building your action plan', detail: 'Generating specific content recommendations based on the gaps',    ms: 5000 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractSnippet(answer, keyword, maxLen = 220) {
  if (!answer) return ''
  if (!keyword) return answer.slice(0, maxLen) + (answer.length > maxLen ? '…' : '')
  const lower = answer.toLowerCase()
  const idx = lower.indexOf(keyword.toLowerCase())
  if (idx === -1) return answer.slice(0, maxLen) + (answer.length > maxLen ? '…' : '')
  const start = Math.max(0, idx - 80)
  const end = Math.min(answer.length, start + maxLen)
  const snippet = answer.slice(start, end).trim()
  return (start > 0 ? '…' : '') + snippet + (end < answer.length ? '…' : '')
}

function getCompetitorEvidence(visibility, competitor) {
  const results = []
  for (const [llm, llmData] of Object.entries(visibility?.perLLM || {})) {
    for (const entry of (llmData.details || [])) {
      if (entry.mentions?.[competitor] && entry.answer) {
        results.push({ llm, question: entry.question, snippet: extractSnippet(entry.answer, competitor) })
      }
    }
  }
  return results
}

function extractTopDomains(visibility) {
  const domainRegex = /\b([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:com|io|ai|co|org|net|app|dev))\b/g
  const counts = {}
  for (const llmData of Object.values(visibility?.perLLM || {})) {
    for (const { answer } of llmData.details || []) {
      if (!answer) continue
      for (const m of answer.matchAll(domainRegex)) {
        const d = m[1].toLowerCase()
        if (d.split('.').length < 2) continue
        counts[d] = (counts[d] || 0) + 1
      }
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
}

// ─── Analysis Progress ────────────────────────────────────────────────────────

function AnalysisProgress({ input }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)
  const [tipVisible, setTipVisible] = useState(true)

  useEffect(() => {
    let step = 0
    const advance = () => {
      step += 1
      if (step < STEPS.length) {
        setCurrentStep(step)
        setTimeout(advance, STEPS[step].ms)
      }
    }
    const t = setTimeout(advance, STEPS[0].ms)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTipVisible(false)
      setTimeout(() => {
        setTipIndex(i => (i + 1) % TIPS.length)
        setTipVisible(true)
      }, 400)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const domain = input.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
  const tip = TIPS[tipIndex]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Analysing</p>
          <h2 className="text-xl font-bold text-gray-900">{domain || 'your website'}</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 mb-4">
          {STEPS.map((step, i) => {
            const done = i < currentStep
            const active = i === currentStep
            return (
              <div key={i} className={`flex items-start gap-3 transition-opacity duration-300 ${i > currentStep + 1 ? 'opacity-25' : 'opacity-100'}`}>
                <div className="flex-shrink-0 mt-0.5">
                  {done ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : active ? (
                    <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${done ? 'text-gray-300 line-through' : active ? 'text-gray-900' : 'text-gray-300'}`}>
                    {step.label}
                  </p>
                  {active && <p className="text-xs text-gray-400 mt-0.5">{step.detail}</p>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Did You Know card */}
        <div className={`rounded-2xl p-5 border border-indigo-100 transition-opacity duration-500 ${tipVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)' }}>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Did you know?</p>
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none mt-0.5">{tip.icon}</span>
            <p className="text-sm font-medium text-gray-700 leading-relaxed">{tip.text}</p>
          </div>
          <div className="flex gap-1.5 justify-center mt-4">
            {TIPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === tipIndex ? 'w-4 bg-indigo-500' : 'w-1.5 bg-gray-300'}`} />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">Takes about 20–35 seconds — real API calls, real data</p>
      </div>
    </div>
  )
}

// ─── Tab 1: Overview components ───────────────────────────────────────────────

function OverviewTab({ result }) {
  const agg = result.visibility?.aggregatePercentages || {}
  const brand = result.brand
  const gaps = result.visibility?.gaps || []
  const totalPrompts = result.prompts?.length || 0
  const allZero = Object.values(agg).every(p => p === 0)
  const brandPct = agg[brand] ?? 0

  const topCompetitor = Object.entries(agg)
    .filter(([b]) => b !== brand && agg[b] > 0)
    .sort((a, b) => b[1] - a[1])[0]

  // Stat cards
  const StatCard = ({ label, value, sub, accent }) => (
    <div className={`rounded-2xl p-5 border ${accent ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-200'}`}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-indigo-700' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )

  // WhyNotRanking
  const promptsWithAnswers = (result.prompts || []).map(prompt => {
    const answers = {}
    for (const [llm, llmData] of Object.entries(result.visibility?.perLLM || {})) {
      const entry = (llmData.details || []).find(d => d.question === prompt)
      if (entry?.answer) answers[llm] = entry.answer
    }
    return { prompt, answers }
  })

  // WhyCompetitorsRank
  const topCompetitors = Object.entries(agg)
    .filter(([b]) => b !== brand && agg[b] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Missed prompts"
          value={`${allZero ? totalPrompts : gaps.length} / ${totalPrompts}`}
          sub="where you're absent"
        />
        <StatCard
          label="Top competitor"
          value={topCompetitor ? topCompetitor[0] : 'None cited'}
          sub={topCompetitor ? `${topCompetitor[1]}% mentions` : 'No competitors cited yet'}
          accent={!!topCompetitor}
        />
      </div>

      {/* Where AI doesn't mention you */}
      {brandPct > 0 && gaps.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center mb-6">
          <p className="text-emerald-700 font-semibold">You were cited across all tested queries — great AI visibility!</p>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Where AI doesn't mention you — and what it says instead</h2>
          <p className="text-sm text-gray-500 mb-4">
            {allZero
              ? `${brand} wasn't mentioned in any of these ${totalPrompts} queries. Here's exactly what AI said instead.`
              : `${gaps.length} prompt${gaps.length > 1 ? 's' : ''} where AI cited competitors but not you`}
          </p>
          <div className="space-y-4">
            {(allZero ? promptsWithAnswers : gaps.map(gap => {
              let snippet = '', snippetLLM = ''
              const firstComp = gap.competitorsSeen?.[0]
              for (const [llm, llmData] of Object.entries(result.visibility?.perLLM || {})) {
                const entry = (llmData.details || []).find(d => d.question === gap.question)
                if (entry?.answer) { snippet = extractSnippet(entry.answer, firstComp, 240); snippetLLM = llm; break }
              }
              return { prompt: gap.question, competitorsSeen: gap.competitorsSeen, snippet, snippetLLM, isGap: true }
            })).map((item, i) => (
              <div key={i} className="bg-white border border-orange-100 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 bg-orange-50 border-b border-orange-100">
                  <span className="text-orange-500">🔴</span>
                  <p className="text-sm font-semibold text-gray-800">"{item.prompt}"</p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {item.isGap ? (
                    <>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        You were not cited — {LLM_COLORS[item.snippetLLM]?.label || 'AI'} said instead:
                      </p>
                      {item.snippet && (
                        <blockquote className="text-sm text-gray-700 bg-gray-50 border-l-4 border-orange-300 pl-4 pr-3 py-2 rounded-r-lg italic leading-relaxed">
                          "{item.snippet}"
                        </blockquote>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-400">Cited instead:</span>
                        {(item.competitorsSeen || []).map(c => (
                          <span key={c} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">{c}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    Object.entries(item.answers || {}).map(([llm, answer]) => {
                      const c = LLM_COLORS[llm]
                      return (
                        <div key={llm}>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text} mb-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{c.label}
                          </span>
                          <blockquote className="text-sm text-gray-700 bg-gray-50 border-l-4 border-gray-200 pl-4 pr-3 py-2 rounded-r-lg leading-relaxed">
                            {extractSnippet(answer, '', 280) || answer.slice(0, 280)}
                          </blockquote>
                        </div>
                      )
                    })
                  )}
                  {!item.isGap && <p className="text-xs text-red-500 font-medium">{brand} was not mentioned in any of these answers.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why competitors rank */}
      {topCompetitors.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">What AI says about your competitors</h2>
          <p className="text-sm text-gray-500 mb-4">The language patterns that get them cited</p>
          <div className="space-y-4">
            {topCompetitors.map(comp => {
              const evidence = getCompetitorEvidence(result.visibility, comp)
              if (evidence.length === 0) return null
              const best = evidence[0]
              return (
                <div key={comp} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                        {comp.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{comp}</p>
                        <p className="text-xs text-gray-400">cited in {evidence.length}/{result.prompts?.length} prompts · {agg[comp]}%</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-500">{agg[comp]}%</span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                    Why AI cites them — {LLM_COLORS[best.llm]?.label || 'AI'} says:
                  </p>
                  <blockquote className="text-sm text-gray-700 bg-blue-50 border-l-4 border-blue-300 pl-4 pr-3 py-2 rounded-r-lg italic leading-relaxed">
                    "{best.snippet}"
                  </blockquote>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab 2: AI Answers + Competitor Radar ─────────────────────────────────────

function CompetitorThreatRadar({ result }) {
  const agg = result.visibility?.aggregatePercentages || {}
  const brand = result.brand
  const competitors = result.competitors || []
  const maxPct = Math.max(...Object.values(agg).filter(v => v > 0), 1)

  const compData = competitors
    .map(c => ({ name: c, pct: agg[c] || 0 }))
    .sort((a, b) => b.pct - a.pct)

  // Place up to 4 competitors around center
  const angles = [270, 0, 90, 180] // top, right, bottom, left
  const radius = 100

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
      <h2 className="text-base font-bold text-gray-900 mb-0.5">Competitor Threat Radar</h2>
      <p className="text-xs text-gray-400 mb-6">Circle size = frequency in AI answers ({result.prompts?.length} queries)</p>
      <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
        {/* Concentric rings */}
        {[90, 65, 40].map(r => (
          <div key={r} className="absolute border border-gray-100 rounded-full"
            style={{ width: r * 2, height: r * 2, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        ))}

        {/* User's brand in center */}
        <div className="absolute flex flex-col items-center gap-1"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold text-center leading-tight px-1">
            {brand.length > 8 ? brand.slice(0, 7) + '…' : brand}
          </div>
        </div>

        {/* Competitors */}
        {compData.slice(0, 4).map((comp, i) => {
          const angleDeg = angles[i]
          const rad = (angleDeg * Math.PI) / 180
          const x = 140 + Math.cos(rad) * radius
          const y = 140 + Math.sin(rad) * radius
          const size = Math.max(36, Math.min(64, 36 + (comp.pct / maxPct) * 28))
          const color = comp.pct > 50 ? 'bg-red-400' : comp.pct > 20 ? 'bg-orange-400' : 'bg-gray-400'

          return (
            <div key={comp.name} className="absolute flex flex-col items-center gap-1"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 5 }}>
              <div className={`rounded-full flex items-center justify-center text-white text-[10px] font-bold ${color}`}
                style={{ width: size, height: size }}>
                {comp.pct > 0 ? `${comp.pct}%` : '—'}
              </div>
              <span className="text-[9px] text-gray-500 font-medium whitespace-nowrap leading-none">
                {comp.name.length > 10 ? comp.name.slice(0, 9) + '…' : comp.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AIAnswersTab({ result }) {
  return (
    <div>
      <PromptTable
        prompts={result.prompts}
        llmsQueried={result.llmsQueried}
        visibility={result.visibility}
        brand={result.brand}
        competitors={result.competitors}
      />
      <CompetitorThreatRadar result={result} />
    </div>
  )
}

// ─── Tab 3: Site Audit ────────────────────────────────────────────────────────

function AICrawlerPreview({ pageData }) {
  if (!pageData?.crawlerText) return null
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">AI Crawler Preview</h2>
          <p className="text-xs text-gray-400 mt-0.5">What AI crawlers read from your homepage</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{pageData.wordCount?.toLocaleString()}</p>
          <p className="text-xs text-gray-400">words indexed</p>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 font-mono text-[11px] text-gray-600 leading-relaxed max-h-44 overflow-y-auto">
        {pageData.crawlerText}
      </div>
      <p className="text-xs text-gray-400 mt-2">{pageData.url}</p>
    </div>
  )
}

function TopCitedWebsites({ visibility }) {
  const domains = extractTopDomains(visibility)
  if (domains.length === 0) return null
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-bold text-gray-900 mb-0.5">Top Cited Websites</h2>
      <p className="text-xs text-gray-400 mb-4">Domains AI mentioned most when answering buyer queries</p>
      <div className="space-y-2.5">
        {domains.map(([domain, count], i) => (
          <div key={domain} className="flex items-center gap-3">
            <span className="text-xs text-gray-300 w-4 text-right">{i + 1}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${(count / domains[0][1]) * 100}%` }} />
            </div>
            <span className="text-sm font-medium text-gray-700 w-40 truncate">{domain}</span>
            <span className="text-xs font-bold text-gray-400">{count}×</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SiteAuditTab({ result }) {
  return (
    <div>
      <AICrawlerPreview pageData={result.pageData} />
      {result.crawlerStatus && (
        <div className="mb-6">
          <CrawlerCheck crawlerStatus={result.crawlerStatus} />
        </div>
      )}
      <TopCitedWebsites visibility={result.visibility} />
    </div>
  )
}

// ─── Tab 4: Let's get you cited in LLMs ──────────────────────────────────────

function GapOpportunities({ result }) {
  const gaps = result.visibility?.gaps || []
  const brandPct = result.visibility?.aggregatePercentages?.[result.brand] ?? 0
  const allZero = Object.values(result.visibility?.aggregatePercentages || {}).every(p => p === 0)

  const items = gaps.length > 0
    ? gaps.map(g => ({ query: g.question, competitors: g.competitorsSeen }))
    : (allZero ? result.prompts.map(p => ({ query: p, competitors: result.competitors })) : [])

  if (items.length === 0 && brandPct > 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-6 text-center">
        <p className="text-emerald-700 font-semibold">No gaps — you're appearing across all tested queries!</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-900 mb-1">Gap Opportunities</h2>
      <p className="text-sm text-gray-500 mb-4">Queries where competitors appear but you don't — your biggest content opportunities</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 mb-2">{item.query}</p>
              <div className="flex gap-1.5 flex-wrap">
                {(item.competitors || []).map(c => (
                  <span key={c} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">{c}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionPlanSection({ result }) {
  const actions = result.actions || []
  const gaps = result.visibility?.gaps || []
  const brandPct = result.visibility?.aggregatePercentages?.[result.brand] ?? 0

  if (actions.length > 0) {
    return (
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-1">What to create</h2>
        <p className="text-sm text-gray-500 mb-4">Specific content recommendations backed by evidence from actual AI answers</p>
        <div className="space-y-4">
          {actions.map((action, i) => <ActionCard key={i} action={action} index={i} />)}
        </div>
      </div>
    )
  }

  if (brandPct === 0 && result.prompts?.length > 0) {
    return (
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-1">Where to start</h2>
        <p className="text-sm text-gray-500 mb-4">
          AI engines don't mention {result.brand} yet. Create dedicated content answering each of these queries — this is how you get cited.
        </p>
        <div className="space-y-3">
          {result.prompts.map((prompt, i) => (
            <div key={i} className="bg-white border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Create a dedicated page answering: "{prompt}"</p>
                <p className="text-xs text-gray-500 mt-1">Use the AI answers in the AI Answers tab to see what topics AI currently associates with this search — then write content that matches and adds your unique angle.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

function CitedTab({ result }) {
  return (
    <div>
      <GapOpportunities result={result} />
      <ActionPlanSection result={result} />
    </div>
  )
}

// ─── URL Mode Result (4 tabs) ─────────────────────────────────────────────────

function UrlModeResult({ result, onReset }) {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Visibility Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            {result.brand} · {result.prompts.length} queries · {result.llmsQueried.map(l => LLM_COLORS[l]?.label || l).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">Dashboard →</Link>
          <button onClick={onReset} className="text-sm text-indigo-600 hover:underline">← New report</button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {OUTPUT_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && <OverviewTab result={result} />}
      {activeTab === 'AI Answers' && <AIAnswersTab result={result} />}
      {activeTab === 'Site Audit' && <SiteAuditTab result={result} />}
      {activeTab === "Let's get you cited in LLMs" && <CitedTab result={result} />}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function V3VisibilityFlow() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(() => {
    try { return JSON.parse(localStorage.getItem('peach_last_result')) || null }
    catch { return null }
  })

  const handleReset = () => {
    localStorage.removeItem('peach_last_result')
    setResult(null)
  }

  const handleRun = async () => {
    setError('')
    const val = input.trim()
    if (!val) return setError('Enter your website URL.')

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/v3/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: val, llms: ['chatgpt', 'gemini'] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      localStorage.setItem('peach_last_result', JSON.stringify(data))
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <UrlModeResult result={result} onReset={handleReset} />
        </div>
      </div>
    )
  }

  if (loading) {
    return <AnalysisProgress input={input} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Find out why AI<br />doesn't mention you
          </h1>
          <p className="text-gray-400 text-base">
            Enter your website — we crawl it, generate buyer queries, check ChatGPT + Gemini,<br />
            and show you exactly why competitors rank instead of you.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex gap-3 mb-4">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRun()}
              placeholder='yourwebsite.com'
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoFocus
            />
            <button
              onClick={handleRun}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              Analyse →
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Try:</span>
            {EXAMPLES.map(ex => (
              <button key={ex.value} onClick={() => setInput(ex.value)}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
                {ex.label}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  )
}
