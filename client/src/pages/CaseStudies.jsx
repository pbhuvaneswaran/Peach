const studies = [
  {
    company: 'TechFlow SaaS',
    industry: 'Project Management',
    result: '+62% AI citation rate in 8 weeks',
    excerpt: 'TechFlow was ranking well on Google but invisible in Claude and ChatGPT answers for "best project management software for remote teams." After running an AEO Visibility report, they identified 4 content gaps and restructured 3 existing pages. Eight weeks later, their mention rate across AI engines went from 12% to 74%.',
    metrics: [{ label: 'Before', value: '12%' }, { label: 'After', value: '74%' }, { label: 'Time', value: '8 weeks' }],
  },
  {
    company: 'Momentum Agency',
    industry: 'B2B SaaS Clients',
    result: '6 client brands tracked weekly',
    excerpt: 'Momentum used to manually check AI search visibility for clients by asking ChatGPT directly — a process that took 2–3 hours per client per week. With AEO Visibility, they now run automated reports for 6 brands in one click and deliver structured gap reports as part of monthly retainers.',
    metrics: [{ label: 'Clients tracked', value: '6' }, { label: 'Time saved', value: '12 hrs/wk' }, { label: 'Plan', value: 'Agency' }],
  },
]

export default function CaseStudies() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Case Studies</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Real results from real teams</h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            How brands improved their AI search visibility using AEO Visibility.
          </p>
        </div>

        <div className="space-y-8 mb-16">
          {studies.map((s) => (
            <div key={s.company} className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.industry}</span>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">{s.company}</h2>
                  <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {s.result}
                  </span>
                </div>
                <div className="flex gap-4">
                  {s.metrics.map(m => (
                    <div key={m.label} className="text-center bg-gray-50 rounded-xl px-4 py-3 min-w-[72px]">
                      <div className="text-lg font-bold text-indigo-600">{m.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{s.excerpt}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Your brand could be next</h2>
          <p className="text-gray-400 mb-6 text-sm">Find out where you stand in AI search — in under 3 minutes.</p>
          <a href="/v2/app" className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors text-sm">
            Run your first report →
          </a>
        </div>
      </div>
    </div>
  )
}
