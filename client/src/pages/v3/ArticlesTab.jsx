import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ScoreBar } from '../../components/VisibilityComponents'
import { ArticleEditorPanel } from '../../components/ArticleEditorPanel'

const TOPIC_STATUS_LABEL = { proposed: 'Proposed', approved: 'Approved', rejected: 'Rejected' }
const TOPIC_STATUS_COLOR = {
  proposed: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-gray-100 text-gray-400',
}

function useApi() {
  const { session } = useAuth()
  return useCallback(async (path, opts = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
    const res = await fetch(path, { ...opts, headers })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(data.error || 'request_failed'), { data, status: res.status })
    return data
  }, [session])
}

function QuotaMeter({ quota }) {
  if (!quota) return null
  if (quota.limit === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <p className="text-sm text-amber-800 font-medium">Upgrade to a paid plan to generate articles.</p>
      </div>
    )
  }
  const pct = quota.remaining === Infinity ? 0 : Math.min(100, Math.round((quota.used / quota.limit) * 100))
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
      <ScoreBar brand="Articles used this month" pct={pct} highlight />
      <p className="text-xs text-gray-400 mt-2">
        {quota.remaining === Infinity ? 'Unlimited (admin)' : `${quota.used} of ${quota.limit} used · ${quota.remaining} remaining`}
      </p>
    </div>
  )
}

function CadenceBanner({ cadence, quota }) {
  if (!cadence) return null
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
      {cadence.available ? (
        <p className="text-sm text-blue-900">
          You've published <strong>~{cadence.avgPerMonth}/month</strong> over the last 6 months.
          We recommend starting with <strong>{cadence.recommended}</strong> of your {quota?.limit ?? ''} available this month to avoid a sudden spike.
        </p>
      ) : (
        <p className="text-sm text-blue-900">
          We couldn't find a publishing history on this site, so we recommend starting with <strong>{cadence.recommended}</strong> articles this month rather than the full quota.
        </p>
      )}
    </div>
  )
}

function AddTopicModal({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [targetQuery, setTargetQuery] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const submit = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onAdd({ title: title.trim(), reasoning: reasoning.trim(), targetQuery: targetQuery.trim() })
      setTitle(''); setReasoning(''); setTargetQuery('')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#172554]/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add a topic</h3>
        <div className="space-y-3 mb-5">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder="Why this topic? (optional)" rows={2}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={targetQuery} onChange={e => setTargetQuery(e.target.value)} placeholder="Target buyer query (optional)"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm font-semibold text-gray-500 px-4 py-2">Cancel</button>
          <button onClick={submit} disabled={saving || !title.trim()}
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg">
            {saving ? 'Adding…' : 'Add topic'}
          </button>
        </div>
      </div>
    </div>
  )
}

