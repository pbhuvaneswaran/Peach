import { useState } from 'react'

export default function DiagnosisFlow({ onBack }) {
  const [form, setForm] = useState({ url: '', keyword: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.url || undefined, keyword: form.keyword || undefined }),
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Rank Drop Diagnosis</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {!result ? (
          <div className="max-w-lg mx-auto">
            <p className="text-gray-500 text-sm mb-6">
              Paste a blog URL and target keyword. We'll compare it against top-ranking pages and give you a plain-English diagnosis.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog URL</label>
                <input
                  type="url"
                  placeholder="https://yoursite.com/blog/article"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target keyword</label>
                <input
                  type="text"
                  placeholder="e.g. best helpdesk software for small business"
                  value={form.keyword}
                  onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || (!form.url && !form.keyword)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {loading ? 'Diagnosing... (up to 3 min)' : 'Diagnose Drop'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Diagnosis Report</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {result.primaryKeyword || result.inferredKeyword}
                  {result.rank && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Rank #{result.rank}</span>}
                  {!result.rank && result.blogUrl && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Not in top results</span>}
                </p>
              </div>
              <button onClick={() => setResult(null)} className="text-sm text-emerald-600 hover:underline">
                Run again
              </button>
            </div>

            {result.diagnosis?.issues?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Why It Dropped
                </h3>
                <div className="space-y-4">
                  {result.diagnosis.issues.map((issue, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs font-bold">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{issue.reason}</p>
                        {issue.impact && <p className="text-xs text-gray-400 mt-1">Impact: {issue.impact}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                {result.diagnosis.summary && (
                  <p className="mt-5 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    {result.diagnosis.summary}
                  </p>
                )}
              </div>
            )}

            {result.diagnosis?.fixPlan?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Fix Plan
                </h3>
                <ol className="space-y-3">
                  {result.diagnosis.fixPlan.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {result.gaps?.gaps?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Content Gaps
                </h3>
                <div className="space-y-4">
                  {result.gaps.gaps.map((gap, i) => (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-medium text-gray-900">{gap.gap}</p>
                        <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${gap.score >= 8 ? 'bg-red-100 text-red-700' : gap.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {gap.score}/10
                        </span>
                      </div>
                      {gap.recommendation && (
                        <p className="text-xs text-gray-500 mt-1">{gap.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.competitors?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Compared Against
                </h3>
                <div className="space-y-1">
                  {result.competitors.map((c, i) => (
                    <p key={i} className="text-sm text-gray-600 truncate">
                      <span className="text-gray-400 mr-2">{i + 1}.</span>
                      <a href={c.url} target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">
                        {c.url}
                      </a>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
