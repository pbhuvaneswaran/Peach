import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { LLM_COLORS } from '../../components/llmConfig'
import { PLATFORM_ICONS } from '../../components/llmPlatforms'
import { supabase } from '../../lib/supabase'

const EXAMPLES = [
  { label: 'copilotverse.io', value: 'copilotverse.io' },
  { label: 'freshdesk.com', value: 'freshdesk.com' },
  { label: 'intercom.com', value: 'intercom.com' },
]

const OUTPUT_TABS = ['Overview', 'Prompts', 'Competitors', 'Citations', 'Growth Actions', 'Site Audit']

const TAB_SUBLABELS = {
  'Prompts': 'Prompt library',
  'Citations': 'Sources & domains',
  'Growth Actions': 'Get cited in AI answers',
  'Site Audit': 'AI readiness',
}

const TAB_ICONS = {
  Overview: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Prompts: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z" />
    </svg>
  ),
  Competitors: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5.6-3.7M9 20H4v-2a4 4 0 015.6-3.7M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a2 2 0 11-4 0 2 2 0 014 0zM7 12a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Citations: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  'Growth Actions': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'Site Audit': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
}

const INSIGHT_ICONS = {
  target: 'M12 22a10 10 0 100-20 10 10 0 000 20zm0-5a5 5 0 110-10 5 5 0 010 10zm0-2a3 3 0 100-6 3 3 0 000 6z',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  layers: 'M12 3l9 5-9 5-9-5 9-5zm-9 9l9 5 9-5m-18 5l9 5 9-5',
  focus: 'M12 8a4 4 0 100 8 4 4 0 000-8zm0-6v4m0 12v4m10-10h-4M6 12H2',
  chat: 'M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2v10z',
}

const INSIGHTS = [
  { icon: 'target', text: 'AI answers often recommend only a few brands. Peach shows whether yours is one of them.' },
  { icon: 'search', text: 'Ranking on Google does not guarantee visibility in AI answers. AI may recommend a different source entirely.' },
  { icon: 'layers', text: 'Your competitors may be winning prompts you have never tracked. We are looking for those gaps now.' },
  { icon: 'focus', text: 'The best opportunities are usually specific. Think "best tool for small agencies," not just "best tool."' },
  { icon: 'chat', text: 'Visibility is only half the story. We also check how AI describes your brand.' },
]

