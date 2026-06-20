import { useState } from 'react'

function ScoreBar({ brand, percentage, isUser }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${isUser ? 'text-indigo-700' : 'text-gray-700'}`}>
          {brand} {isUser && <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded ml-1">You</span>}
        </span>
        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${isUser ? 'bg-indigo-500' : 'bg-gray-400'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function GapCard({ gap, index }) {
  return (
    <div className="bg-white border border-orange-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-orange-600 text-xs font-bold">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 mb-1">
            "{gap.question}"
          </p>
          {gap.competitorsSeen?.length > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              AI mentions instead: <span className="font-medium text-gray-700">{gap.competitorsSeen.join(', ')}</span>
            </p>
          )}
          {gap.recommendation && (
            <div className="bg-indigo-50 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-indigo-700 mb-1">What to do</p>
              <p className="text-sm text-indigo-900">{gap.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VisibilityFlow({ onBack }) {
  const [form, setForm] = useState({ brand: '', competitor1: '', competitor2: '', competitor3: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const runRequest = async ({ brand, competitors, category, demo = false }) => {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch('/api/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, competitors, category, demo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const competitors = [form.competitor1, form.competitor2, form.competitor3].filter(Boolean)
    if (competitors.length === 0) { setError('Add at least one competitor.'); return }
    await runRequest({ brand: form.brand, competitors, category: form.category })
  }

  const handleDemo = () => {
    runRequest({ brand: 'Acme', competitors: ['Competitor A', 'Competitor B'], category: 'project management software', demo: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">AI Visibility Tracker</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {!result ? (
          <div className="max-w-lg mx-auto">
            <p className="text-gray-500 text-sm mb-3">
              We'll generate 10 buyer-intent questions for your category, ask Claude, ChatGPT, and Gemini, and score which brands get mentioned.
            </p>
            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="w-full mb-6 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Loading demo...' : '✨ Try demo (no API key needed)'}
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or enter your brand</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your brand name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme"
                  value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competitor 1</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freshdesk"
                  value={form.competitor1}
                  onChange={e => setForm(f => ({ ...f, competitor1: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competitor 2 (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Zendesk"
                  value={form.competitor2}
                  onChange={e => setForm(f => ({ ...f, competitor2: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competitor 3 (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Help Scout"
                  value={form.competitor3}
                  onChange={e => setForm(f => ({ ...f, competitor3: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. customer support software"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {loading ? 'Analysing... (up to 2 min)' : 'Check AI Visibility'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {result.isDemo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                <strong>Demo mode</strong> — this is sample data. Add your API keys to run a real report against your actual brand.
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Visibility Report</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {result.brand} vs {result.competitors.join(', ')} · {result.category}
                </p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-sm text-indigo-600 hover:underline"
              >
                Run again
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                AI Visibility Score
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                % of {result.visibility.total} buyer-intent questions where each brand was mentioned
              </p>
              {Object.entries(result.visibility.percentages)
                .sort(([, a], [, b]) => b - a)
                .map(([brand, pct]) => (
                  <ScoreBar key={brand} brand={brand} percentage={pct} isUser={brand === result.brand} />
                ))}
            </div>

            {result.gapRecommendations?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Top Gaps to Fix</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Questions where AI search mentions competitors — not {result.brand}
                </p>
                <div className="space-y-3">
                  {result.gapRecommendations.map((gap, i) => (
                    <GapCard key={i} gap={{ ...gap, competitorsSeen: result.visibility.gaps[i]?.competitorsSeen }} index={i} />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Questions Asked ({result.questions?.length})
              </h3>
              <ol className="space-y-2">
                {result.questions?.map((q, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-gray-400 flex-shrink-0">{i + 1}.</span>
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
