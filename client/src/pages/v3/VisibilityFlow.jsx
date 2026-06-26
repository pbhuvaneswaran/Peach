import { useState } from 'react'

const LLM_COLORS = {
  chatgpt: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-400', label: 'ChatGPT' },
  gemini:  { bg: 'bg-blue-100',  text: 'text-blue-700',  dot: 'bg-blue-400',  label: 'Gemini' },
}

const EXAMPLES = [
  { label: 'yoursite.com', value: 'yoursite.com' },
  { label: '"best helpdesk software"', value: 'best helpdesk software' },
  { label: '"CRM for B2B teams"', value: 'CRM for B2B teams' },
]

function LLMChip({ llm, selected, onClick }) {
  const c = LLM_COLORS[llm]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
        selected ? `${c.bg} ${c.text} border-current` : 'bg-white text-gray-400 border-gray-200'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${selected ? c.dot : 'bg-gray-300'}`} />
      {c.label}
    </button>
  )
}

function ScoreBar({ brand, pct, highlight }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-semibold w-32 truncate ${highlight ? 'text-indigo-700' : 'text-gray-600'}`}>{brand}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${highlight ? 'bg-indigo-500' : 'bg-gray-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-sm font-bold w-10 text-right ${highlight ? 'text-indigo-700' : 'text-gray-500'}`}>{pct}%</span>
    </div>
  )
}

function MentionCell({ mentioned }) {
  return mentioned
    ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">✓</span>
    : <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-400 text-xs">✗</span>
}

function PromptRow({ promptData, brand, competitors, llmsQueried }) {
  const [expanded, setExpanded] = useState(false)
  const allBrands = [brand, ...competitors]

  const brandMentioned = (b) =>
    llmsQueried.some(llm =>
      promptData.perLLM?.[llm]?.find(r => r.question === promptData.prompt)?.mentions?.[b]
    )

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex-1 text-sm text-gray-700 font-medium">{promptData.prompt}</span>
          <div className="flex items-center gap-3 flex-shrink-0">
            {allBrands.map(b => (
              <div key={b} className="flex flex-col items-center gap-0.5">
                <MentionCell mentioned={brandMentioned(b)} />
                <span className="text-[10px] text-gray-400 max-w-[52px] truncate">{b}</span>
              </div>
            ))}
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
          {llmsQueried.map(llm => {
            const c = LLM_COLORS[llm]
            const entry = promptData.perLLM?.[llm]?.find(r => r.question === promptData.prompt)
            if (!entry) return null
            return (
              <div key={llm}>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${c.bg} ${c.text} text-xs font-semibold mb-2`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  {c.label}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed bg-white border border-gray-100 rounded-lg px-3 py-2">{entry.answer || '—'}</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {allBrands.map(b => (
                    <span key={b} className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.mentions?.[b] ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {b} {entry.mentions?.[b] ? '✓' : '✗'}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ActionCard({ action, index }) {
  const priorityColor = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-gray-100 text-gray-600' }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <h3 className="text-sm font-bold text-gray-900">{action.gap}</h3>
        </div>
        {action.priority && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColor[action.priority] || priorityColor.low}`}>
            {action.priority} priority
          </span>
        )}
      </div>
      <p className="text-sm text-gray-800 font-medium mb-3">{action.action}</p>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-3">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Why this works</p>
        <p className="text-sm text-gray-700 leading-relaxed">{action.why}</p>
      </div>
      {action.format && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Best format:</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{action.format}</span>
        </div>
      )}
    </div>
  )
}