const STEPS = [
  { label: 'Reading your website',        detail: 'Understanding what you offer and who it is for.',                            ms: 2500 },
  { label: 'Identifying your category',   detail: 'Finding the category, use cases, and competitors AI may compare you with.',    ms: 5000 },
  { label: 'Generating buyer questions',  detail: 'Creating 8 questions potential customers ask before choosing a tool.',                       ms: 3000 },
  { label: 'Crawling LLMs',              detail: 'Querying ChatGPT and Gemini across 8 buyer questions — looking for mentions and citations.', ms: 32000 },
  { label: 'Scoring your visibility',     detail: 'Measuring where you appear and where competitors win.',                        ms: 2000 },
  { label: 'Building your action plan',   detail: 'Turning the findings into clear next steps.',                                  ms: 5000 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim()
}

function formatReportAge(ts) {
  if (!ts) return 'Report generated today'
  const days = Math.floor((Date.now() - ts) / 86400000)
  if (days <= 0) return 'Report generated today'
  if (days === 1) return 'Report generated yesterday'
  return `Report generated ${days} days ago`
}

function extractSnippet(rawAnswer, keyword, maxLen = 220) {
  const answer = stripMarkdown(rawAnswer)
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

function extractTopDomainsDetailed(visibility) {
  const domainRegex = /\b([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:com|io|ai|co|org|net|app|dev))\b/g
  const map = {}
  for (const [llm, llmData] of Object.entries(visibility?.perLLM || {})) {
    for (const { question, answer } of llmData.details || []) {
      if (!answer) continue
      const seenInThisAnswer = new Set()
      for (const m of answer.matchAll(domainRegex)) {
        const d = m[1].toLowerCase()
        if (d.split('.').length < 2 || seenInThisAnswer.has(d)) continue
        seenInThisAnswer.add(d)
        if (!map[d]) map[d] = { domain: d, count: 0, occurrences: [] }
        map[d].count += 1
        map[d].occurrences.push({ question, llm })
      }
    }
  }
  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8)
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function downloadCSV(result) {
  const rows = [
    [`AI Visibility Report — ${result.brand}`, '', '', '', ''],
    ['Date', new Date().toLocaleDateString(), '', '', ''],
    [''],
    ['Query', 'ChatGPT Answer (snippet)', 'Gemini Answer (snippet)', 'Brand cited?', 'Competitors cited'],
  ]
  for (const prompt of result.prompts || []) {
    const chatgptEntry = result.visibility?.perLLM?.chatgpt?.details?.find(d => d.question === prompt)
    const geminiEntry = result.visibility?.perLLM?.gemini?.details?.find(d => d.question === prompt)
    const brandCited = [chatgptEntry, geminiEntry].some(e => e?.mentions?.[result.brand]) ? 'Yes' : 'No'
    const comps = [...new Set([
      ...(chatgptEntry ? Object.keys(chatgptEntry.mentions || {}) : []),
      ...(geminiEntry ? Object.keys(geminiEntry.mentions || {}) : []),
    ])].filter(b => b !== result.brand).join('; ')
    rows.push([
      `"${prompt.replace(/"/g, "'")}"`,
      `"${(chatgptEntry?.answer || '').slice(0, 200).replace(/"/g, "'")}"`,
      `"${(geminiEntry?.answer || '').slice(0, 200).replace(/"/g, "'")}"`,
      brandCited,
      comps,
    ])
  }
  const csv = rows.map(r => r.join(',')).join('\n')
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = `peach-report-${result.brand}-${Date.now()}.csv`
  a.click()
}

// ─── Report Actions ───────────────────────────────────────────────────────────

function ReportActions({ result, onReset, sidebar = false }) {
  const [copied, setCopied] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (sidebar) {
    const sideBtn = 'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#667085] hover:bg-[#F8F6FE] hover:text-[#14182B] rounded-lg transition-colors'
    return (
      <div className="space-y-0.5 print:hidden">
        <button onClick={handleShare} className={sideBtn}>
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6a2.5 2.5 0 11.702 1.737L8.34 10.87a2.5 2.5 0 010 2.26l5.862 3.132a2.5 2.5 0 11-.702 1.737 2.5 2.5 0 01.014-.28l-5.862-3.132a2.5 2.5 0 110-3.174l5.862-3.132A2.5 2.5 0 0113.5 6z" />
          </svg>
          {copied ? 'Copied!' : 'Share report'}
        </button>
        <div ref={exportRef} className="relative">
          <button onClick={() => setShowExportMenu(v => !v)} className={sideBtn}>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            Export
          </button>
          {showExportMenu && (
            <div className="absolute bottom-full left-0 mb-1 w-36 bg-white border border-[#E7E2F0] rounded-xl shadow-lg py-1.5 z-50">
              <button onClick={() => { downloadCSV(result); setShowExportMenu(false) }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#14182B] hover:bg-[#F8F6FE]">CSV</button>
              <button onClick={() => { setShowPdfModal(true); setShowExportMenu(false) }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#14182B] hover:bg-[#F8F6FE]">PDF</button>
            </div>
          )}
        </div>
        <button onClick={onReset} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#5B3DF5] hover:bg-[#F1EDFF] rounded-lg transition-colors">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.657-6.657l-.707.707M7.05 16.95l-.707.707m11.314 0l-.707-.707M7.05 7.05l-.707-.707" />
          </svg>
          New report
        </button>
        {showPdfModal && (
          <div className="absolute left-full ml-2 bottom-0 w-64 bg-white border border-[#E7E2F0] rounded-xl shadow-lg p-4 z-50">
            <p className="text-sm font-semibold text-[#14182B] mb-1">Download PDF report</p>
            <p className="text-xs text-[#667085] mb-3">Sign up to download full PDF reports for your brand</p>
            <div className="flex gap-2">
              <Link to="/pricing" className="flex-1 text-center bg-[#5B3DF5] text-white text-xs font-semibold px-3 py-2 rounded-lg">
                Create account
              </Link>
              <button onClick={() => setShowPdfModal(false)} className="text-xs text-[#667085] px-3 py-2 rounded-lg hover:bg-[#F8F6FE]">
                Not now
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const btnClass = 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#E7E2F0] rounded-lg bg-white hover:bg-[#F8F6FE] text-[#14182B] transition-colors'

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button onClick={handleShare} className={btnClass}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6a2.5 2.5 0 11.702 1.737L8.34 10.87a2.5 2.5 0 010 2.26l5.862 3.132a2.5 2.5 0 11-.702 1.737 2.5 2.5 0 01.014-.28l-5.862-3.132a2.5 2.5 0 110-3.174l5.862-3.132A2.5 2.5 0 0113.5 6z" />
        </svg>
        {copied ? 'Copied!' : 'Share'}
      </button>

      <div ref={exportRef} className="relative">
        <button onClick={() => setShowExportMenu(v => !v)} className={btnClass}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
          </svg>
          Export
          <svg className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showExportMenu && (
          <div className="absolute top-full right-0 mt-2 w-36 bg-white border border-[#E7E2F0] rounded-xl shadow-lg py-1.5 z-50">
            <button onClick={() => { downloadCSV(result); setShowExportMenu(false) }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#14182B] hover:bg-[#F8F6FE]">CSV</button>
            <button onClick={() => { setShowPdfModal(true); setShowExportMenu(false) }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#14182B] hover:bg-[#F8F6FE]">PDF</button>
          </div>
        )}
      </div>

      <button onClick={() => window.print()} className={btnClass}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-12 0h12v4H6v-4z" />
        </svg>
        Print
      </button>

      <button onClick={onReset} className="flex items-center gap-1 text-sm font-semibold text-[#5B3DF5] hover:text-[#4c30dd] ml-2">
        ← New report
      </button>

      {showPdfModal && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-[#E7E2F0] rounded-xl shadow-lg p-4 z-50">
          <p className="text-sm font-semibold text-[#14182B] mb-1">Download PDF report</p>
          <p className="text-xs text-[#667085] mb-3">Sign up to download full PDF reports for your brand</p>
          <div className="flex gap-2">
            <Link to="/pricing" className="flex-1 text-center bg-[#5B3DF5] text-white text-xs font-semibold px-3 py-2 rounded-lg">
              Create account
            </Link>
            <button onClick={() => setShowPdfModal(false)} className="text-xs text-[#667085] px-3 py-2 rounded-lg hover:bg-[#F8F6FE]">
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Analysis Progress ────────────────────────────────────────────────────────

function PlatformMomentChip({ platformKey }) {
  const { Icon, label } = PLATFORM_ICONS[platformKey]
  return (
    <div className="chip-scan inline-flex items-center gap-2 bg-white border border-[#E8E2F5] rounded-full px-3 py-1.5 mt-2.5" style={{ '--i': 0 }}>
      <Icon size={16} />
      <span className="text-xs font-semibold text-[#14182B]">{label}</span>
      <span className="text-xs text-[#677085]">· Checking 8 buyer questions</span>
    </div>
  )
}

function StepRow({ step, state, isLast }) {
  return (
    <div className="relative flex items-start gap-4 pb-5 last:pb-0">
      {!isLast && <span className="absolute left-[9px] top-6 bottom-0 w-px bg-[#E8E2F5]" />}
      <div className="relative z-10 flex-shrink-0 mt-0.5">
        {state === 'done' && (
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {state === 'active' && (
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full border-2 border-[#E3D9FB]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5B3DF5]" style={{ animation: 'spin 1.4s linear infinite' }} />
          </div>
        )}
        {state === 'upcoming' && (
          <div className="w-5 h-5 rounded-full border-2 border-[#E3D9FB] bg-[#F8F6FE]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[15px] font-semibold transition-colors duration-300 ${state === 'upcoming' ? 'text-[#9CA3B8]' : 'text-[#14182B]'}`}>
            {step.label}
          </p>
          {state === 'active' && (
            <span className="text-[10px] font-bold text-[#5B3DF5] uppercase tracking-wide flex-shrink-0">Working</span>
          )}
        </div>
        {state === 'done' && (
          <p className="text-sm mt-0.5 leading-relaxed text-[#9CA3B8] line-through decoration-[#D8D2EE]">{step.detail}</p>
        )}
        {state === 'active' && (
          <p className="text-sm mt-0.5 leading-relaxed text-[#677085]">{step.detail}</p>
        )}
        {state === 'active' && step.platform && <PlatformMomentChip platformKey={step.platform} />}
      </div>
    </div>
  )
}

function AnalysisProgress({ input, done, onViewReport }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [insightIndex, setInsightIndex] = useState(0)
  const [insightVisible, setInsightVisible] = useState(true)
  const stepTimeoutRef = useRef(null)

  useEffect(() => {
    if (done) {
      clearTimeout(stepTimeoutRef.current)
      const t = setTimeout(onViewReport, 800)
      return () => clearTimeout(t)
    }
    let step = 0
    const advance = () => {
      step += 1
      if (step < STEPS.length) {
        setCurrentStep(step)
        stepTimeoutRef.current = setTimeout(advance, STEPS[step].ms)
      }
    }
    stepTimeoutRef.current = setTimeout(advance, STEPS[0].ms)
    return () => clearTimeout(stepTimeoutRef.current)
  }, [done])

  const displayStep = done ? STEPS.length : currentStep

  useEffect(() => {
    if (done) return
    const interval = setInterval(() => {
      setInsightVisible(false)
      setTimeout(() => {
        setInsightIndex(i => (i + 1) % INSIGHTS.length)
        setInsightVisible(true)
      }, 400)
    }, 4500)
    return () => clearInterval(interval)
  }, [done])

  const domain = input.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
  const insight = INSIGHTS[insightIndex]

  return (
    <div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center py-16">
      <div className="w-full max-w-[820px] mx-auto px-6 animate-fade-in-up">
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-[#5B3DF5] uppercase tracking-widest mb-2">Analysing</p>
          <h2 className="text-3xl font-bold text-[#14182B] mb-2">{domain || 'your website'}</h2>
          <p className="text-[#677085] text-[15px]">We're checking how AI understands, mentions, and recommends your brand.</p>
        </div>

        <div className="bg-white border border-[#E8E2F5] rounded-[22px] p-8 mb-5">
          {STEPS.map((step, i) => {
            const state = i < displayStep ? 'done' : i === displayStep ? 'active' : 'upcoming'
            return <StepRow key={step.label} step={step} state={state} isLast={i === STEPS.length - 1} />
          })}
        </div>

        {done ? (
          <div className="bg-white border border-[#E8E2F5] rounded-[22px] p-8 text-center">
            <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-[#14182B] mb-1">Report ready — opening now…</p>
            <p className="text-sm text-[#677085]">Taking you to your AI visibility report.</p>
          </div>
        ) : (
          <div className={`bg-[#FFF1E6] rounded-[22px] p-6 border border-[#FFD8C2] transition-opacity duration-500 ${insightVisible ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-[10px] font-black text-[#B4632A] uppercase tracking-[0.2em] mb-3">While we check</p>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#5B3DF5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={INSIGHT_ICONS[insight.icon]} />
              </svg>
              <p className="text-sm font-medium text-[#14182B] leading-relaxed">{insight.text}</p>
            </div>
            <div className="flex gap-1.5 justify-center mt-4">
              {INSIGHTS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === insightIndex ? 'w-4 bg-[#5B3DF5]' : 'w-1.5 bg-[#F0C9AE]'}`} />
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-[#9CA3B8] mt-5">Usually takes 35–50 seconds · 16 real AI queries across ChatGPT + Gemini</p>
      </div>
    </div>
  )
}

// ─── Tab 1: Overview components ───────────────────────────────────────────────

function CircularProgress({ pct, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#F1EDFF" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#5B3DF5" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#5B3DF5]">{pct}%</span>
    </div>
  )
}

function SummaryRow({ citedCount, totalPrompts, gapsCount, topCompetitor, onViewGap }) {
  const pct = totalPrompts > 0 ? Math.round((citedCount / totalPrompts) * 100) : 0
  return (
    <div className="grid md:grid-cols-3 gap-5 mb-14">
      <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6 flex items-center justify-between transition-all hover:border-[#5B3DF5]/40 hover:-translate-y-0.5 hover:shadow-md">
        <div>
          <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wide mb-2">Your AI visibility</p>
          <p className="text-3xl font-bold text-[#14182B]">{citedCount} / {totalPrompts}</p>
          <p className="text-sm text-[#667085] mt-1">buyer questions where AI mentioned you</p>
        </div>
        <CircularProgress pct={pct} />
      </div>

      <div className="bg-[#FFF1E7] border border-[#F5DCC4] rounded-2xl p-6 transition-all hover:border-[#5B3DF5]/40 hover:-translate-y-0.5 hover:shadow-md">
        <p className="text-[11px] font-bold text-[#B4632A] uppercase tracking-wide mb-2">Biggest gap</p>
        <p className="text-3xl font-bold text-[#14182B]">{gapsCount}</p>
        <p className="text-sm text-[#667085] mt-1 mb-3">high-intent prompt{gapsCount === 1 ? '' : 's'} where competitors were cited instead</p>
        {gapsCount > 0 && (
          <button onClick={onViewGap} className="text-xs font-semibold text-[#B4632A] hover:underline">View gap ↓</button>
        )}
      </div>

      <div className="bg-[#F1EDFF] border border-[#DCD1F7] rounded-2xl p-6 transition-all hover:border-[#5B3DF5]/40 hover:-translate-y-0.5 hover:shadow-md">
        <p className="text-[11px] font-bold text-[#5B3DF5] uppercase tracking-wide mb-2">Top competitor</p>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-full bg-white border border-[#DCD1F7] flex items-center justify-center text-sm font-bold text-[#5B3DF5] flex-shrink-0">
            {topCompetitor ? topCompetitor[0].charAt(0).toUpperCase() : '—'}
          </div>
          <p className="text-xl font-bold text-[#14182B] truncate">{topCompetitor ? topCompetitor[0] : 'None cited'}</p>
        </div>
        <p className="text-sm text-[#667085]">{topCompetitor ? `cited in ${topCompetitor[1]}% of answers checked` : 'No competitors cited yet'}</p>
      </div>
    </div>
  )
}

function MissedPromptCard({ item, brand }) {
  const [expanded, setExpanded] = useState(false)
  const primary = item.llmAnswers?.[0]
  const platform = primary ? PLATFORM_ICONS[primary.llm] : null

  return (
    <div id="missed-prompt-card" className="bg-white border border-[#E7E2F0] rounded-2xl overflow-hidden border-t-4 border-t-[#FFB27A] scroll-mt-24">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#E08A45] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-[11px] font-bold text-[#E08A45] uppercase tracking-wide">Missed buyer question</span>
          </div>
          {platform && (
            <span className="inline-flex items-center gap-1.5 bg-[#F8F6FE] border border-[#E7E2F0] rounded-full px-2.5 py-1 flex-shrink-0">
              <platform.Icon size={14} />
              <span className="text-xs font-medium text-[#14182B]">{platform.label}</span>
            </span>
          )}
        </div>

        <p className="text-lg font-bold text-[#14182B] leading-snug mb-4">“{item.prompt}”</p>

        <div className="bg-[#FFF1E7] rounded-lg px-3 py-2 mb-4">
          <p className="text-sm font-semibold text-[#B4632A]">{brand} was not cited in this answer.</p>
        </div>

        {primary && (
          <>
            <blockquote className={`text-[15px] text-[#14182B]/90 leading-relaxed border-l-4 border-[#E7E2F0] pl-4 ${expanded ? '' : 'line-clamp-3'}`}>
              “{stripMarkdown(primary.answer)}”
            </blockquote>
            <button onClick={() => setExpanded(!expanded)} className="text-xs font-semibold text-[#5B3DF5] hover:text-[#4c30dd] mt-2">
              {expanded ? 'Show less ←' : 'Read full answer →'}
            </button>
          </>
        )}

        {item.competitorsSeen?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-5 pt-4 border-t border-[#E7E2F0]">
            <span className="text-sm text-[#667085]">Cited instead:</span>
            {item.competitorsSeen.map(c => (
              <span key={c} className="text-xs font-semibold bg-[#FFE4CE] text-[#B4632A] px-2.5 py-1 rounded-full">{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionPanel({ item, action, onViewActionPlan }) {
  const bullets = []
  if (action?.action) bullets.push(action.action)
  if (action?.why) bullets.push(action.why)
  if (action?.format) bullets.push(`Best format: ${action.format}`)
  if (bullets.length === 0) {
    bullets.push(`Create a dedicated page answering: "${item.prompt}"`)
    bullets.push('Use the language AI already associates with this query, then add your own angle.')
  }

  return (
    <div className="bg-[#F1EDFF] border border-[#DCD1F7] rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-[#14182B] mb-4">What could get you cited here</h3>
      <ul className="space-y-3 mb-6 flex-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[#5B3DF5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[15px] text-[#14182B]/90 leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
      <div className="bg-white/70 border border-[#DCD1F7] rounded-xl px-4 py-3 mb-5">
        <p className="text-[11px] font-bold text-[#5B3DF5] uppercase tracking-wide mb-1">Suggested content angle</p>
        <p className="text-sm text-[#14182B] font-medium">“{item.prompt}”</p>
      </div>
      <button onClick={onViewActionPlan}
        className="inline-flex items-center justify-center gap-1.5 bg-[#5B3DF5] hover:bg-[#4c30dd] text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
        View full action plan →
      </button>
    </div>
  )
}

function CompetitorInsightCard({ comp, result, onComparePositioning }) {
  const agg = result.visibility?.aggregatePercentages || {}
  const evidence = getCompetitorEvidence(result.visibility, comp)
  if (evidence.length === 0) return null
  const best = evidence[0]
  const tags = ['Marketplace', 'Quick hiring', 'Specialist services', 'Freelancers'].slice(0, 4)

  return (
    <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6 transition-all hover:border-[#5B3DF5]/40 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F1EDFF] rounded-full flex items-center justify-center text-sm font-bold text-[#5B3DF5]">
            {comp.charAt(0).toUpperCase()}
          </div>
          <div>
            <button className="text-[15px] font-bold text-[#14182B] hover:text-[#5B3DF5] transition-colors">{comp}</button>
            <p className="text-sm text-[#667085]">Cited in {evidence.length} of {result.prompts?.length} buyer questions</p>
          </div>
        </div>
        <span className="text-sm font-bold text-[#5B3DF5] bg-[#F1EDFF] px-2.5 py-1 rounded-full flex-shrink-0">{agg[comp]}% mention rate</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map(t => (
          <span key={t} className="text-xs font-medium text-[#667085] bg-[#F8F6FE] border border-[#E7E2F0] px-2.5 py-1 rounded-full">{t}</span>
        ))}
      </div>

      <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wide mb-2">What {LLM_COLORS[best.llm]?.label || 'AI'} highlighted</p>
      <blockquote className="text-sm text-[#14182B]/90 bg-[#F1EDFF] rounded-lg px-4 py-3 leading-relaxed mb-4">
        “{best.snippet}”
      </blockquote>

      <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wide mb-1">Why this matters for you</p>
      <p className="text-sm text-[#14182B]/90 leading-relaxed mb-4">
        {comp} is being associated with language your content may not yet own. Closing that gap is how you get cited instead.
      </p>

      <button onClick={onComparePositioning} className="text-sm font-semibold text-[#5B3DF5] hover:text-[#4c30dd]">
        Compare your positioning →
      </button>
    </div>
  )
}

function NextBestMove({ item, onGenerateBrief }) {
  return (
    <div className="bg-[#FFF1E7] border border-[#F5DCC4] rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5B3DF5]" />
      <p className="text-[11px] font-bold text-[#B4632A] uppercase tracking-wide mb-3">Next best move</p>
      <h3 className="text-2xl font-bold text-[#14182B] leading-snug mb-3">Create one page for the prompt you are missing.</h3>
      <p className="text-[15px] text-[#14182B]/90 leading-relaxed mb-6 max-w-2xl">
        Your highest-impact opportunity is content that directly answers “{item.prompt}” — the exact language AI is already using to cite competitors instead of you.
      </p>
      <button onClick={onGenerateBrief}
        className="inline-flex items-center gap-1.5 bg-[#5B3DF5] hover:bg-[#4c30dd] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm mb-3">
        Generate content brief →
      </button>
      <p className="text-xs text-[#667085]">Based on live AI answers and competitor citations.</p>
    </div>
  )
}

function OverviewTab({ result, onViewActionPlan, onComparePositioning }) {
  const agg = result.visibility?.aggregatePercentages || {}
  const brand = result.brand
  const gaps = result.visibility?.gaps || []
  const totalPrompts = result.prompts?.length || 0
  const allZero = Object.values(agg).every(p => p === 0)
  const brandPct = agg[brand] ?? 0
  const citedCount = allZero ? 0 : Math.max(0, totalPrompts - gaps.length)
  const gapsCount = allZero ? totalPrompts : gaps.length

  const topCompetitor = Object.entries(agg)
    .filter(([b]) => b !== brand && agg[b] > 0)
    .sort((a, b) => b[1] - a[1])[0]

  const topCompetitors = Object.entries(agg)
    .filter(([b]) => b !== brand && agg[b] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name)

  const gapSource = allZero
    ? result.prompts.map(p => ({ question: p, competitorsSeen: result.competitors || [] }))
    : gaps

  const gapItems = gapSource.map(gap => {
    const firstComp = gap.competitorsSeen?.[0]
    const llmAnswers = []
    for (const [llm, llmData] of Object.entries(result.visibility?.perLLM || {})) {
      const entry = (llmData.details || []).find(d => d.question === gap.question)
      if (entry?.answer) llmAnswers.push({ llm, answer: entry.answer })
    }
    return { prompt: gap.question, competitorsSeen: gap.competitorsSeen || [], llmAnswers, firstComp }
  })

  const featured = gapItems[0] || null
  const featuredAction = featured
    ? (result.actions || []).find(a => a.gap === featured.prompt) || result.actions?.[0]
    : null

  return (
    <div>
      <SummaryRow
        citedCount={citedCount}
        totalPrompts={totalPrompts}
        gapsCount={gapsCount}
        topCompetitor={topCompetitor}
        onViewGap={() => document.getElementById('missed-prompt-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      />

      {brandPct > 0 && gaps.length === 0 ? (
        <div className="bg-[#DCF7E9] border border-[#BFEDD6] rounded-2xl p-8 text-center mb-14">
          <p className="text-emerald-800 font-semibold text-lg">You were cited across all tested queries — great AI visibility!</p>
        </div>
      ) : featured && (
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-[#14182B] mb-1.5">Where AI does not mention you</h2>
          <p className="text-[#667085] mb-6">Here is the buyer question where competitors appeared and you did not.</p>
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <MissedPromptCard item={featured} brand={brand} />
            <ActionPanel item={featured} action={featuredAction} onViewActionPlan={onViewActionPlan} />
          </div>
        </div>
      )}

      {topCompetitors.length > 0 && (
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-[#14182B] mb-1.5">Why AI is citing your competitors</h2>
          <p className="text-[#667085] mb-6">The themes and language patterns AI associates with them.</p>
          <div className="space-y-5">
            {topCompetitors.map(comp => (
              <CompetitorInsightCard key={comp} comp={comp} result={result} onComparePositioning={onComparePositioning} />
            ))}
          </div>
        </div>
      )}

      {featured && (
        <NextBestMove item={featured} onGenerateBrief={onViewActionPlan} />
      )}
    </div>
  )
}

// ─── Tab 2: AI Answers ─────────────────────────────────────────────────────────

function EngineFilter({ value, onChange, llmsQueried }) {
  const options = ['all', ...llmsQueried]
  return (
    <div className="flex items-center gap-2 mb-8 flex-wrap">
      {options.map(opt => {
        const active = value === opt
        const platform = opt !== 'all' ? PLATFORM_ICONS[opt] : null
        return (
          <button key={opt} onClick={() => onChange(opt)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
              active ? 'bg-[#F1EDFF] border-[#5B3DF5] text-[#5B3DF5]' : 'bg-white border-[#E7E2F0] text-[#667085] hover:border-[#DCD1F7]'
            }`}>
            {platform && <platform.Icon size={15} />}
            {opt === 'all' ? 'All engines' : platform?.label}
          </button>
        )
      })}
    </div>
  )
}

function AnswerSummaryRow({ citedCount, total, missedCount, topCompetitor }) {
  const pct = total > 0 ? Math.round((citedCount / total) * 100) : 0
  return (
    <div className="grid md:grid-cols-3 gap-5 mb-10">
      <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wide mb-2">Your mention rate</p>
          <p className="text-3xl font-bold text-[#14182B]">{citedCount} / {total}</p>
          <p className="text-sm text-[#667085] mt-1">You appeared in {citedCount} buyer question{citedCount === 1 ? '' : 's'} checked.</p>
        </div>
        <CircularProgress pct={pct} />
      </div>
      <div className="bg-[#FFF1E7] border border-[#F5DCC4] rounded-2xl p-6">
        <p className="text-[11px] font-bold text-[#B4632A] uppercase tracking-wide mb-2">Missed questions</p>
        <p className="text-3xl font-bold text-[#14182B]">{missedCount}</p>
        <p className="text-sm text-[#667085] mt-1">Questions where AI did not mention your brand.</p>
      </div>
      <div className="bg-[#F1EDFF] border border-[#DCD1F7] rounded-2xl p-6">
        <p className="text-[11px] font-bold text-[#5B3DF5] uppercase tracking-wide mb-2">Most cited competitor</p>
        <p className="text-xl font-bold text-[#14182B] mb-1 truncate">{topCompetitor ? topCompetitor.name : 'None cited'}</p>
        <p className="text-sm text-[#667085]">
          {topCompetitor ? `Appeared in ${topCompetitor.count} of ${total} buyer question${total === 1 ? '' : 's'}.` : 'No competitors cited yet.'}
        </p>
      </div>
    </div>
  )
}

function AnswerQuoteCard({ llm, answer }) {
  const [expanded, setExpanded] = useState(false)
  const platform = PLATFORM_ICONS[llm]
  if (!platform || !answer) return null
  return (
    <div className="bg-white border border-[#E7E2F0] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <platform.Icon size={16} />
        <span className="text-sm font-semibold text-[#14182B]">What {platform.label} said</span>
      </div>
      <div className={`text-sm text-[#14182B]/85 leading-relaxed prose prose-sm max-w-none prose-p:my-1 ${expanded ? '' : 'line-clamp-3'}`}>
        <ReactMarkdown>{answer}</ReactMarkdown>
      </div>
      <button onClick={() => setExpanded(!expanded)} className="text-xs font-semibold text-[#5B3DF5] hover:text-[#4c30dd] mt-2">
        {expanded ? 'Show less ←' : 'Read full answer →'}
      </button>
    </div>
  )
}

function ExpandedDetail({ row, engineFilter, onBuildActionPlan }) {
  const engines = engineFilter === 'all' ? Object.keys(row.perEngine) : [engineFilter]
  const competitorList = row.competitorsSurfaced.length > 0 ? row.competitorsSurfaced.join(' and ') : 'Competitors'

  return (
    <div className="px-6 pb-6 bg-[#FBFAFE] border-t border-[#E7E2F0] grid lg:grid-cols-2 gap-6">
      <div className="space-y-3 pt-5">
        <p className="text-xs font-bold text-[#667085] uppercase tracking-wide">AI answers</p>
        {engines.map(llm => (
          <AnswerQuoteCard key={llm} llm={llm} answer={row.perEngine[llm]?.answer} />
        ))}
      </div>
      <div className="pt-5">
        {row.mentioned ? (
          <div className="bg-[#DCF7E9] border border-[#BFEDD6] rounded-xl p-5 h-full flex flex-col justify-center">
            <p className="text-sm font-bold text-emerald-800 mb-1">You're already cited here</p>
            <p className="text-sm text-emerald-900/80 leading-relaxed">Keep this page fresh — AI models re-crawl sources over time, so staying accurate here protects the citation.</p>
          </div>
        ) : (
          <div className="bg-[#F1EDFF] border border-[#DCD1F7] rounded-xl p-5 h-full flex flex-col">
            <p className="text-sm font-bold text-[#14182B] mb-3">Why you were missed</p>
            <ul className="space-y-2 mb-5 flex-1">
              {[
                'Your site does not clearly target this use case',
                `${competitorList} ${row.competitorsSurfaced.length > 1 ? 'are' : row.competitorsSurfaced.length === 1 ? 'is' : 'are'} directly associated with this question`,
                'No dedicated page or proof point supports this topic',
              ].map((reason, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-[#5B3DF5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-4M18 2l4 4-9 9H9v-4l9-9z" />
                  </svg>
                  <span className="text-sm text-[#14182B]/90 leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#DCD1F7] pt-4">
              <p className="text-xs font-bold text-[#5B3DF5] uppercase tracking-wide mb-1">Recommended next move</p>
              <p className="text-sm text-[#14182B] mb-3">Create or improve a page around: “{row.prompt}”</p>
              <button onClick={onBuildActionPlan} className="text-sm font-semibold text-[#5B3DF5] hover:text-[#4c30dd]">
                Build action plan →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionRow({ row, expanded, onToggle, activeCompetitor, onCompetitorClick, onBuildActionPlan, engineFilter }) {
  return (
    <div>
      <button onClick={onToggle}
        className="w-full text-left px-6 py-5 min-h-[72px] flex items-center gap-4 hover:bg-[#FBFAFE] transition-colors">
        <span className="flex-1 text-base font-semibold text-[#14182B]">{row.prompt}</span>

        <div className="w-32 flex-shrink-0">
          {row.mentioned ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Mentioned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B4632A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E08A45]" />
              Not mentioned
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-52 flex-shrink-0">
          {row.competitorsSurfaced.length === 0 ? (
            <span className="text-sm text-[#9CA3B8]">—</span>
          ) : row.competitorsSurfaced.map(c => (
            <span key={c} role="button" tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onCompetitorClick(c) }}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                activeCompetitor === c ? 'bg-[#5B3DF5] text-white' : 'bg-[#F1EDFF] text-[#5B3DF5] hover:bg-[#E3D9FB]'
              }`}>
              {c}
            </span>
          ))}
        </div>

        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
          row.mentioned ? 'bg-[#DCF7E9] text-emerald-700' : 'bg-[#FFF1E7] text-[#B4632A]'
        }`}>
          {row.mentioned ? 'Covered' : 'Missed'}
        </span>

        <svg className={`w-4 h-4 text-[#9CA3B8] flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <ExpandedDetail row={row} engineFilter={engineFilter} onBuildActionPlan={onBuildActionPlan} />}
    </div>
  )
}

function QuestionCoverageList({ rows, expandedIdx, setExpandedIdx, activeCompetitor, setActiveCompetitor, onBuildActionPlan, engineFilter }) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-[#E7E2F0] rounded-2xl p-8 text-center text-sm text-[#667085]">
        No buyer questions match this filter.
      </div>
    )
  }
  return (
    <div className="bg-white border border-[#E7E2F0] rounded-2xl divide-y divide-[#E7E2F0] overflow-hidden">
      {rows.map((row) => (
        <QuestionRow key={row.prompt} row={row}
          expanded={expandedIdx === row.prompt} onToggle={() => setExpandedIdx(expandedIdx === row.prompt ? null : row.prompt)}
          activeCompetitor={activeCompetitor} onCompetitorClick={(c) => setActiveCompetitor(activeCompetitor === c ? null : c)}
          onBuildActionPlan={onBuildActionPlan} engineFilter={engineFilter} />
      ))}
    </div>
  )
}

function CompetitorPresenceMap({ brand, compData, total, onCompetitorClick }) {
  const [hovered, setHovered] = useState(null)
  const topName = compData[0]?.count > 0 ? compData[0].name : null
  const maxCount = Math.max(...compData.map(c => c.count), 1)
  const angles = [270, 0, 90, 180]
  const radius = 95

  return (
    <div className="bg-white border border-[#E7E2F0] rounded-2xl p-7">
      <h2 className="text-xl font-bold text-[#14182B] mb-1">Competitor presence map</h2>
      <p className="text-[#667085] mb-6">Which brands AI brings up when your brand is absent.</p>
      <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
        <div>
          <div className="relative mx-auto" style={{ width: 250, height: 250 }}>
            {[80, 55, 32].map(r => (
              <div key={r} className="absolute border border-[#E7E2F0] rounded-full"
                style={{ width: r * 2, height: r * 2, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            ))}
            <div className="absolute flex flex-col items-center gap-1" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <div className="w-14 h-14 rounded-full bg-[#5B3DF5] flex items-center justify-center text-white text-[10px] font-bold text-center leading-tight px-1">
                {brand.length > 8 ? brand.slice(0, 7) + '…' : brand}
              </div>
            </div>
            {compData.slice(0, 4).map((comp, i) => {
              const angleDeg = angles[i]
              const rad = (angleDeg * Math.PI) / 180
              const x = 125 + Math.cos(rad) * radius
              const y = 125 + Math.sin(rad) * radius
              const size = Math.max(34, Math.min(58, 34 + (comp.count / maxCount) * 24))
              const isTop = comp.name === topName
              const bg = isTop ? 'bg-[#FFB27A]' : comp.count > 0 ? 'bg-[#C9C2E0]' : 'bg-[#EDEAF5]'
              const text = isTop || comp.count > 0 ? 'text-white' : 'text-[#9CA3B8]'
              return (
                <div key={comp.name} className="absolute flex flex-col items-center gap-1 cursor-pointer group"
                  style={{ left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 5 }}
                  onMouseEnter={() => setHovered(comp.name)} onMouseLeave={() => setHovered(null)}
                  onClick={() => onCompetitorClick(comp.name)}>
                  <div className={`relative rounded-full flex items-center justify-center text-[10px] font-bold transition-transform group-hover:scale-105 ${bg} ${text}`}
                    style={{ width: size, height: size }}>
                    {comp.count} / {total}
                    {hovered === comp.name && (
                      <div className="absolute bottom-full mb-2 w-44 bg-[#14182B] text-white text-[11px] rounded-lg px-3 py-2 leading-relaxed z-20 text-left">
                        <p className="font-semibold mb-0.5">{comp.name}</p>
                        <p className="text-white/80">{comp.count} of {total} questions</p>
                        {comp.prompts.slice(0, 2).map(p => <p key={p} className="text-white/70 truncate mt-0.5">“{p}”</p>)}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-[#667085] font-medium text-center leading-tight max-w-[84px]">{comp.name}</span>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-[#9CA3B8] text-center mt-3 leading-relaxed">
            Circle size = number of AI answers mentioning the brand<br />Color = relative competitive threat
          </p>
        </div>

        <div>
          <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-3">Competitor mentions</p>
          <div className="space-y-2">
            {compData.map(comp => (
              <div key={comp.name} className={`rounded-xl p-4 transition-all ${comp.name === topName ? 'bg-[#FFF1E7] border border-[#F5DCC4]' : 'border border-[#E7E2F0] hover:border-[#DCD1F7]'}`}>
                <div className="flex items-center justify-between gap-3">
                  <button onClick={() => onCompetitorClick(comp.name)} className="font-semibold text-[#14182B] hover:text-[#5B3DF5] transition-colors text-left">
                    {comp.name}
                  </button>
                  <span className="text-sm text-[#667085] flex-shrink-0">
                    {comp.count > 0 ? `mentioned in ${comp.count} of ${total} question${total === 1 ? '' : 's'}` : 'not mentioned'}
                  </span>
                </div>
                {comp.name === topName && (
                  <button onClick={() => onCompetitorClick(comp.name)} className="text-xs font-semibold text-[#B4632A] hover:underline mt-2">
                    See why {comp.name} is being cited →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HighestPriorityOpportunity({ topCompetitor, brand, llmsQueried, onSeeHowToGetCited }) {
  if (!topCompetitor) return null
  const engineNames = llmsQueried.map(l => LLM_COLORS[l]?.label || l).join(' and ')
  return (
    <div className="bg-[#FFF1E7] border border-[#F5DCC4] rounded-2xl p-8 relative overflow-hidden mt-10">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5B3DF5]" />
      <p className="text-[11px] font-bold text-[#B4632A] uppercase tracking-wide mb-3">Highest-priority opportunity</p>
      <h3 className="text-2xl font-bold text-[#14182B] leading-snug mb-3">Own the conversation {topCompetitor.name} is winning.</h3>
      <p className="text-[15px] text-[#14182B]/90 leading-relaxed mb-6 max-w-2xl">
        AI cited {topCompetitor.name} because it is strongly associated with the buyer questions above. Build content that connects {brand} to that same need.
      </p>
      <button onClick={onSeeHowToGetCited}
        className="inline-flex items-center gap-1.5 bg-[#5B3DF5] hover:bg-[#4c30dd] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm mb-3">
        See how to get cited →
      </button>
      <p className="text-xs text-[#667085]">Based on live AI answers across {engineNames}.</p>
    </div>
  )
}

function AIAnswersTab({ result, onBuildActionPlan }) {
  const brand = result.brand
  const competitors = result.competitors || []
  const llmsQueried = result.llmsQueried || []
  const [engineFilter, setEngineFilter] = useState('all')
  const [activeCompetitor, setActiveCompetitor] = useState(null)
  const [expandedIdx, setExpandedIdx] = useState(null)

  const engines = engineFilter === 'all' ? llmsQueried : [engineFilter]

  const rows = (result.prompts || []).map(prompt => {
    const perEngine = {}
    for (const llm of llmsQueried) {
      perEngine[llm] = (result.visibility?.perLLM?.[llm]?.details || []).find(d => d.question === prompt) || null
    }
    const mentioned = engines.some(llm => perEngine[llm]?.mentions?.[brand])
    const competitorsSurfaced = [...new Set(
      engines.flatMap(llm => Object.keys(perEngine[llm]?.mentions || {}).filter(b => b !== brand && perEngine[llm]?.mentions?.[b]))
    )]
    return { prompt, perEngine, mentioned, competitorsSurfaced }
  })

  const visibleRows = activeCompetitor ? rows.filter(r => r.competitorsSurfaced.includes(activeCompetitor)) : rows
  const total = rows.length
  const citedCount = rows.filter(r => r.mentioned).length
  const missedCount = total - citedCount

  const compData = competitors.map(c => ({
    name: c,
    count: rows.filter(r => r.competitorsSurfaced.includes(c)).length,
    prompts: rows.filter(r => r.competitorsSurfaced.includes(c)).map(r => r.prompt),
  })).sort((a, b) => b.count - a.count)
  const topCompetitor = compData.find(c => c.count > 0) || null

  const handleCompetitorClick = (c) => {
    setActiveCompetitor(prev => prev === c ? null : c)
    document.getElementById('question-coverage-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <EngineFilter value={engineFilter} onChange={(v) => { setEngineFilter(v); setExpandedIdx(null) }} llmsQueried={llmsQueried} />

      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-[#14182B] mb-1.5">Buyer question coverage</h2>
          <p className="text-[#667085]">See which high-intent questions mention your brand—and who appears instead.</p>
        </div>
        <span className="text-xs font-semibold text-[#667085] bg-[#F8F6FE] border border-[#E7E2F0] px-3 py-1.5 rounded-full whitespace-nowrap">
          {total} question{total === 1 ? '' : 's'} tested · {llmsQueried.length} AI engine{llmsQueried.length === 1 ? '' : 's'}
        </span>
      </div>

      <AnswerSummaryRow citedCount={citedCount} total={total} missedCount={missedCount} topCompetitor={topCompetitor} />

      {activeCompetitor && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-[#667085]">Filtered to prompts mentioning</span>
          <span className="text-xs font-semibold bg-[#5B3DF5] text-white px-2.5 py-1 rounded-full">{activeCompetitor}</span>
          <button onClick={() => setActiveCompetitor(null)} className="text-xs font-semibold text-[#5B3DF5] hover:underline">Clear</button>
        </div>
      )}

      <div id="question-coverage-list" className="mb-14 scroll-mt-24">
        <QuestionCoverageList rows={visibleRows} expandedIdx={expandedIdx} setExpandedIdx={setExpandedIdx}
          activeCompetitor={activeCompetitor} setActiveCompetitor={setActiveCompetitor}
          onBuildActionPlan={onBuildActionPlan} engineFilter={engineFilter} />
      </div>

      {competitors.length > 0 && (
        <CompetitorPresenceMap brand={brand} compData={compData} total={total} onCompetitorClick={handleCompetitorClick} />
      )}

      <HighestPriorityOpportunity topCompetitor={topCompetitor} brand={brand} llmsQueried={llmsQueried} onSeeHowToGetCited={onBuildActionPlan} />
    </div>
  )
}

// ─── Tab 3: Site Audit ────────────────────────────────────────────────────────

const BOT_TO_PLATFORM = {
  GPTBot: 'chatgpt',
  'Google-Extended': 'gemini',
  ClaudeBot: 'claude',
  'anthropic-ai': 'claude',
  PerplexityBot: 'perplexity',
}

function getHostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
}

function ClarityIndicator({ level }) {
  const doneCount = level === 'clear' ? 3 : level === 'partial' ? 2 : 1
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < doneCount ? 'bg-[#5B3DF5]' : 'bg-[#E7E2F0]'}`} />
      ))}
    </div>
  )
}

function SiteAuditSummaryRow({ clarityLevel, clarityLabel, allowedCount, totalBots, opportunityTitle, opportunityNote, onViewCrawlerDetails, onSeeRecommendation }) {
  return (
    <div className="grid md:grid-cols-3 gap-5 mb-10">
      <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6">
        <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wide mb-2">AI understanding</p>
        <p className="text-xl font-bold text-[#14182B] mb-3">{clarityLabel}</p>
        <ClarityIndicator level={clarityLevel} />
        <p className="text-sm text-[#667085] mt-3">
          {clarityLevel === 'clear' ? 'AI has a specific read on your category.' : 'AI can access your site, but your offer is described too broadly.'}
        </p>
      </div>
      <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6">
        <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wide mb-2">Crawler access</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-[#E2F8ED] flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <p className="text-xl font-bold text-[#14182B]">{allowedCount} / {totalBots} allowed</p>
        </div>
        <p className="text-sm text-[#667085] mb-2">Major AI crawlers can reach your website.</p>
        <button onClick={onViewCrawlerDetails} className="text-xs font-semibold text-[#5B3DF5] hover:underline">View details ↓</button>
      </div>
      <div className="bg-[#FFF0E5] border border-[#F5DCC4] rounded-2xl p-6">
        <p className="text-[11px] font-bold text-[#B4632A] uppercase tracking-wide mb-2">Biggest opportunity</p>
        <p className="text-xl font-bold text-[#14182B] mb-2">{opportunityTitle}</p>
        <p className="text-sm text-[#667085] mb-2">{opportunityNote}</p>
        <button onClick={onSeeRecommendation} className="text-xs font-semibold text-[#B4632A] hover:underline">See recommendation →</button>
      </div>
    </div>
  )
}

function AIUnderstandingCard({ category, description, clarityLevel, clarityLabel }) {
  return (
    <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6 h-full flex flex-col">
      {category && (
        <div className="mb-4">
          <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wide mb-1">Detected category</p>
          <p className="text-base font-semibold text-[#14182B]">{category}</p>
        </div>
      )}
      {description && (
        <div className="mb-5">
          <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wide mb-2">Key message AI picked up</p>
          <blockquote className="bg-[#F1EDFF] rounded-xl px-4 py-3 text-sm text-[#14182B]/90 leading-relaxed">
            “{description}”
          </blockquote>
        </div>
      )}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wide">Clarity</p>
          <span className="text-xs font-semibold text-[#5B3DF5]">{clarityLabel}</span>
        </div>
        <ClarityIndicator level={clarityLevel} />
        <p className="text-sm text-[#667085] mt-2 leading-relaxed">
          {clarityLevel === 'clear'
            ? 'AI has a specific, well-defined read on what your product does.'
            : clarityLevel === 'partial'
            ? 'AI understands several features, but the core category is not yet obvious.'
            : 'AI could not confidently identify what your product does from this page.'}
        </p>
      </div>
    </div>
  )
}

function RawCrawlerPreview({ pageData }) {
  const [expanded, setExpanded] = useState(false)
  if (!pageData?.crawlerText) return null
  const isLong = pageData.crawlerText.length > 420
  const previewText = expanded || !isLong ? pageData.crawlerText : pageData.crawlerText.slice(0, 420) + '…'

  return (
    <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-bold text-[#14182B]">Raw page content read by crawlers</h3>
        <span className="text-xs font-semibold text-[#667085] bg-[#F8F6FE] border border-[#E7E2F0] px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
          {pageData.wordCount?.toLocaleString()} words indexed
        </span>
      </div>
      <div className="relative flex-1">
        <div className={`bg-[#F8F7F5] border border-[#E7E2F0] rounded-xl p-4 text-sm text-[#14182B]/80 leading-relaxed ${!expanded ? 'max-h-40 overflow-hidden' : ''}`}>
          {previewText}
        </div>
        {!expanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent rounded-b-xl" />
        )}
      </div>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs font-semibold text-[#5B3DF5] hover:text-[#4c30dd] mt-3 self-start">
          {expanded ? 'Show less ←' : 'Show full crawler preview →'}
        </button>
      )}
      <p className="text-xs text-[#9CA3B8] mt-3 truncate">{pageData.url}</p>
    </div>
  )
}

function CrawlerAccessCard({ bot, status, siteUrl }) {
  const platformKey = BOT_TO_PLATFORM[bot]
  const platform = platformKey ? PLATFORM_ICONS[platformKey] : null
  const robotsUrl = (() => { try { return new URL('/robots.txt', siteUrl).href } catch { return null } })()
  const allowed = status === 'allowed'
  const blocked = status === 'blocked'

  return (
    <div className="relative bg-white border border-[#E7E2F0] rounded-xl p-5 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${allowed ? 'bg-[#8FD9AE]' : blocked ? 'bg-[#E08A45]' : 'bg-[#D8D2EE]'}`} />
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {platform && <platform.Icon size={18} />}
          <span className="font-semibold text-[#14182B] truncate">{platform?.label || bot}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 ${
          allowed ? 'bg-[#E2F8ED] text-emerald-700' : blocked ? 'bg-[#FFF0E5] text-[#B4632A]' : 'bg-[#F1EDFF] text-[#667085]'
        }`}>
          {allowed && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {allowed ? 'Allowed' : blocked ? 'Blocked' : 'Unknown'}
        </span>
      </div>
      <p className="text-xs text-[#9CA3B8] mb-2">{bot}</p>
      <p className="text-sm text-[#667085] mb-3 leading-relaxed">
        {allowed ? 'Can access public site content.' : blocked ? 'This crawler is blocked — it limits AI citations.' : 'Access could not be verified.'}
      </p>
      {robotsUrl && (
        <a href={robotsUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#5B3DF5] hover:text-[#4c30dd]">
          View robots.txt rule →
        </a>
      )}
    </div>
  )
}

function CrawlerAccessSection({ crawlerStatus, siteUrl }) {
  const entries = Object.entries(crawlerStatus || {})
  if (entries.length === 0) return null
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#14182B] mb-1.5">Can AI crawlers access your site?</h2>
      <p className="text-[#667085] mb-6">Access is the first step. It does not guarantee citations, but blocked crawlers can limit what AI systems can read.</p>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {entries.map(([bot, status]) => <CrawlerAccessCard key={bot} bot={bot} status={status} siteUrl={siteUrl} />)}
      </div>
      <p className="text-sm text-[#667085] bg-[#F8F6FE] border border-[#E7E2F0] rounded-xl px-4 py-3">
        Good to know: crawler access helps AI systems read your pages, but clear content and credible sources influence whether they cite you.
      </p>
    </div>
  )
}

function SourceRow({ source, rank, maxCount, totalPrompts, isOwnSite, expanded, onToggle }) {
  const pct = Math.round((source.count / maxCount) * 100)
  return (
    <div>
      <button onClick={onToggle} className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-[#FBFAFE] transition-colors">
        <span className="text-sm text-[#9CA3B8] w-4 text-right flex-shrink-0">{rank}</span>
        <img src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`} alt="" className="w-4 h-4 flex-shrink-0" />
        <span className={`text-sm font-semibold flex-shrink-0 w-40 truncate ${isOwnSite ? 'text-[#5B3DF5]' : 'text-[#14182B]'}`}>{source.domain}</span>
        <div className="flex-1 min-w-[60px]">
          <div className="h-2 bg-[#F1EDFF] rounded-full">
            <div className={`h-2 rounded-full ${isOwnSite ? 'bg-[#5B3DF5]' : 'bg-[#E3AE7D]'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="text-xs text-[#667085] flex-shrink-0 hidden sm:block">
          Mentioned in {source.count} / {totalPrompts}
        </span>
        <span className="text-xs font-bold text-[#667085] w-10 text-right flex-shrink-0">{pct}%</span>
        <svg className={`w-3.5 h-3.5 text-[#9CA3B8] flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-5 pb-4 bg-[#FBFAFE] space-y-1.5">
          <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-1">Where it appeared</p>
          {source.occurrences.map((occ, i) => {
            const platform = PLATFORM_ICONS[occ.llm]
            return (
              <div key={i} className="flex items-center gap-2 text-sm text-[#667085]">
                {platform && <platform.Icon size={14} />}
                <span className="truncate">“{occ.question}”</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TopCitedSources({ visibility, siteHostname, totalPrompts }) {
  const [expandedDomain, setExpandedDomain] = useState(null)
  const sources = extractTopDomainsDetailed(visibility)
  if (sources.length === 0) return null
  const maxCount = sources[0].count

  return (
    <div className="bg-white border border-[#E7E2F0] rounded-2xl overflow-hidden">
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-[#14182B] mb-1">Sources AI is citing for your buyer questions</h2>
        <p className="text-[#667085]">These are the domains appearing most often in the answers checked.</p>
      </div>
      <div className="divide-y divide-[#E7E2F0]">
        {sources.map((s, i) => (
          <SourceRow key={s.domain} source={s} rank={i + 1} maxCount={maxCount} totalPrompts={totalPrompts}
            isOwnSite={!!siteHostname && s.domain.includes(siteHostname)}
            expanded={expandedDomain === s.domain} onToggle={() => setExpandedDomain(expandedDomain === s.domain ? null : s.domain)} />
        ))}
      </div>
    </div>
  )
}

function WhatToFixFirst({ brand, onBuildActionPlan }) {
  return (
    <div className="bg-[#FFF0E5] border border-[#F5DCC4] rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5B3DF5]" />
      <p className="text-[11px] font-bold text-[#B4632A] uppercase tracking-wide mb-3">What to fix first</p>
      <h3 className="text-2xl font-bold text-[#14182B] leading-snug mb-3">Make your category obvious in the first screen of your homepage.</h3>
      <p className="text-[15px] text-[#14182B]/90 leading-relaxed mb-5 max-w-2xl">
        AI can read your site, but it is picking up many features before it understands the one clear problem {brand} solves.
      </p>
      <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-2">Recommended improvements</p>
      <ul className="space-y-2 mb-6">
        {[
          'Add a direct category statement under your hero headline',
          'Mention your ideal customer in plain language',
          'Create one dedicated page for your strongest use case',
          'Add proof points that show why buyers should choose you',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[#5B3DF5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-[#14182B]/90 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
      <button onClick={onBuildActionPlan}
        className="inline-flex items-center gap-1.5 bg-[#5B3DF5] hover:bg-[#4c30dd] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm mb-3">
        Build my AI visibility action plan →
      </button>
      <p className="text-xs text-[#667085]">Based on your site content, crawler access, and live AI-answer patterns.</p>
    </div>
  )
}

// ─── Tab: Prompts ─────────────────────────────────────────────────────────────

const LS_CUSTOM_PROMPTS = 'peach_custom_prompts'
const LS_BRAND_KEYWORDS = 'peach_brand_keywords'

function AddPromptModal({ onClose, onSave }) {
  const [text, setText] = useState('')
  const [intent, setIntent] = useState('Other')
  const [priority, setPriority] = useState('Medium')
  const [persona, setPersona] = useState('')
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-[#14182B]">Add prompt</h3>
          <button onClick={onClose} className="text-[#667085] hover:text-[#14182B]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <p className="text-sm text-[#667085] mb-5">Save a buyer question you already know you want to track.</p>
        <label className="block text-sm font-semibold text-[#14182B] mb-1.5">Prompt</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
          placeholder="What is the best AI SEO platform for agencies?"
          className="w-full border border-[#E7E2F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5] resize-none mb-4" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-[#14182B] mb-1.5">Intent</label>
            <select value={intent} onChange={e => setIntent(e.target.value)}
              className="w-full border border-[#E7E2F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]">
              {['Awareness','Consideration','Decision','Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#14182B] mb-1.5">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="w-full border border-[#E7E2F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]">
              {['High','Medium','Low'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#14182B] mb-1.5">Persona</label>
          <input value={persona} onChange={e => setPersona(e.target.value)} placeholder="agency owner"
            className="w-full border border-[#E7E2F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]" />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-[#E7E2F0] rounded-xl hover:bg-gray-50">Cancel</button>
          <button disabled={!text.trim()} onClick={() => { onSave({ text: text.trim(), intent, priority, persona, custom: true }); onClose() }}
            className="px-4 py-2 text-sm font-semibold bg-[#5B3DF5] text-white rounded-xl hover:bg-[#4c30dd] disabled:opacity-40">Save prompt</button>
        </div>
      </div>
    </div>
  )
}

function GeneratePromptsModal({ existing, onClose, onSave }) {
  const [batch, setBatch] = useState(10)
  const suggestions = existing.slice(0, batch)
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-[#14182B]">Generate prompts</h3>
          <button onClick={onClose} className="text-[#667085] hover:text-[#14182B]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <p className="text-sm text-[#667085] mb-5">Choose how many buyer questions to draft. You can review, remove, or skip any prompt before saving.</p>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-[#14182B]">Batch size</label>
            <span className="text-sm font-bold text-[#14182B] border border-[#E7E2F0] rounded-lg px-3 py-1">{batch}</span>
          </div>
          <div className="flex gap-3 mb-3">
            {[5, 8, existing.length || 10].map(n => (
              <button key={n} onClick={() => setBatch(n)}
                className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${batch === n ? 'border-[#14182B] bg-[#14182B] text-white' : 'border-[#E7E2F0] text-[#667085] hover:border-[#14182B]'}`}>
                {batch === n && '✓ '}{n}
              </button>
            ))}
          </div>
          <input type="range" min={1} max={existing.length || 10} value={batch} onChange={e => setBatch(Number(e.target.value))}
            className="w-full accent-[#14182B]" />
          <div className="flex justify-between text-xs text-[#667085] mt-1"><span>1</span><span>{existing.length || 10}</span></div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-[#E7E2F0] rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={() => {
            suggestions.forEach(p => onSave({ text: p, intent: 'Other', priority: 'Medium', persona: '', custom: true }))
            onClose()
          }} className="px-4 py-2 text-sm font-semibold bg-[#5B3DF5] text-white rounded-xl hover:bg-[#4c30dd]">
            Generate {batch} prompt{batch !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

function LLMStatusDots({ prompt, visibility, brand, llmsQueried }) {
  return (
    <div className="flex items-center gap-1.5">
      {(llmsQueried || []).map(llm => {
        const detail = visibility?.perLLM?.[llm]?.details?.find(d => d.question === prompt)
        const cited = detail?.mentions?.[brand] === true
        const colors = { chatgpt: cited ? '#10B981' : '#EF4444', gemini: cited ? '#3B82F6' : '#EF4444', googleaio: cited ? '#F59E0B' : '#EF4444' }
        const color = colors[llm] || (cited ? '#10B981' : '#EF4444')
        const labels = { chatgpt: 'GPT', gemini: 'Gemini', googleaio: 'AIO' }
        return (
          <span key={llm} title={`${labels[llm] || llm}: ${cited ? 'cited' : 'not cited'}`}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
            style={{ color, borderColor: color + '40', background: color + '12' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
            {labels[llm] || llm}
          </span>
        )
      })}
    </div>
  )
}

// ─── Run Confirm Modal ────────────────────────────────────────────────────────

function RunConfirmModal({ promptCount, llmsQueried, onConfirm, onClose }) {
  const llmCount = llmsQueried.length
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2F0]">
          <h3 className="text-base font-bold text-[#14182B]">Run {promptCount} prompt{promptCount !== 1 ? 's' : ''} now?</h3>
          <button onClick={onClose} className="text-[#9CA3B8] hover:text-[#14182B]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm text-[#4B5563]">
          <p>Run now checks {promptCount === 1 ? 'this prompt' : 'these prompts'} across {llmCount} AI platform{llmCount !== 1 ? 's' : ''} and will use {promptCount * llmCount} AI checks.</p>
          <p className="font-semibold text-[#14182B]">{promptCount * llmCount} AI check{promptCount * llmCount !== 1 ? 's' : ''} will be used.</p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E7E2F0] bg-[#FAFAFA]">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold border border-[#E7E2F0] rounded-xl hover:bg-white">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2.5 text-sm font-semibold bg-[#5B3DF5] text-white rounded-xl hover:bg-[#4c30dd]">
            Run {promptCount} prompt{promptCount !== 1 ? 's' : ''} now
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Running Coverage Panel ───────────────────────────────────────────────────

function RunningCoveragePanel({ llmsQueried, platformStatuses, completedCount }) {
  const total = llmsQueried.length
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100)
  const allDone = completedCount === total

  const llmLabels = { chatgpt: 'ChatGPT', gemini: 'Gemini', googleaio: 'Google AIO' }
  const llmIcons = {
    chatgpt: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M22.28 9.16a5.83 5.83 0 00-.5-4.79 5.9 5.9 0 00-6.33-2.83A5.88 5.88 0 009.1 0 5.9 5.9 0 003.27 4a5.86 5.86 0 00-3.92 2.84 5.9 5.9 0 00.73 6.91 5.84 5.84 0 00.5 4.79 5.9 5.9 0 006.33 2.83A5.87 5.87 0 0012.17 24a5.9 5.9 0 005.83-4.09 5.86 5.86 0 003.92-2.84 5.9 5.9 0 00-.64-6.91z"/></svg>,
    gemini: <svg viewBox="0 0 24 24" className="w-5 h-5"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4285F4"/><stop offset="100%" stopColor="#9B72CB"/></linearGradient></defs><path d="M12 2L6 12l6 10 6-10z" fill="url(#g1)"/></svg>,
    googleaio: <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#EA4335"/><path d="M12 6v12" stroke="white" strokeWidth="2"/><path d="M6 12h12" stroke="white" strokeWidth="2"/></svg>,
  }

  return (
    <div className="bg-white border border-[#E7E2F0] rounded-2xl p-8 mb-8">
      {/* Spinner */}
      <div className="flex flex-col items-center mb-6">
        <div className={`w-12 h-12 rounded-full border-4 mb-4 ${allDone ? 'border-[#10B981]' : 'border-[#5B3DF5] border-t-transparent animate-spin'}`} />
        <h3 className="text-lg font-bold text-[#14182B] mb-1">
          {allDone ? 'Coverage complete' : 'Reading AI answers in parallel'}
        </h3>
        <p className="text-sm text-[#667085] text-center">
          {allDone ? 'Results updated in prompt table below.' : 'Running saved prompts across ' + llmsQueried.map(l => llmLabels[l] || l).join(', ') + '.'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="bg-[#F3F4F6] rounded-full overflow-hidden mb-2 h-2.5">
          <div className="h-2.5 rounded-full bg-[#14182B] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-[#667085]">
          <span>{allDone ? 'Complete' : 'Processing'}</span>
          <span>{pct}%</span>
        </div>
        <p className="text-xs text-[#9CA3B8] text-center mt-1">{completedCount} of {total} checks complete</p>
      </div>

      {/* Per-platform status */}
      <div className="flex gap-4 justify-center flex-wrap">
        {llmsQueried.map(llm => {
          const status = platformStatuses[llm] || 'queued'
          const statusColors = { queued: '#9CA3B8', running: '#F59E0B', done: '#10B981' }
          const statusLabels = { queued: 'Queued', running: 'Running', done: 'Done' }
          const color = statusColors[status]
          return (
            <div key={llm} className="flex-1 min-w-[140px] max-w-[200px] border border-[#E7E2F0] rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#14182B]">
                {llmIcons[llm]}
                <span className="text-sm font-semibold">{llmLabels[llm] || llm}</span>
              </div>
              <span className="text-xs font-semibold flex items-center gap-1" style={{ color }}>
                {status === 'running' && <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/></svg>}
                {status === 'done' && '✓ '}
                {statusLabels[status]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PromptsTab({ result }) {
  const [customPrompts, setCustomPrompts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_CUSTOM_PROMPTS)) || [] } catch { return [] }
  })
  const [keywords, setKeywords] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_BRAND_KEYWORDS)) || [] } catch { return [] }
  })
  const [kwInput, setKwInput] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  const [page, setPage] = useState(0)
  const [runConfirmPrompts, setRunConfirmPrompts] = useState(null) // array of prompt texts to run
  const [runState, setRunState] = useState(null) // null | { platformStatuses, completedCount, prompts }
  const [customResults, setCustomResults] = useState({}) // promptText → { pct, domainCount, llmsQueried }
  const PER_PAGE = 10

  const saveCustom = (p) => {
    const next = [...customPrompts, p]
    setCustomPrompts(next)
    localStorage.setItem(LS_CUSTOM_PROMPTS, JSON.stringify(next))
  }
  const removeCustom = (i) => {
    const next = customPrompts.filter((_, idx) => idx !== i)
    setCustomPrompts(next)
    localStorage.setItem(LS_CUSTOM_PROMPTS, JSON.stringify(next))
  }

  const startRun = async (prompts) => {
    const llmsQueried = result.llmsQueried || ['chatgpt', 'gemini']
    // initialise all platforms as queued
    const initStatuses = Object.fromEntries(llmsQueried.map(l => [l, 'queued']))
    setRunState({ platformStatuses: initStatuses, completedCount: 0, prompts })
    setRunConfirmPrompts(null)

    // stagger platform status animations
    const delay = (ms) => new Promise(r => setTimeout(r, ms))
    const animateRun = async () => {
      for (let i = 0; i < llmsQueried.length; i++) {
        const llm = llmsQueried[i]
        await delay(400 * i)
        setRunState(prev => ({
          ...prev,
          platformStatuses: { ...prev.platformStatuses, [llm]: 'running' },
        }))
      }
    }
    animateRun()

    try {
      const res = await fetch('/api/v3/check-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: result.brand, prompts, llms: llmsQueried }),
      })
      const data = await res.json()

      // mark all platforms done
      const doneStatuses = Object.fromEntries(llmsQueried.map(l => [l, 'done']))
      setRunState(prev => ({ ...prev, platformStatuses: doneStatuses, completedCount: llmsQueried.length }))

      // extract results per prompt
      const newResults = { ...customResults }
      const domainRegex = /\b([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:com|io|ai|co|org|net|app|dev))\b/g
      for (const promptText of prompts) {
        const cited = llmsQueried.filter(llm => {
          const d = data.visibility?.perLLM?.[llm]?.details?.find(x => x.question === promptText)
          return d?.mentions?.[result.brand] === true
        }).length
        const pct = Math.round((cited / llmsQueried.length) * 100)
        const seen = new Set()
        for (const llm of llmsQueried) {
          const d = data.visibility?.perLLM?.[llm]?.details?.find(x => x.question === promptText)
          if (d?.answer) for (const m of d.answer.matchAll(domainRegex)) seen.add(m[1].toLowerCase())
        }
        newResults[promptText] = { pct, domainCount: seen.size, llmsQueried, ran: true }
      }
      setCustomResults(newResults)

      // dismiss panel after short delay
      await delay(1800)
      setRunState(null)
    } catch (err) {
      setRunState(null)
      alert('Run failed: ' + err.message)
    }
  }
  const addKeyword = () => {
    if (!kwInput.trim() || keywords.length >= 20) return
    const next = [...keywords, kwInput.trim()]
    setKeywords(next)
    localStorage.setItem(LS_BRAND_KEYWORDS, JSON.stringify(next))
    setKwInput('')
  }
  const removeKeyword = (i) => {
    const next = keywords.filter((_, idx) => idx !== i)
    setKeywords(next)
    localStorage.setItem(LS_BRAND_KEYWORDS, JSON.stringify(next))
  }

  const basePrompts = (result.prompts || []).map(p => ({ text: p, custom: false }))
  const allPrompts = [...basePrompts, ...customPrompts]
  const paged = allPrompts.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const totalPages = Math.ceil(allPrompts.length / PER_PAGE)

  const getVisibilityPct = (prompt) => {
    const llms = result.llmsQueried || []
    if (!llms.length) return 0
    const cited = llms.filter(llm => {
      const d = result.visibility?.perLLM?.[llm]?.details?.find(x => x.question === prompt)
      return d?.mentions?.[result.brand] === true
    }).length
    return Math.round((cited / llms.length) * 100)
  }

  const getDomainCount = (prompt) => {
    const domainRegex = /\b([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:com|io|ai|co|org|net|app|dev))\b/g
    const seen = new Set()
    for (const llm of (result.llmsQueried || [])) {
      const d = result.visibility?.perLLM?.[llm]?.details?.find(x => x.question === prompt)
      if (d?.answer) for (const m of d.answer.matchAll(domainRegex)) seen.add(m[1].toLowerCase())
    }
    return seen.size
  }

  const pendingCustom = customPrompts.filter(p => !customResults[p.text]?.ran)

  return (
    <div>
      {showAdd && <AddPromptModal onClose={() => setShowAdd(false)} onSave={saveCustom} />}
      {showGenerate && <GeneratePromptsModal existing={result.prompts || []} onClose={() => setShowGenerate(false)} onSave={saveCustom} />}
      {runConfirmPrompts && (
        <RunConfirmModal
          promptCount={runConfirmPrompts.length}
          llmsQueried={result.llmsQueried || ['chatgpt', 'gemini']}
          onClose={() => setRunConfirmPrompts(null)}
          onConfirm={() => startRun(runConfirmPrompts)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#14182B]">Prompt library</h2>
          <p className="text-sm text-[#667085]">Manage saved prompts for AI visibility coverage.</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCustom.length > 0 && !runState && (
            <button onClick={() => setRunConfirmPrompts(pendingCustom.map(p => p.text))}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold border border-[#E7E2F0] rounded-xl bg-white hover:bg-[#F8F6FE] text-[#14182B]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Running coverage
            </button>
          )}
          <button onClick={() => setShowGenerate(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold border border-[#E7E2F0] rounded-xl bg-white hover:bg-[#F8F6FE] text-[#14182B]">
            ⚡ Generate prompts
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-[#5B3DF5] text-white rounded-xl hover:bg-[#4c30dd]">
            + Add prompt
          </button>
        </div>
      </div>

      {/* Running coverage panel */}
      {runState && (
        <RunningCoveragePanel
          llmsQueried={result.llmsQueried || ['chatgpt', 'gemini']}
          platformStatuses={runState.platformStatuses}
          completedCount={runState.completedCount}
        />
      )}

      {/* Prompt table */}
      <div className="bg-white border border-[#E7E2F0] rounded-2xl overflow-hidden mb-8">
        <div className="grid text-xs font-bold text-[#667085] uppercase tracking-wide px-5 py-3 border-b border-[#E7E2F0] bg-[#FAFAFA]"
          style={{ gridTemplateColumns: '1fr 200px 80px 60px 80px' }}>
          <span>Prompt</span>
          <span>Platforms</span>
          <span className="text-right">Visibility</span>
          <span className="text-right">Sources</span>
          <span />
        </div>
        {paged.length === 0 && (
          <p className="text-sm text-[#667085] text-center py-10">No prompts yet. Add one above or run an analysis.</p>
        )}
        {paged.map((p, i) => (
          <div key={i} className="grid items-center px-5 py-3.5 border-b border-[#F0EBF8] hover:bg-[#FAFAFA] transition-colors"
            style={{ gridTemplateColumns: '1fr 200px 80px 60px 80px' }}>
            <div className="flex items-center gap-2 pr-4 min-w-0">
              <span className="text-sm text-[#14182B] truncate">{p.text}</span>
              {p.custom && <span className="text-[10px] font-bold text-[#5B3DF5] bg-[#F1EDFF] px-1.5 py-0.5 rounded-full shrink-0">custom</span>}
            </div>
            {(() => {
              const cr = p.custom ? customResults[p.text] : null
              const hasRun = cr?.ran
              return (
                <>
                  <div>
                    {p.custom && !hasRun
                      ? <span className="text-xs text-[#9CA3B8]">Not yet run</span>
                      : <LLMStatusDots
                          prompt={p.text}
                          visibility={hasRun ? { perLLM: Object.fromEntries((cr.llmsQueried || []).map(llm => [llm, { details: [{ question: p.text, mentions: { [result.brand]: cr.pct > 0 } }] }])) } : result.visibility}
                          brand={result.brand}
                          llmsQueried={hasRun ? cr.llmsQueried : result.llmsQueried}
                        />
                    }
                  </div>
                  <div className="text-right">
                    {p.custom && !hasRun
                      ? <span className="text-xs text-[#9CA3B8]">—</span>
                      : <span className={`text-sm font-bold ${(hasRun ? cr.pct : getVisibilityPct(p.text)) > 0 ? 'text-[#10B981]' : 'text-[#667085]'}`}>
                          {hasRun ? cr.pct : getVisibilityPct(p.text)}%
                        </span>
                    }
                  </div>
                  <div className="text-right">
                    {p.custom && !hasRun
                      ? <span className="text-xs text-[#9CA3B8]">—</span>
                      : <span className="text-sm text-[#667085]">{hasRun ? cr.domainCount : getDomainCount(p.text)}</span>
                    }
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    {p.custom && !hasRun && !runState && (
                      <button onClick={() => setRunConfirmPrompts([p.text])}
                        title="Run this prompt now"
                        className="text-xs font-semibold text-[#5B3DF5] hover:text-[#4c30dd] border border-[#D8D0FA] rounded-lg px-2 py-1 hover:bg-[#F1EDFF]">
                        Run
                      </button>
                    )}
                    {p.custom && (
                      <button onClick={() => removeCustom(customPrompts.indexOf(p))} className="text-[#9CA3B8] hover:text-red-400 p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 text-xs text-[#667085]">
          <span>Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, allPrompts.length)} of {allPrompts.length}</span>
          <div className="flex items-center gap-2">
            <span>Rows per page <strong>10</strong></span>
            <span>Page {page + 1} of {totalPages}</span>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-1 rounded border border-[#E7E2F0] disabled:opacity-30 hover:bg-gray-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-1 rounded border border-[#E7E2F0] disabled:opacity-30 hover:bg-gray-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Brand keywords */}
      <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#14182B]">Brand keywords</h3>
            <span title="Used to generate buyer-like prompts" className="text-[#9CA3B8] cursor-help">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
          </div>
          <button className="px-3 py-1.5 text-xs font-semibold bg-[#5B3DF5] text-white rounded-lg hover:bg-[#4c30dd]">Generate keywords</button>
        </div>
        <p className="text-xs text-[#667085] mb-4">Used to generate buyer-like prompts.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map((kw, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs font-medium bg-[#F8F6FE] border border-[#E7E2F0] text-[#14182B] px-3 py-1.5 rounded-full">
              {kw}
              <button onClick={() => removeKeyword(i)} className="text-[#9CA3B8] hover:text-red-400">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addKeyword()}
            placeholder="Add a keyword angle" className="flex-1 border border-[#E7E2F0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]" />
          <button onClick={addKeyword} disabled={keywords.length >= 20}
            className="px-3 py-2 text-sm font-semibold border border-[#E7E2F0] rounded-xl hover:bg-[#F8F6FE] disabled:opacity-40">+ Add</button>
        </div>
        <p className="text-xs text-[#667085] mt-3">{keywords.length} / 20 keywords · {keywords.length > 0 ? 'Saved' : 'None yet'}</p>
      </div>
    </div>
  )
}

// ─── Tab: Competitors ─────────────────────────────────────────────────────────

function CompetitorsTab({ result }) {
  const { visibility, competitors = [], brand, llmsQueried = [] } = result

  const competitorData = competitors.map(comp => {
    let totalCited = 0, totalQuestions = 0
    const evidence = []
    for (const llm of llmsQueried) {
      const details = visibility?.perLLM?.[llm]?.details || []
      for (const d of details) {
        totalQuestions++
        if (d.mentions?.[comp]) {
          totalCited++
          if (evidence.length < 2) evidence.push({ llm, question: d.question, snippet: extractSnippet(d.answer, comp) })
        }
      }
    }
    const pct = totalQuestions ? Math.round((totalCited / totalQuestions) * 100) : 0
    return { name: comp, pct, cited: totalCited, total: totalQuestions, evidence }
  }).sort((a, b) => b.pct - a.pct)

  const brandData = (() => {
    let cited = 0, total = 0
    for (const llm of llmsQueried) {
      const details = visibility?.perLLM?.[llm]?.details || []
      for (const d of details) { total++; if (d.mentions?.[brand]) cited++ }
    }
    return { pct: total ? Math.round((cited / total) * 100) : 0, cited, total }
  })()

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#14182B] mb-1">Competitor visibility</h2>
        <p className="text-sm text-[#667085]">How often each brand appears in AI answers across all prompts and platforms.</p>
      </div>

      {/* Summary row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-[#E7E2F0] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-1">Your brand</p>
          <p className="text-3xl font-bold text-[#14182B]">{brandData.pct}%</p>
          <p className="text-xs text-[#667085] mt-1">{brandData.cited} of {brandData.total} answers</p>
        </div>
        {competitorData.slice(0, 3).map(c => (
          <div key={c.name} className="bg-white border border-[#E7E2F0] rounded-2xl p-5">
            <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-1">{c.name}</p>
            <p className={`text-3xl font-bold ${c.pct > brandData.pct ? 'text-red-500' : 'text-[#14182B]'}`}>{c.pct}%</p>
            <p className="text-xs text-[#667085] mt-1">{c.cited} of {c.total} answers</p>
          </div>
        ))}
      </div>

      {/* Competitor detail cards */}
      <div className="space-y-6">
        {competitorData.map(c => (
          <div key={c.name} className="bg-white border border-[#E7E2F0] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-sm font-bold text-[#5B3DF5]">
                  {c.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#14182B]">{c.name}</p>
                  <p className="text-xs text-[#667085]">{c.cited} mentions across {llmsQueried.length} platform{llmsQueried.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${c.pct > brandData.pct ? 'text-red-500' : 'text-[#10B981]'}`}>{c.pct}%</p>
                <p className="text-xs text-[#667085]">citation rate</p>
              </div>
            </div>
            {/* Bar */}
            <div className="relative h-2 bg-[#F0EBF8] rounded-full mb-4">
              <div className="absolute left-0 top-0 h-2 rounded-full bg-[#5B3DF5]" style={{ width: `${c.pct}%` }} />
              <div className="absolute top-0 h-2 rounded-full bg-[#10B981] opacity-30" style={{ left: 0, width: `${brandData.pct}%` }} />
            </div>
            {c.evidence.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#667085] uppercase tracking-wide">Where AI cited them</p>
                {c.evidence.map((ev, i) => (
                  <div key={i} className="bg-[#FAFAFA] border border-[#F0EBF8] rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#5B3DF5] mb-1">{ev.llm === 'chatgpt' ? 'ChatGPT' : ev.llm === 'gemini' ? 'Gemini' : ev.llm} · "{ev.question}"</p>
                    <p className="text-sm text-[#14182B] leading-relaxed">…{ev.snippet}…</p>
                  </div>
                ))}
              </div>
            )}
            {c.pct === 0 && <p className="text-sm text-[#10B981]">✓ Not cited in any AI answer in this run.</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Citations ───────────────────────────────────────────────────────────

function classifyDomain(domain, brand, competitors) {
  const d = domain.toLowerCase()
  if (brand && d.includes(brand.toLowerCase())) return 'your'
  if (competitors?.some(c => d.includes(c.toLowerCase()))) return 'competitor'
  return 'third-party'
}

function CitationsTab({ result }) {
  const { visibility, brand, competitors = [], llmsQueried = [], prompts = [] } = result
  const [citePage, setCitePage] = useState(0)
  const CITE_PER_PAGE = 10

  const domainRegex = /\b([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:com|io|ai|co|org|net|app|dev))\b/g

  // Build full domain map (no slice)
  const fullMap = {}
  for (const [llm, llmData] of Object.entries(visibility?.perLLM || {})) {
    for (const { question, answer } of llmData.details || []) {
      if (!answer) continue
      const seen = new Set()
      for (const m of answer.matchAll(domainRegex)) {
        const d = m[1].toLowerCase()
        if (seen.has(d)) continue
        seen.add(d)
        if (!fullMap[d]) fullMap[d] = { domain: d, count: 0, llms: new Set(), questions: new Set(), type: classifyDomain(d, brand, competitors) }
        fullMap[d].count++
        fullMap[d].llms.add(llm)
        fullMap[d].questions.add(question)
      }
    }
  }
  const allDomains = Object.values(fullMap).sort((a, b) => b.count - a.count)
  const totalCitations = allDomains.reduce((s, d) => s + d.count, 0)
  const influentialCount = allDomains.length
  const competitorCitations = allDomains.filter(d => d.type === 'competitor').reduce((s, d) => s + d.count, 0)
  const thirdPartyCitations = allDomains.filter(d => d.type === 'third-party').reduce((s, d) => s + d.count, 0)

  // Per-LLM breakdown for platform citation mix
  const perLLMDomains = {}
  for (const llm of llmsQueried) {
    const map = {}
    for (const { answer } of (visibility?.perLLM?.[llm]?.details || [])) {
      if (!answer) continue
      const seen = new Set()
      for (const m of answer.matchAll(domainRegex)) {
        const d = m[1].toLowerCase()
        if (seen.has(d)) continue
        seen.add(d)
        const type = classifyDomain(d, brand, competitors)
        map[type] = (map[type] || 0) + 1
      }
    }
    perLLMDomains[llm] = map
  }

  // Top cited prompts (by total domain citations per prompt)
  const promptCitations = prompts.map(q => {
    let total = 0, yourCount = 0
    for (const llm of llmsQueried) {
      const d = visibility?.perLLM?.[llm]?.details?.find(x => x.question === q)
      if (!d?.answer) continue
      const seen = new Set()
      for (const m of d.answer.matchAll(domainRegex)) {
        const dom = m[1].toLowerCase()
        if (seen.has(dom)) continue
        seen.add(dom)
        total++
        if (classifyDomain(dom, brand, competitors) === 'your') yourCount++
      }
    }
    return { question: q, total, your: yourCount }
  }).sort((a, b) => b.total - a.total)

  const pagedDomains = allDomains.slice(citePage * CITE_PER_PAGE, (citePage + 1) * CITE_PER_PAGE)
  const totalCitePages = Math.ceil(allDomains.length / CITE_PER_PAGE)

  const llmLabel = { chatgpt: 'ChatGPT', gemini: 'Gemini', googleaio: 'Google AIO' }
  const typeColors = { your: '#10B981', competitor: '#EF4444', 'third-party': '#6366F1' }
  const typeLabels = { your: 'Your domain', competitor: 'Competitor domains', 'third-party': 'Third-party sources' }

  return (
    <div>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Influential domains', value: influentialCount, icon: '🌐' },
          { label: 'Cited URLs', value: totalCitations, icon: '🔗' },
          { label: 'Competitor citations', value: competitorCitations, icon: '⚔️' },
          { label: 'Third-party opportunities', value: thirdPartyCitations, icon: '💡' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-[#E7E2F0] rounded-2xl p-5">
            <p className="text-xs text-[#667085] mb-1 flex items-center gap-1"><span>{icon}</span>{label}</p>
            <p className="text-3xl font-bold text-[#14182B]">{value}</p>
          </div>
        ))}
      </div>

      {/* Platform citation mix */}
      {llmsQueried.length > 0 && (
        <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6 mb-6">
          <h3 className="text-base font-bold text-[#14182B] mb-1">Platform citation mix</h3>
          <p className="text-xs text-[#667085] mb-5">Your domain, competitor domain, and third-party source citations by answer engine.</p>
          <div className="space-y-4">
            {llmsQueried.map(llm => {
              const d = perLLMDomains[llm] || {}
              const total = (d.your || 0) + (d.competitor || 0) + (d['third-party'] || 0) || 1
              return (
                <div key={llm}>
                  <p className="text-xs font-semibold text-[#667085] mb-1.5">{llmLabel[llm] || llm}</p>
                  <div className="flex h-5 rounded-full overflow-hidden">
                    {['your', 'competitor', 'third-party'].map(type => {
                      const w = Math.round(((d[type] || 0) / total) * 100)
                      return w > 0 ? <div key={type} style={{ width: `${w}%`, background: typeColors[type] }} title={`${typeLabels[type]}: ${d[type] || 0}`} /> : null
                    })}
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    {['your', 'competitor', 'third-party'].map(type => (
                      <span key={type} className="text-[10px] text-[#667085] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: typeColors[type] }} />{typeLabels[type]}: {d[type] || 0}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Citation source split */}
      {totalCitations > 0 && (
        <div className="bg-white border border-[#E7E2F0] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#14182B]">Citation source split</h3>
            <span className="text-xs text-[#667085]">{totalCitations} total citations</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden mb-2">
            {['your', 'competitor', 'third-party'].map(type => {
              const count = allDomains.filter(d => d.type === type).reduce((s, d) => s + d.count, 0)
              const w = Math.round((count / totalCitations) * 100)
              return w > 0 ? <div key={type} style={{ width: `${w}%`, background: typeColors[type] }} title={`${typeLabels[type]}: ${w}%`} /> : null
            })}
          </div>
          <div className="flex gap-6">
            {['your', 'competitor', 'third-party'].map(type => {
              const count = allDomains.filter(d => d.type === type).reduce((s, d) => s + d.count, 0)
              const w = Math.round((count / totalCitations) * 100)
              return (
                <span key={type} className="text-xs text-[#667085] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: typeColors[type] }} />
                  {typeLabels[type]} · {w}%
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Top cited domains */}
      <div className="bg-white border border-[#E7E2F0] rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[#E7E2F0]">
          <h3 className="text-base font-bold text-[#14182B]">Influential domains</h3>
          <p className="text-xs text-[#667085]">Top source domains by citation share.</p>
        </div>
        <div className="grid text-xs font-bold text-[#667085] uppercase tracking-wide px-5 py-3 border-b border-[#E7E2F0] bg-[#FAFAFA]"
          style={{ gridTemplateColumns: '40px 1fr 140px 140px 80px 80px' }}>
          <span>Rank</span><span>Domain</span><span>Ownership</span><span>Platforms</span><span className="text-right">Share</span><span className="text-right">Citations</span>
        </div>
        {pagedDomains.map((d, i) => {
          const share = totalCitations ? Math.round((d.count / totalCitations) * 100) : 0
          return (
            <div key={d.domain} className="grid items-center px-5 py-3.5 border-b border-[#F0EBF8] hover:bg-[#FAFAFA]"
              style={{ gridTemplateColumns: '40px 1fr 140px 140px 80px 80px' }}>
              <span className="text-sm font-bold text-[#9CA3B8]">{citePage * CITE_PER_PAGE + i + 1}</span>
              <span className="text-sm font-medium text-[#14182B]">{d.domain}</span>
              <span className="text-xs" style={{ color: typeColors[d.type] }}>{typeLabels[d.type]}</span>
              <div className="flex gap-1">
                {[...d.llms].map(llm => (
                  <span key={llm} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F1EDFF] text-[#5B3DF5]">
                    {llmLabel[llm]?.[0] || llm[0].toUpperCase()}
                  </span>
                ))}
              </div>
              <span className="text-sm text-right text-[#667085]">{share}%</span>
              <span className="text-sm text-right font-semibold text-[#14182B]">{d.count}</span>
            </div>
          )
        })}
        <div className="flex items-center justify-between px-5 py-3 text-xs text-[#667085]">
          <span>Page {citePage + 1} of {totalCitePages} · {allDomains.length} rows</span>
          <div className="flex gap-2">
            <button disabled={citePage === 0} onClick={() => setCitePage(p => p - 1)} className="p-1 rounded border border-[#E7E2F0] disabled:opacity-30 hover:bg-gray-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button disabled={citePage >= totalCitePages - 1} onClick={() => setCitePage(p => p + 1)} className="p-1 rounded border border-[#E7E2F0] disabled:opacity-30 hover:bg-gray-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Top cited prompts */}
      <div className="bg-white border border-[#E7E2F0] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E7E2F0]">
          <h3 className="text-base font-bold text-[#14182B]">Top cited prompts</h3>
          <p className="text-xs text-[#667085]">Prompts producing the most website citations.</p>
        </div>
        <div className="grid text-xs font-bold text-[#667085] uppercase tracking-wide px-5 py-3 border-b border-[#E7E2F0] bg-[#FAFAFA]"
          style={{ gridTemplateColumns: '40px 1fr 140px 100px 80px' }}>
          <span>Rank</span><span>Prompt</span><span>Platforms</span><span className="text-right">Your domain</span><span className="text-right">Total</span>
        </div>
        {promptCitations.map((p, i) => (
          <div key={i} className="grid items-center px-5 py-3.5 border-b border-[#F0EBF8] hover:bg-[#FAFAFA]"
            style={{ gridTemplateColumns: '40px 1fr 140px 100px 80px' }}>
            <span className="text-sm font-bold text-[#9CA3B8]">{i + 1}</span>
            <span className="text-sm text-[#14182B] pr-4">{p.question}</span>
            <div className="flex gap-1">
              {llmsQueried.map(llm => (
                <span key={llm} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F1EDFF] text-[#5B3DF5]">
                  {llmLabel[llm]?.[0] || llm[0].toUpperCase()}
                </span>
              ))}
            </div>
            <span className="text-sm text-right text-[#667085]">{p.your}</span>
            <span className="text-sm text-right font-semibold text-[#14182B]">{p.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SiteAuditTab({ result, onBuildActionPlan }) {
  const category = result.category
  const description = result.categoryDescription || ''
  const clarityLevel = category && description.length > 40 ? 'clear' : description.length > 0 ? 'partial' : 'unclear'
  const clarityLabel = clarityLevel === 'clear' ? 'Clear' : clarityLevel === 'partial' ? 'Needs clarity' : 'Unclear'

  const crawlerEntries = Object.entries(result.crawlerStatus || {})
  const allowedCount = crawlerEntries.filter(([, s]) => s === 'allowed').length

  const siteHostname = getHostname(result.pageData?.url)
  const totalPrompts = result.prompts?.length || 0
  const citedSources = extractTopDomainsDetailed(result.visibility).filter(s => !siteHostname || !s.domain.includes(siteHostname))
  const topDomain = citedSources[0] || null

  const opportunityTitle = clarityLevel !== 'clear' ? 'Clarify your category' : (topDomain ? `Outrank ${topDomain.domain}` : 'Keep monitoring')
  const opportunityNote = clarityLevel !== 'clear'
    ? 'AI can access your site, but your offer is described too broadly.'
    : topDomain
      ? `AI is citing ${topDomain.domain} instead of your website for some buyer questions.`
      : 'No major gaps found in this run.'

  return (
    <div>
      <SiteAuditSummaryRow
        clarityLevel={clarityLevel}
        clarityLabel={clarityLabel}
        allowedCount={allowedCount}
        totalBots={crawlerEntries.length}
        opportunityTitle={opportunityTitle}
        opportunityNote={opportunityNote}
        onViewCrawlerDetails={() => document.getElementById('crawler-access-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        onSeeRecommendation={() => document.getElementById('what-to-fix-first')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />

      <div className="mb-14">
        <h2 className="text-2xl font-bold text-[#14182B] mb-1.5">What AI understands about your site</h2>
        <p className="text-[#667085] mb-6">This is the information an AI crawler can extract from your homepage.</p>
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <AIUnderstandingCard category={category} description={description} clarityLevel={clarityLevel} clarityLabel={clarityLabel} />
          <RawCrawlerPreview pageData={result.pageData} />
        </div>
      </div>

      <div id="crawler-access-section" className="mb-14 scroll-mt-24">
        <CrawlerAccessSection crawlerStatus={result.crawlerStatus} siteUrl={result.pageData?.url} />
      </div>

      <div className="mb-10">
        <TopCitedSources visibility={result.visibility} siteHostname={siteHostname} totalPrompts={totalPrompts} />
      </div>

      <div id="what-to-fix-first" className="scroll-mt-24">
        <WhatToFixFirst brand={result.brand} onBuildActionPlan={onBuildActionPlan} />
      </div>
    </div>
  )
}

// ─── Tab 4: Action plan ────────────────────────────────────────────────────────

function classifyIntent(prompt) {
  const p = prompt.toLowerCase()
  if (/\bvs\b|versus|alternative/.test(p)) return 'Comparison'
  if (/^how to|how do|how can|how does/.test(p)) return 'Problem-solving'
  return 'Research'
}

function downloadActionRecommendation(featured, action) {
  const lines = [
    `Buyer question: ${featured.prompt}`,
    action?.action ? `Recommendation: ${action.action}` : '',
    action?.blogs?.[0]?.title ? `Suggested title: ${action.blogs[0].title}` : '',
    action?.why ? `Why this works: ${action.why}` : '',
  ].filter(Boolean)
  const a = document.createElement('a')
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(lines.join('\n\n'))
  a.download = `peach-recommendation-${Date.now()}.txt`
  a.click()
}

function MetaPill({ label }) {
  return <span className="text-xs font-medium text-[#14182B] bg-white/70 border border-[#F5DCC4] px-2.5 py-1 rounded-full whitespace-nowrap">{label}</span>
}

function ActionPlanHeader({ opportunityCount, competitorInsightCount, briefCount }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
      <div>
        <p className="text-[11px] font-bold text-[#5B3DF5] uppercase tracking-widest mb-2">Your AI visibility action plan</p>
        <h1 className="text-3xl font-bold text-[#14182B] mb-2 leading-snug">The fastest path to getting cited more often.</h1>
        <p className="text-[#667085] max-w-xl">Built from the buyer questions where competitors appeared and your brand did not.</p>
      </div>
      <div className="bg-white border border-[#E7E2F0] rounded-xl p-4 space-y-1.5 flex-shrink-0">
        <p className="text-sm text-[#14182B] font-medium">{opportunityCount} high-priority opportunit{opportunityCount === 1 ? 'y' : 'ies'}</p>
        <p className="text-sm text-[#14182B] font-medium">{competitorInsightCount} competitor insight{competitorInsightCount === 1 ? '' : 's'}</p>
        <p className="text-sm text-[#14182B] font-medium">{briefCount} content brief{briefCount === 1 ? '' : 's'} ready</p>
      </div>
    </div>
  )
}

function OpportunityStrip({ featured, onViewRecommendation }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-[#14182B] mb-4">Your highest-priority missed question</h2>
      <div className="relative overflow-hidden bg-[#FFF0E5] border border-[#F5DCC4] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-5">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5B3DF5]" />
        <div className="pl-3 flex-1 min-w-[240px]">
          <p className="text-xs font-bold text-[#B4632A] uppercase tracking-wide mb-1.5">#1 High-impact opportunity</p>
          <p className="text-lg font-bold text-[#14182B] mb-3 leading-snug">“{featured.prompt}”</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <MetaPill label={`Buyer intent: ${featured.intent}`} />
            <MetaPill label={`AI engine: ${featured.engine}`} />
            {featured.competitor && <MetaPill label={`Competitor cited: ${featured.competitor}`} />}
            <MetaPill label={`Priority: ${featured.priority}`} />
          </div>
          <p className="text-xs text-[#667085]">AI cited competitors here, but not your brand.</p>
        </div>
        <button onClick={onViewRecommendation}
          className="bg-[#5B3DF5] hover:bg-[#4c30dd] text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex-shrink-0">
          View recommendation →
        </button>
      </div>
    </div>
  )
}

function StatusSelector({ status, onChange }) {
  const options = ['Not started', 'In progress', 'Published']
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
            status === opt ? 'bg-[#5B3DF5] text-white' : 'bg-white border border-[#E7E2F0] text-[#667085] hover:border-[#DCD1F7]'
          }`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function ContentRecommendationCard({ featured, action, status, onStatusChange, onGenerateBrief, onExport }) {
  const blog = action?.blogs?.[0]
  const suggestedTitle = blog?.title || featured.prompt
  const bestFormat = blog ? 'In-depth guide + downloadable checklist' : (action?.format || 'Long-form guide')
  const includeItems = blog?.outline?.map(o => o.h2).filter(Boolean) || []

  return (
    <div className="bg-white border border-[#E7E2F0] rounded-2xl p-7 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <span className="w-8 h-8 rounded-full bg-[#5B3DF5] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">01</span>
        <h3 className="text-base font-bold text-[#14182B] flex-1 min-w-0">{featured.prompt}</h3>
        <span className="text-xs font-semibold bg-[#FFF0E5] text-[#B4632A] px-2.5 py-1 rounded-full flex-shrink-0">High priority</span>
      </div>
      <div className="mb-5">
        <StatusSelector status={status} onChange={onStatusChange} />
        {status === 'Published' && (
          <p className="text-xs font-medium text-emerald-700 mt-2">Monitor AI visibility for this prompt</p>
        )}
      </div>

      <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-2">Recommended asset</p>
      <p className="text-xl font-bold text-[#14182B] mb-5 leading-snug">A practical guide that answers this question directly</p>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-1">Suggested title</p>
          <p className="text-sm font-semibold text-[#14182B]">“{suggestedTitle}”</p>
        </div>
        <div>
          <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-1">Best format</p>
          <p className="text-sm text-[#14182B]">{bestFormat}</p>
        </div>
        {action?.why && (
          <div>
            <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-1">Why this format</p>
            <p className="text-sm text-[#667085] leading-relaxed">{action.why}</p>
          </div>
        )}
      </div>

      {includeItems.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-2">Include these sections</p>
          <ul className="space-y-1.5">
            {includeItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#5B3DF5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-[#14182B]/90 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex items-center gap-4 pt-2 flex-wrap">
        <button onClick={onGenerateBrief} className="bg-[#5B3DF5] hover:bg-[#4c30dd] text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
          Generate content brief →
        </button>
        <button onClick={onExport} className="text-sm font-semibold text-[#5B3DF5] hover:underline">Export recommendation</button>
      </div>
    </div>
  )
}

function EvidenceBlock({ title, body }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#14182B] mb-1 leading-snug">{title}</p>
      <p className="text-sm text-[#14182B]/70 leading-relaxed">{body}</p>
    </div>
  )
}

function EvidencePanel({ featured, priority }) {
  const confidenceBars = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1
  return (
    <div className="bg-[#F1EDFF] border border-[#DCD1F7] rounded-2xl p-7 h-full flex flex-col">
      <h3 className="text-base font-bold text-[#14182B] mb-4">Why this could get you cited</h3>
      <div className="space-y-4 mb-6 flex-1">
        <EvidenceBlock title="AI already sees this as a high-intent question" body="Buyers ask it when they need a practical, structured answer — not marketing copy." />
        {featured.competitor && (
          <EvidenceBlock
            title={`${featured.competitor} is winning through useful, specific guidance`}
            body="It is associated with solving this exact problem quickly."
          />
        )}
        <EvidenceBlock title="Your site does not clearly own this use case yet" body="There is no focused source AI can confidently cite for this question." />
      </div>
      <div className="border-t border-[#DCD1F7] pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-[#667085] uppercase tracking-wide">Opportunity confidence</p>
          <span className="text-xs font-semibold text-[#5B3DF5]">{featured.priority}</span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < confidenceBars ? 'bg-[#5B3DF5]' : 'bg-white'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CompetitorDifferentiator({ result, competitor }) {
  const [showFull, setShowFull] = useState(false)
  const agg = result.visibility?.aggregatePercentages || {}
  const evidence = competitor ? getCompetitorEvidence(result.visibility, competitor) : []
  if (!competitor || evidence.length === 0) return null
  const best = evidence[0]

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-[#14182B] mb-1">What the competitor is doing differently</h2>
      <p className="text-[#667085] mb-5">This is the pattern AI is rewarding in its answers.</p>
      <div className="bg-white border border-[#E7E2F0] rounded-2xl p-7 grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-sm font-bold text-[#5B3DF5] flex-shrink-0">
              {competitor.charAt(0).toUpperCase()}
            </div>
            <p className="font-bold text-[#14182B]">{competitor}</p>
          </div>
          <p className="text-sm text-[#667085]">Cited in {evidence.length} of {result.prompts?.length} buyer questions</p>
          <p className="text-sm text-[#667085]">{agg[competitor] ?? 0}% mention rate</p>
        </div>
        <div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['Practical help', 'Specialist support', 'Clear use-case language'].map(t => (
              <span key={t} className="text-xs font-medium text-[#667085] bg-[#F8F6FE] border border-[#E7E2F0] px-2.5 py-1 rounded-full">{t}</span>
            ))}
          </div>
          <blockquote className={`text-sm text-[#14182B]/90 bg-[#F1EDFF] rounded-lg px-4 py-3 leading-relaxed mb-3 ${showFull ? '' : 'line-clamp-3'}`}>
            “{best.snippet}”
          </blockquote>
          <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-1">What Peach recommends borrowing</p>
          <p className="text-sm text-[#14182B]/90 leading-relaxed mb-3">Use direct, practical language around the problem your buyer is trying to solve—not only product features.</p>
          <button onClick={() => setShowFull(!showFull)} className="text-sm font-semibold text-[#5B3DF5] hover:underline">
            {showFull ? 'Show less ←' : 'See full competitor answer →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const CHECKLIST_ITEMS = [
  'Use the buyer question in the headline or subheading',
  'Answer the question in the first 100 words',
  'Add a practical framework, template, or checklist',
  'Include proof, examples, or expert insight',
  'Link to the relevant product page naturally',
]

function BeforeYouPublish() {
  const [checked, setChecked] = useState(() => CHECKLIST_ITEMS.map(() => false))
  const doneCount = checked.filter(Boolean).length
  const allDone = doneCount === CHECKLIST_ITEMS.length
  const toggle = (i) => setChecked(prev => prev.map((v, idx) => idx === i ? !v : v))

  return (
    <div className="bg-white border border-[#E7E2F0] rounded-2xl p-7 mb-10">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-base font-bold text-[#14182B]">Before you publish</h3>
        <span className="text-xs font-semibold text-[#667085] bg-[#F8F6FE] border border-[#E7E2F0] px-2.5 py-1 rounded-full">
          {doneCount} of {CHECKLIST_ITEMS.length} completed
        </span>
      </div>
      <ul className="space-y-2.5 mb-4">
        {CHECKLIST_ITEMS.map((item, i) => (
          <li key={item}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} className="mt-1 w-4 h-4 accent-[#5B3DF5]" />
              <span className={`text-sm leading-relaxed ${checked[i] ? 'text-[#9CA3B8] line-through' : 'text-[#14182B]/90'}`}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
      {allDone && (
        <div className="bg-[#E2F8ED] border border-[#BFEDD6] rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">Ready to publish and monitor.</p>
        </div>
      )}
    </div>
  )
}

function ContentBriefModal({ open, onClose, featured, action }) {
  if (!open) return null
  const blog = action?.blogs?.[0]
  return (
    <div className="fixed inset-0 bg-[#14182B]/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-7" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4 gap-4">
          <h3 className="text-lg font-bold text-[#14182B]">Content brief</h3>
          <button onClick={onClose} className="text-[#667085] hover:text-[#14182B] flex-shrink-0">✕</button>
        </div>
        <p className="text-sm text-[#667085] mb-5">Target question: “{featured.prompt}”</p>
        {blog ? (
          <>
            <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-1">Suggested title</p>
            <p className="text-sm font-semibold text-[#14182B] mb-5">{blog.title}</p>
            <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mb-2">Outline</p>
            <div className="space-y-3">
              {(blog.outline || []).map((section, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-[#14182B]">{section.h2}</p>
                  {(section.h3s || []).map((h3, hi) => (
                    <p key={hi} className="text-xs text-[#667085] ml-3 mt-0.5">— {h3}</p>
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-[#667085]">No detailed outline available yet for this prompt.</p>
        )}
      </div>
    </div>
  )
}

function StickyActionFooter({ visible, onGenerateBrief }) {
  if (!visible) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E2F0] shadow-[0_-4px_16px_rgba(20,24,43,0.06)] z-40 print:hidden">
      <div className="max-w-[1180px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-[#14182B]">Next step: Create your content brief</p>
        <button onClick={onGenerateBrief} className="bg-[#5B3DF5] hover:bg-[#4c30dd] text-white font-semibold px-5 py-2 rounded-xl text-sm flex-shrink-0">
          Generate brief →
        </button>
      </div>
    </div>
  )
}

function ActionPlanTab({ result }) {
  const [status, setStatus] = useState('Not started')
  const [briefOpen, setBriefOpen] = useState(false)
  const [footerVisible, setFooterVisible] = useState(false)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const gaps = result.visibility?.gaps || []
  const allZero = Object.values(result.visibility?.aggregatePercentages || {}).every(p => p === 0)
  const brandPct = result.visibility?.aggregatePercentages?.[result.brand] ?? 0
  const actions = result.actions || []
  const gapSource = gaps.length > 0
    ? gaps
    : (allZero ? (result.prompts || []).map(p => ({ question: p, competitorsSeen: result.competitors || [] })) : [])

  const featuredGap = gapSource[0] || null
  const featuredAction = featuredGap ? (actions.find(a => a.gap === featuredGap.question) || actions[0] || null) : null
  const competitor = featuredGap?.competitorsSeen?.[0] || null
  const priorityRaw = featuredAction?.priority || 'medium'
  const engineKey = featuredGap
    ? Object.keys(result.visibility?.perLLM || {}).find(llm =>
        (result.visibility.perLLM[llm]?.details || []).some(d => d.question === featuredGap.question))
    : null

  const featured = featuredGap ? {
    prompt: featuredGap.question,
    intent: classifyIntent(featuredGap.question),
    engine: LLM_COLORS[engineKey]?.label || (result.llmsQueried?.[0] ? LLM_COLORS[result.llmsQueried[0]]?.label : 'ChatGPT'),
    competitor,
    priority: priorityRaw.charAt(0).toUpperCase() + priorityRaw.slice(1),
  } : null

  if (!featuredGap) {
    if (brandPct > 0) {
      return (
        <div className="bg-[#E2F8ED] border border-[#BFEDD6] rounded-2xl p-8 text-center">
          <p className="text-emerald-800 font-semibold text-lg">No gaps — you're appearing across all tested queries!</p>
        </div>
      )
    }
    return null
  }

  const opportunityCount = 1
  const competitorInsightCount = competitor ? 1 : 0
  const briefCount = featuredAction?.blogs?.length ? 1 : 0

  return (
    <div>
      <ActionPlanHeader opportunityCount={opportunityCount} competitorInsightCount={competitorInsightCount} briefCount={briefCount} />

      <OpportunityStrip featured={featured}
        onViewRecommendation={() => document.getElementById('main-recommendation')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />

      <div id="main-recommendation" className="grid lg:grid-cols-2 gap-6 items-stretch mb-2 scroll-mt-24">
        <ContentRecommendationCard featured={featured} action={featuredAction} status={status} onStatusChange={setStatus}
          onGenerateBrief={() => setBriefOpen(true)} onExport={() => downloadActionRecommendation(featured, featuredAction)} />
        <EvidencePanel featured={featured} priority={priorityRaw} />
      </div>
      <div ref={sentinelRef} />

      <div className="mt-12">
        <CompetitorDifferentiator result={result} competitor={competitor} />
      </div>

      <BeforeYouPublish />

      <ContentBriefModal open={briefOpen} onClose={() => setBriefOpen(false)} featured={featured} action={featuredAction} />
      <StickyActionFooter visible={footerVisible} onGenerateBrief={() => setBriefOpen(true)} />
    </div>
  )
}

// ─── URL Mode Result (4 tabs) ─────────────────────────────────────────────────

function UrlModeResult({ result, resultTime, onReset }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const agg = result.visibility?.aggregatePercentages || {}
  const brandPct = agg[result.brand] ?? 0

  return (
    <div className="flex gap-0 min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[#E7E2F0] bg-white sticky top-0 h-screen overflow-y-auto">
        {/* Brand card */}
        <div className="px-4 pt-6 pb-5 border-b border-[#F0EBF8]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#5B3DF5]/10 flex items-center justify-center text-sm font-bold text-[#5B3DF5]">
              {result.brand?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#14182B] truncate">{result.brand}</p>
              <p className="text-[10px] text-[#9CA3B8]">AI Visibility Report</p>
            </div>
          </div>
          {/* Score ring */}
          <div className="flex items-center gap-3 bg-[#F8F6FE] rounded-xl px-3 py-2.5">
            <div className="relative w-10 h-10 shrink-0">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E3D9FB" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#5B3DF5" strokeWidth="3.5"
                  strokeDasharray={`${(brandPct / 100) * 87.96} 87.96`}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#5B3DF5]">{brandPct}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#14182B]">Visibility score</p>
              <p className="text-[10px] text-[#9CA3B8]">{formatReportAge(resultTime)}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {OUTPUT_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === tab
                  ? 'bg-[#F1EDFF] text-[#5B3DF5]'
                  : 'text-[#667085] hover:bg-[#F8F6FE] hover:text-[#14182B]'
              }`}>
              <span className={activeTab === tab ? 'text-[#5B3DF5]' : 'text-[#9CA3B8]'}>
                {TAB_ICONS[tab]}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{tab}</p>
                {TAB_SUBLABELS[tab] && (
                  <p className="text-[10px] text-[#9CA3B8] font-normal truncate">{TAB_SUBLABELS[tab]}</p>
                )}
              </div>
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-[#F0EBF8] space-y-1">
          <ReportActions result={result} onReset={onReset} sidebar />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0">
        {/* Top bar — mobile tabs + export */}
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="lg:hidden">
            <p className="text-lg font-bold text-[#14182B]">{result.brand}</p>
            <p className="text-xs text-[#667085]">{formatReportAge(resultTime)}</p>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-[#14182B]">{activeTab}</h2>
            {TAB_SUBLABELS[activeTab] && <p className="text-xs text-[#9CA3B8]">{TAB_SUBLABELS[activeTab]}</p>}
          </div>
          <div className="hidden lg:block ml-auto">
            <ReportActions result={result} onReset={onReset} />
          </div>
        </div>

        {/* Mobile horizontal tab strip */}
        <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E7E2F0] px-4 overflow-x-auto">
          <div className="flex gap-5">
            {OUTPUT_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`relative py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'text-[#5B3DF5]' : 'text-[#667085]'
                }`}>
                {tab}
                {activeTab === tab && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#5B3DF5] rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          {activeTab === 'Overview' && (
            <OverviewTab
              result={result}
              onViewActionPlan={() => setActiveTab('Growth Actions')}
              onComparePositioning={() => setActiveTab('Prompts')}
            />
          )}
          {activeTab === 'Prompts' && (
            <PromptsTab result={result} onBuildActionPlan={() => setActiveTab('Growth Actions')} />
          )}
          {activeTab === 'Competitors' && (
            <CompetitorsTab result={result} />
          )}
          {activeTab === 'Citations' && (
            <CitationsTab result={result} />
          )}
          {activeTab === 'Growth Actions' && <ActionPlanTab result={result} />}
          {activeTab === 'Site Audit' && (
            <SiteAuditTab result={result} onBuildActionPlan={() => setActiveTab('Growth Actions')} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function V3VisibilityFlow() {
  const navigate = useNavigate()
  const [input, setInput] = useState(() => {
    const prefill = localStorage.getItem('peach_prefill_url') || ''
    localStorage.removeItem('peach_prefill_url')
    return prefill
  })
  const [loading, setLoading] = useState(false)
  const [reportReady, setReportReady] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(() => {
    try { return JSON.parse(localStorage.getItem('peach_last_result')) || null }
    catch { return null }
  })
  const [resultTime, setResultTime] = useState(() => {
    const t = localStorage.getItem('peach_last_result_time')
    return t ? Number(t) : null
  })

  const handleReset = () => {
    localStorage.removeItem('peach_last_result')
    localStorage.removeItem('peach_last_result_time')
    setResult(null)
  }

  const handleRun = async () => {
    setError('')
    const val = input.trim()
    if (!val) return setError('Enter your website URL.')

    // Auth gate — redirect to sign up if not logged in
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      localStorage.setItem('peach_prefill_url', val)
      navigate('/login')
      return
    }

    setLoading(true)
    setReportReady(false)
    setResult(null)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 90000)
      const res = await fetch('/api/v3/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: val, llms: ['chatgpt', 'gemini'] }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const text = await res.text()
      let data
      try { data = JSON.parse(text) }
      catch { throw new Error('Server error — please try again in a moment.') }
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      localStorage.setItem('peach_last_result', JSON.stringify(data))
      localStorage.setItem('peach_last_result_time', String(Date.now()))
      setResult(data)
      setResultTime(Date.now())
      setReportReady(true)
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Analysis is taking longer than expected. Please try again.')
      } else {
        setError(err.message)
      }
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AnalysisProgress
        input={input}
        done={reportReady}
        onViewReport={() => setLoading(false)}
      />
    )
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#FCFAF6]">
        <UrlModeResult result={result} resultTime={resultTime} onReset={handleReset} />
      </div>
    )
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
