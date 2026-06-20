import { useState } from 'react'
import VisibilityFlow from './VisibilityFlow'
import DiagnosisFlow from './DiagnosisFlow'

export default function AppHome() {
  const [flow, setFlow] = useState(null)

  if (flow === 'visibility') return <VisibilityFlow onBack={() => setFlow(null)} />
  if (flow === 'diagnosis') return <DiagnosisFlow onBack={() => setFlow(null)} />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">What do you want to do?</h2>
        <p className="text-gray-500">Choose a flow to get started. Both produce results in under 3 minutes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <button
          onClick={() => setFlow('visibility')}
          className="bg-white border border-gray-200 rounded-2xl p-8 text-left hover:border-indigo-400 hover:shadow-lg transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="inline-block bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded mb-3">
            MAIN FEATURE
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Visibility Tracker</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Brand + competitors + category → see exactly where each brand shows up in AI answers and what to do about the gaps.
          </p>
          <div className="mt-4 text-indigo-600 text-sm font-medium flex items-center gap-1">
            Check AI visibility
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => setFlow('diagnosis')}
          className="bg-white border border-gray-200 rounded-2xl p-8 text-left hover:border-emerald-400 hover:shadow-lg transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="inline-block bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded mb-3">
            SEO TOOL
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Rank Drop Diagnosis</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Blog URL + keyword → plain-English diagnosis of why it dropped + a writer-ready brief to fix it.
          </p>
          <div className="mt-4 text-emerald-600 text-sm font-medium flex items-center gap-1">
            Diagnose a drop
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}