function BlogAnalysis({ blogGaps, pageData }) {
  if (!pageData) return null
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-0.5">Blog Analysis</h2>
          <p className="text-xs text-gray-400 truncate max-w-xs">{pageData.url}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-600">{(blogGaps || []).length}</div>
          <div className="text-xs text-gray-400">topics missing</div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Your page ({pageData.wordCount?.toLocaleString()} words) is missing <strong>{(blogGaps || []).length} topics</strong> that AI engines cite when recommending competitors.
      </p>
      <div className="space-y-2">
        {(blogGaps || []).map((gap, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">✗</span>
            <div>
              <span className="text-sm font-semibold text-gray-700">{gap.topic}</span>
              <span className="text-sm text-gray-500"> — {gap.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PromptTable({ prompts, llmsQueried, visibility, brand, competitors }) {
  const allBrands = [brand, ...competitors]
  const promptTable = prompts.map(prompt => ({
    prompt,
    perLLM: Object.fromEntries(
      (llmsQueried || []).map(llm => [llm, visibility?.perLLM?.[llm]?.details || []])
    ),
  }))

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Prompt-by-Prompt Breakdown</h2>
        <p className="text-xs text-gray-400">Click any row to see AI answers</p>
      </div>
      <div className="flex items-center gap-3 px-4 mb-2">
        <span className="flex-1 text-xs font-bold text-gray-400 uppercase tracking-wide">Prompt</span>
        <div className="flex gap-3 flex-shrink-0">
          {allBrands.map(b => (
            <span key={b} className={`text-[10px] font-bold uppercase tracking-wide w-6 text-center ${b === brand ? 'text-indigo-600' : 'text-gray-400'}`}>
              {b.slice(0, 5)}
            </span>
          ))}
          <span className="w-4" />
        </div>
      </div>
      <div className="space-y-1.5">
        {promptTable.map((pd, i) => (
          <PromptRow key={i} promptData={pd} brand={brand} competitors={competitors} llmsQueried={llmsQueried} />
        ))}
      </div>
    </div>
  )
}

function UrlModeResult({ result, onReset }) {
  const allBrands = [result.brand, ...result.competitors]
  const agg = result.visibility?.aggregatePercentages || {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Visibility Report</h1>
          <p className="text-sm text-gray-500">
            {result.brand} vs {result.competitors.join(', ')} · {result.prompts.length} prompts · {result.llmsQueried.join(', ')}
          </p>
        </div>
        <button onClick={onReset} className="text-sm text-indigo-600 hover:underline">← New report</button>
      </div>

      {/* Scores */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Overall AI Visibility</h2>
        <div className="space-y-3">
          {allBrands.map(b => (
            <ScoreBar key={b} brand={b} pct={agg[b] ?? 0} highlight={b === result.brand} />
          ))}
        </div>
        {result.llmsQueried.length > 1 && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Per AI Engine</p>
            <div className="grid grid-cols-3 gap-3">
              {result.llmsQueried.map(llm => {
                const c = LLM_COLORS[llm]
                const pcts = result.visibility?.perLLM?.[llm]?.percentages || {}
                return (
                  <div key={llm} className={`${c.bg} rounded-xl p-3`}>
                    <p className={`text-xs font-bold ${c.text} mb-2`}>{c.label}</p>
                    {allBrands.map(b => (
                      <div key={b} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 truncate max-w-[70px]">{b}</span>
                        <span className={`font-bold ${b === result.brand ? c.text : 'text-gray-500'}`}>{pcts[b] ?? 0}%</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <PromptTable
        prompts={result.prompts}
        llmsQueried={result.llmsQueried}
        visibility={result.visibility}
        brand={result.brand}
        competitors={result.competitors}
      />

      <BlogAnalysis blogGaps={result.blogGaps} pageData={result.pageData} />

      {result.actions?.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">What to Do</h2>
          <p className="text-sm text-gray-500 mb-4">
            {result.actions.length} actions to improve your AI visibility — with evidence from actual AI answers
          </p>
          <div className="space-y-4">
            {result.actions.map((action, i) => (
              <ActionCard key={i} action={action} index={i} />
            ))}
          </div>
        </div>
      )}

      {!result.pageData && result.visibility?.gaps?.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Visibility Gaps</h2>
          <p className="text-sm text-gray-500 mb-4">Prompts where competitors appear but you don't</p>
          <div className="space-y-3">
            {result.visibility.gaps.map((gap, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-800 mb-1">"{gap.question}"</p>
                <p className="text-xs text-gray-500">AI cites instead: <span className="font-medium text-gray-700">{gap.competitorsSeen.join(', ')}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KeywordModeResult({ result, onReset }) {
  const allBrands = [result.brand, ...result.competitors]
  const rankings = result.brandRankings || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Search Landscape</h1>
          <p className="text-sm text-gray-500">
            "{result.keyword}" · {result.prompts.length} queries · {result.llmsQueried.join(', ')}
          </p>
        </div>
        <button onClick={onReset} className="text-sm text-indigo-600 hover:underline">← New report</button>
      </div>

      {/* Brand rankings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">Who dominates AI search for this topic</h2>
        <p className="text-sm text-gray-500 mb-5">Brands cited most across {result.llmsQueried.join(', ')} for your queries</p>
        <div className="space-y-3">
          {rankings.map((r, i) => (
            <ScoreBar key={r.brand} brand={r.brand} pct={r.pct} highlight={i === 0} />
          ))}
        </div>
      </div>

      <PromptTable
        prompts={result.prompts}
        llmsQueried={result.llmsQueried}
        visibility={result.visibility}
        brand={result.brand}
        competitors={result.competitors}
      />

      {/* CTA */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
        <h3 className="text-base font-bold text-gray-900 mb-1">Track YOUR brand against these competitors</h3>
        <p className="text-sm text-gray-500 mb-4">Enter your website URL to see how you rank — and get a content action plan.</p>
        <button
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Check my website →
        </button>
      </div>
    </div>
  )
}

export default function V3VisibilityFlow() {
  const [input, setInput] = useState('')
  const [selectedLLMs, setSelectedLLMs] = useState(['chatgpt', 'gemini'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const toggleLLM = (llm) =>
    setSelectedLLMs(prev => prev.includes(llm) ? prev.filter(l => l !== llm) : [...prev, llm])

  const handleRun = async () => {
    setError('')
    const val = input.trim()
    if (!val) return setError('Enter a website URL or keyword to check.')
    if (selectedLLMs.length === 0) return setError('Select at least one AI engine.')

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/v3/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: val, llms: selectedLLMs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
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
          {result.mode === 'url'
            ? <UrlModeResult result={result} onReset={() => setResult(null)} />
            : <KeywordModeResult result={result} onReset={() => setResult(null)} />
          }
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-800 font-semibold mb-1">Analyzing across {selectedLLMs.length} AI engines…</p>
          <p className="text-sm text-gray-400">Generating prompts, querying LLMs, extracting insights — takes 30–60s</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Free AI Search Visibility Checker</h1>
          <p className="text-gray-500 text-base">
            Check how your brand or topic ranks across Claude, ChatGPT, and Gemini.
            <br />No sign-up required.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {/* Main input */}
          <div className="flex gap-3 mb-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRun()}
              placeholder='yoursite.com  or  "best helpdesk software"'
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoFocus
            />
            <button
              onClick={handleRun}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              Check Visibility
            </button>
          </div>

          {/* Example chips */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <span className="text-xs text-gray-400">Try:</span>
            {EXAMPLES.map(ex => (
              <button
                key={ex.value}
                onClick={() => setInput(ex.value)}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* LLM selection */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Query with</p>
            <div className="flex gap-2">
              {['chatgpt', 'gemini'].map(llm => (
                <LLMChip key={llm} llm={llm} selected={selectedLLMs.includes(llm)} onClick={() => toggleLLM(llm)} />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          URL mode: crawls your page, auto-generates prompts, scores vs competitors, gives a content action plan.<br />
          Keyword mode: shows which brands dominate AI search for that topic.
        </p>
      </div>
    </div>
  )
}