function OutlineEditor({ outline, onSave, onApprove }) {
  const [sections, setSections] = useState(outline.outline_json || [])
  const [saving, setSaving] = useState(false)

  const updateH2 = (i, value) => setSections(s => s.map((sec, idx) => idx === i ? { ...sec, h2: value } : sec))
  const updateH3 = (i, hi, value) => setSections(s => s.map((sec, idx) => idx === i ? { ...sec, h3s: sec.h3s.map((h, hidx) => hidx === hi ? value : h) } : sec))
  const addH3 = (i) => setSections(s => s.map((sec, idx) => idx === i ? { ...sec, h3s: [...(sec.h3s || []), ''] } : sec))
  const removeH3 = (i, hi) => setSections(s => s.map((sec, idx) => idx === i ? { ...sec, h3s: sec.h3s.filter((_, hidx) => hidx !== hi) } : sec))
  const addH2 = () => setSections(s => [...s, { h2: '', h3s: [] }])
  const removeH2 = (i) => setSections(s => s.filter((_, idx) => idx !== i))

  const save = async () => {
    setSaving(true)
    try { await onSave(sections) } finally { setSaving(false) }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="space-y-3 mb-3">
        {sections.map((sec, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black text-[10px] flex-shrink-0">H2</span>
              <input value={sec.h2} onChange={e => updateH2(i, e.target.value)}
                className="flex-1 text-sm font-semibold border-b border-transparent hover:border-gray-200 focus:border-blue-400 outline-none px-1 py-0.5" />
              <button onClick={() => removeH2(i)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
            </div>
            {(sec.h3s || []).map((h3, hi) => (
              <div key={hi} className="flex items-center gap-2 ml-6 mb-1">
                <span className="text-gray-300 font-black text-[10px] flex-shrink-0">H3</span>
                <input value={h3} onChange={e => updateH3(i, hi, e.target.value)}
                  className="flex-1 text-xs border-b border-transparent hover:border-gray-200 focus:border-blue-400 outline-none px-1 py-0.5" />
                <button onClick={() => removeH3(i, hi)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
              </div>
            ))}
            <button onClick={() => addH3(i)} className="ml-6 text-[11px] text-blue-500 hover:text-blue-700 font-semibold mt-1">+ Add H3</button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={addH2} className="text-xs font-semibold text-blue-500 hover:text-blue-700">+ Add H2 section</button>
        <span className="flex-1" />
        <button onClick={save} disabled={saving} className="text-xs font-semibold border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          {saving ? 'Saving…' : 'Save edits'}
        </button>
        {outline.status !== 'approved' && (
          <button onClick={onApprove} className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">
            Approve outline →
          </button>
        )}
      </div>
    </div>
  )
}

function TopicRow({ topic, outline, article, onApprove, onReject, onGenerateOutline, onSaveOutline, onApproveOutline, onGenerateArticle, onOpenArticle }) {
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)

  const run = async (fn) => {
    setBusy(true)
    try { await fn() } finally { setBusy(false) }
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TOPIC_STATUS_COLOR[topic.status]}`}>{TOPIC_STATUS_LABEL[topic.status]}</span>
            {topic.source === 'user_added' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">Added by you</span>}
            {article && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${article.quality_status === 'pass' ? 'bg-emerald-100 text-emerald-700' : article.quality_status === 'flagged' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                {article.quality_status === 'pass' ? '✓ Article ready' : article.quality_status === 'flagged' ? '⚠ Needs review' : 'Article draft'}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800">{topic.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{topic.reasoning}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {topic.status === 'proposed' && (
            <div className="flex gap-1.5">
              <button disabled={busy} onClick={() => run(() => onApprove(topic))} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800">Approve</button>
              <button disabled={busy} onClick={() => run(() => onReject(topic))} className="text-xs font-semibold text-gray-400 hover:text-red-500">Reject</button>
            </div>
          )}
          {topic.status === 'approved' && !outline && (
            <button disabled={busy} onClick={() => run(() => onGenerateOutline(topic))} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              {busy ? 'Generating…' : 'Generate outline →'}
            </button>
          )}
          {outline && !article && (
            <button onClick={() => setExpanded(e => !e)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              {expanded ? 'Hide outline' : outline.status === 'approved' ? 'View outline' : 'Edit outline'} {expanded ? '▲' : '▼'}
            </button>
          )}
          {outline?.status === 'approved' && !article && (
            <button disabled={busy} onClick={() => run(() => onGenerateArticle(outline, topic))} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              {busy ? 'Writing…' : 'Generate article →'}
            </button>
          )}
          {article && (
            <button onClick={() => onOpenArticle(article, topic.title)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Open article →
            </button>
          )}
        </div>
      </div>

      {expanded && outline && !article && (
        <div className="border-t border-gray-100 px-4 py-4">
          <OutlineEditor
            outline={outline}
            onSave={(sections) => onSaveOutline(outline, sections)}
            onApprove={() => onApproveOutline(outline)}
          />
        </div>
      )}
    </div>
  )
}

export default function ArticlesTab() {
  const api = useApi()
  const [runs, setRuns] = useState([])
  const [selectedRunId, setSelectedRunId] = useState('')
  const [quota, setQuota] = useState(null)
  const [topics, setTopics] = useState([])
  const [outlines, setOutlines] = useState([])
  const [articles, setArticles] = useState([])
  const [cadence, setCadence] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingTopics, setGeneratingTopics] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [articleDetails, setArticleDetails] = useState({}) // id -> full row
  const [openArticle, setOpenArticle] = useState(null) // { id, title } | null

  useEffect(() => {
    Promise.all([
      api('/api/v3/runs').catch(() => []),
      api('/api/articles/quota').catch(() => null),
    ]).then(([runsData, quotaData]) => {
      setRuns(runsData || [])
      setQuota(quotaData)
      if (runsData?.length) setSelectedRunId(runsData[0].id)
    }).finally(() => setLoading(false))
  }, [api])

  const refreshTopicsAndOutlines = useCallback(() => {
    if (!selectedRunId) return
    api(`/api/articles/topics?runId=${selectedRunId}`).then(setTopics).catch(() => {})
    api('/api/articles/outlines').then(setOutlines).catch(() => {})
    api('/api/articles').then(setArticles).catch(() => {})
  }, [api, selectedRunId])

  useEffect(() => { refreshTopicsAndOutlines() }, [refreshTopicsAndOutlines])

  const generateTopics = async () => {
    setGeneratingTopics(true)
    setError('')
    try {
      const data = await api('/api/articles/topics/generate', { method: 'POST', body: JSON.stringify({ runId: selectedRunId }) })
      setCadence(data.cadence)
      refreshTopicsAndOutlines()
    } catch (err) {
      setError(err.data?.error === 'upgrade_required' ? 'Upgrade to a paid plan to generate articles.'
        : err.data?.error === 'article_limit_reached' ? `You've used your ${err.data.limit} articles this month.`
        : 'Could not generate topics. Try again.')
    } finally {
      setGeneratingTopics(false)
    }
  }

  const approveTopic = (topic) => api(`/api/articles/topics/${topic.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }).then(refreshTopicsAndOutlines)
  const rejectTopic = (topic) => api(`/api/articles/topics/${topic.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) }).then(refreshTopicsAndOutlines)

  const addTopic = ({ title, reasoning, targetQuery }) =>
    api('/api/articles/topics', { method: 'POST', body: JSON.stringify({ runId: selectedRunId, title, reasoning, targetQuery }) })
      .then(refreshTopicsAndOutlines)

  const generateOutlineFor = (topic) =>
    api('/api/articles/outlines/generate', { method: 'POST', body: JSON.stringify({ topicIds: [topic.id] }) }).then(refreshTopicsAndOutlines)

  const saveOutline = (outline, sections) =>
    api(`/api/articles/outlines/${outline.id}`, { method: 'PATCH', body: JSON.stringify({ outline_json: sections }) }).then(refreshTopicsAndOutlines)

  const approveOutline = (outline) =>
    api(`/api/articles/outlines/${outline.id}/approve`, { method: 'POST' }).then(refreshTopicsAndOutlines)

  const generateArticle = async (outline, topic) => {
    const data = await api('/api/articles/generate', { method: 'POST', body: JSON.stringify({ outlineId: outline.id }) })
    setArticleDetails(prev => ({ ...prev, [data.articleId]: {
      content_html: data.html, content_markdown: data.markdown, quality_json: data.quality,
    } }))
    refreshTopicsAndOutlines()
    api('/api/articles/quota').then(setQuota).catch(() => {})
    if (data.articleId) setOpenArticle({ id: data.articleId, title: topic?.title })
  }

  const openArticlePanel = (article, title) => {
    setOpenArticle({ id: article.id, title })
    if (!articleDetails[article.id]) {
      api(`/api/articles/${article.id}`).then(data => setArticleDetails(prev => ({ ...prev, [article.id]: data }))).catch(() => {})
    }
  }

  if (loading) {
    return <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto my-12" />
  }

  if (runs.length === 0) {
    return <p className="text-sm text-gray-500">No analyzed domains yet. Run a check first to generate article topics from it.</p>
  }

  const outlineByTopicId = Object.fromEntries(outlines.map(o => [o.topic_id, o]))
  const articleByOutlineId = Object.fromEntries(articles.map(a => [a.outline_id, a]))

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs font-semibold text-gray-500">Domain:</label>
        <select value={selectedRunId} onChange={e => setSelectedRunId(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {runs.map(r => <option key={r.id} value={r.id}>{r.brand} — {r.url}</option>)}
        </select>
      </div>

      <QuotaMeter quota={quota} />
      <CadenceBanner cadence={cadence} quota={quota} />

      {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5"><p className="text-sm text-red-600">{error}</p></div>}

      <div className="flex items-center gap-3 mb-5">
        <button onClick={generateTopics} disabled={generatingTopics}
          className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl">
          {generatingTopics ? 'Generating…' : topics.length > 0 ? 'Regenerate this month\'s topics' : "Generate this month's topics"}
        </button>
        <button onClick={() => setAddModalOpen(true)} className="text-sm font-semibold border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-xl">
          + Add topic
        </button>
      </div>

      {topics.length === 0 ? (
        <p className="text-sm text-gray-400">No topics yet — generate this month's topics to get started.</p>
      ) : (
        <div className="space-y-2">
          {topics.map(topic => {
            const outline = outlineByTopicId[topic.id]
            const article = outline ? articleByOutlineId[outline.id] : null
            return (
              <TopicRow
                key={topic.id}
                topic={topic}
                outline={outline}
                article={article}
                onApprove={approveTopic}
                onReject={rejectTopic}
                onGenerateOutline={generateOutlineFor}
                onSaveOutline={saveOutline}
                onApproveOutline={approveOutline}
                onGenerateArticle={generateArticle}
                onOpenArticle={openArticlePanel}
              />
            )
          })}
        </div>
      )}

      <AddTopicModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={addTopic} />

      <ArticleEditorPanel
        open={!!openArticle}
        onClose={() => setOpenArticle(null)}
        articleId={openArticle?.id}
        title={openArticle?.title}
        loading={!!openArticle && !articleDetails[openArticle.id]}
        initialHtml={openArticle ? articleDetails[openArticle.id]?.content_html : ''}
        initialMarkdown={openArticle ? articleDetails[openArticle.id]?.content_markdown : ''}
        initialQuality={openArticle ? articleDetails[openArticle.id]?.quality_json : null}
      />
    </div>
  )
}
