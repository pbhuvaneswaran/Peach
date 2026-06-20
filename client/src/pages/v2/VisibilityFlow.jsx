import { useState } from 'react'

const LLM_LABELS = { claude: 'Claude', chatgpt: 'ChatGPT', gemini: 'Gemini' }
const LLM_COLORS = { claude: 'bg-orange-500', chatgpt: 'bg-green-500', gemini: 'bg-blue-500' }

function ScoreBar({ brand, percentage, isUser, color = 'bg-indigo-500' }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${isUser ? 'text-indigo-700' : 'text-gray-600'}`}>
          {brand}
          {isUser && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">You</span>}
        </span>
        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all duration-700 ${isUser ? 'bg-indigo-500' : 'bg-gray-300'}`}
          style={{ width: `${Math.max(percentage, 2)}%` }} />
      </div>
    </div>
  )
}

function LLMTab({ llm, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {LLM_LABELS[llm] || llm}
    </button>
  )
}

function GapCard({ gap, rec, index }) {
  return (
    <div className="bg-white border border-orange-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-orange-700 text-xs font-bold">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 mb-1">"{gap.question}"</p>
          {gap.competitorsSeen?.length > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              AI cites instead: <span className="font-medium text-gray-700">{gap.competitorsSeen.join(', ')}</span>
            </p>
          )}
          {rec?.recommendation && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-indigo-700 mb-1">Action</p>
              <p className="text-sm text-indigo-900 leading-relaxed">{rec.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VisibilityFlowV2({ onBack }) {
  const [form, setForm] = useState({ brand: '', c1: '', c2: '', c3: '', category: '' })
  const [selectedLLMs, setSelectedLLMs] = useState(['claude', 'chatgpt', 'gemini'])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('aggregate')

  const toggleLLM = (llm) => {
    setSelectedLLMs(prev =>
      prev.includes(llm) ? prev.filter(l => l !== llm) : [...prev, llm]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const competitors = [form.c1, form.c2, form.c3].filter(Boolean)
    if (!competitors.length) { setError('Add at least one competitor.'); return }
    if (!selectedLLMs.length) { setError('Select at least one AI to query.'); return }
    setError(''); setResult(null); setLoading(true)
    try {
      const res = await fetch('/api/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: form.brand, competitors, category: form.category, llms: selectedLLMs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setResult(data)
      setActiveTab('aggregate')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = result ? ['aggregate', ...(result.llmsQueried || [])] : []
  const displayPercentages = activeTab === 'aggregate'
    ? result?.visibility?.aggregatePercentages
    : result?.visibility?.perLLM?.[activeTab]?.percentages

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Visibility Tracker</h1>
            <p className="text-xs text-gray-400">Claude · ChatGPT · Gemini</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {!result ? (
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your brand</label>
                  <input required type="text" placeholder="e.g. Acme"
                    value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Competitor 1</label>
                  <input required type="text" placeholder="e.g. Freshdesk"
                    value={form.c1} onChange={e => setForm(f => ({ ...f, c1: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Competitor 2</label>
                  <input type="text" placeholder="e.g. Zendesk"
                    value={form.c2} onChange={e => setForm(f => ({ ...f, c2: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Competitor 3 (optional)</label>
                  <input type="text" placeholder="e.g. Help Scout"
                    value={form.c3} onChange={e => setForm(f => ({ ...f, c3: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product category</label>
                  <input required type="text" placeholder="e.g. customer support software"
                    value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Query these AI engines</label>
                <div className="flex gap-2 flex-wrap">
                  {[['claude', 'Claude', 'bg-orange-100 text-orange-700 border-orange-300'],
                    ['chatgpt', 'ChatGPT', 'bg-green-100 text-green-700 border-green-300'],
                    ['gemini', 'Gemini', 'bg-blue-100 text-blue-700 border-blue-300']].map(([id, label, activeClass]) => (
                    <button key={id} type="button"
                      onClick={() => toggleLLM(id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        selectedLLMs.includes(id) ? activeClass : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors">
                {loading ? 'Querying AI engines… (up to 2 min)' : 'Run Visibility Check →'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Visibility Report</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {result.brand} vs {result.competitors.join(', ')} · {result.category}
                  {result.isDemo && <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded">Demo</span>}
                </p>
              </div>
              <button onClick={() => setResult(null)} className="text-sm text-indigo-600 hover:underline">Run again</button>
            </div>

            {/* Per-LLM tabs */}
            {tabs.length > 1 && (
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {tabs.map(tab => (
                  <LLMTab key={tab} llm={tab === 'aggregate' ? 'aggregate' : tab}
                    active={activeTab === tab}
                    onClick={() => setActiveTab(tab)} />
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              {/* Score card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {activeTab === 'aggregate' ? 'Overall AI Visibility' : `${LLM_LABELS[activeTab]} Visibility`}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  % of questions where each brand was mentioned
                </p>
                {displayPercentages && Object.entries(displayPercentages)
                  .sort(([, a], [, b]) => b - a)
                  .map(([brand, pct]) => (
                    <ScoreBar key={brand} brand={brand} percentage={pct} isUser={brand === result.brand} />
                  ))}
              </div>

              {/* Per-LLM summary (aggregate only) */}
              {activeTab === 'aggregate' && result.visibility?.perLLM && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Score by AI Engine</h3>
                  <div className="space-y-4">
                    {Object.entries(result.visibility.perLLM).map(([llm, data]) => (
                      <div key={llm}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{LLM_LABELS[llm] || llm}</span>
                          <span className="text-xs text-gray-400">{data.total} questions</span>
                        </div>
                        <div className="flex gap-2">
                          {Object.entries(data.percentages)
                            .sort(([, a], [, b]) => b - a)
                            .map(([brand, pct]) => (
                              <div key={brand} className="flex-1 text-center">
                                <div className={`text-xs font-bold mb-0.5 ${brand === result.brand ? 'text-indigo-600' : 'text-gray-600'}`}>{pct}%</div>
                                <div className="text-xs text-gray-400 truncate">{brand}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gaps */}
            {result.gapRecommendations?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Visibility Gaps to Fix</h3>
                <p className="text-sm text-gray-500 mb-4">Questions where AI engines mention competitors — not {result.brand}</p>
                <div className="space-y-3">
                  {result.gapRecommendations.map((rec, i) => (
                    <GapCard key={i} gap={result.visibility.gaps[i] || { question: rec.question, competitorsSeen: [] }} rec={rec} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
                Questions Asked ({result.questions?.length})
              </h3>
              <ol className="space-y-1.5">
                {result.questions?.map((q, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-gray-300 flex-shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
