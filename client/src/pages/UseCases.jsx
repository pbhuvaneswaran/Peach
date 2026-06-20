const cases = [
  {
    title: 'B2B SaaS — Track brand visibility across AI search',
    role: 'Content Marketing Team',
    summary: 'How a B2B SaaS company discovered they were invisible in ChatGPT and Gemini answers for their top category — and closed the gap in 6 weeks.',
    tags: ['AEO', 'B2B SaaS', 'Content Strategy'],
  },
  {
    title: 'Agency — Monitor 12 client brands from one dashboard',
    role: 'SEO Agency',
    summary: 'A 10-person agency replaced their manual AI search monitoring process with weekly automated reports across all client brands.',
    tags: ['Agency', 'Monitoring', 'Reporting'],
  },
  {
    title: 'Enterprise — Pre-publish AI visibility check',
    role: 'Enterprise Marketing',
    summary: 'Before every major content publish, the team runs a pre-publish visibility check to ensure new content is structured for AI citation.',
    tags: ['Enterprise', 'Pre-publish', 'Content'],
  },
]

export default function UseCases() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Use Cases</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">How teams use AEO Visibility</h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            From solo content marketers to agency teams managing 10+ brands — here's how different teams are using the tool.
          </p>
        </div>

        <div className="space-y-5 mb-16">
          {cases.map((c) => (
            <div key={c.title} className="bg-white border border-gray-200 rounded-2xl p-7 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {c.tags.map(t => (
                      <span key={t} className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{c.title}</h2>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{c.summary}</p>
                  <div className="inline-flex items-center text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {c.role}
                  </div>
                </div>
                <div className="flex-shrink-0 w-24 h-24 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-indigo-600 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">See how it works for your brand</h2>
          <p className="text-indigo-200 mb-6 text-sm">Run a visibility check in under 3 minutes.</p>
          <a href="/v2/app" className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors text-sm">
            Try it free →
          </a>
        </div>
      </div>
    </div>
  )
}
