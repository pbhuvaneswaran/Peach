import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ScoreBar } from '../../components/VisibilityComponents'
import { ArticleEditorPanel } from '../../components/ArticleEditorPanel'
import { btnBase, btnStyle, StepTransition, Modal } from '../../lib/motion'

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
  if (quota.limit === 0 && !quota.admin) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
        <p className="text-sm text-amber-800 font-medium">Upgrade to a paid plan to generate articles.</p>
      </div>
    )
  }
  const pct = quota.remaining === Infinity ? 0 : Math.min(100, Math.round((quota.used / quota.limit) * 100))
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
      <ScoreBar brand="Articles this month" pct={pct} highlight />
      <p className="text-xs text-gray-400 mt-2">
        {quota.remaining === Infinity ? 'Unlimited (admin)' : `${quota.used} of ${quota.limit} used`}
      </p>
    </div>
  )
}

function CadenceBanner({ cadence, quota }) {
  if (!cadence) return null
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-4">
      {cadence.available ? (
        <p className="text-xs text-blue-900 leading-relaxed">
          You've published <strong>~{cadence.avgPerMonth}/mo</strong> recently. We recommend starting with <strong>{cadence.recommended}</strong> of your {quota?.admin ? 'unlimited' : (quota?.limit ?? '')} available this month.
        </p>
      ) : (
        <p className="text-xs text-blue-900 leading-relaxed">
          No publishing history found — we recommend starting with <strong>{cadence.recommended}</strong> articles this month rather than the full quota.
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
    <Modal show={open} onClose={onClose} panelClassName="bg-white rounded-2xl w-full max-w-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Add a topic</h3>
      <div className="space-y-3 mb-5">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <textarea value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder="Why this topic? (optional)" rows={2}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input value={targetQuery} onChange={e => setTargetQuery(e.target.value)} placeholder="Target keyword (optional)"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className={`text-sm font-semibold text-gray-500 px-4 py-2 ${btnBase}`} style={btnStyle()}>Cancel</button>
        <button onClick={submit} disabled={saving || !title.trim()}
          className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg ${btnBase}`} style={btnStyle()}>
          {saving ? 'Adding…' : 'Add topic'}
        </button>
      </div>
    </Modal>
  )
}

// ─── Left column: compact selectable topic list ─────────────────────────────

function TopicListItem({ topic, article, selected, onSelect, style }) {
  return (
    <button
      onClick={onSelect}
      style={{ ...style, ...btnStyle() }}
      className={`w-full text-left px-3.5 py-3 rounded-xl border transition-colors animate-fade-in-up ${btnBase} ${
        selected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
      }`}
    >
      <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 mb-1.5">{topic.title}</p>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        article ? (article.quality_status === 'pass' ? 'bg-emerald-100 text-emerald-700' : article.quality_status === 'flagged' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500') : TOPIC_STATUS_COLOR[topic.status]
      }`}>
        {article ? (article.quality_status === 'pass' ? 'Article ready' : article.quality_status === 'flagged' ? 'Needs review' : 'Article draft') : TOPIC_STATUS_LABEL[topic.status]}
      </span>
    </button>
  )
}

// ─── Right column: topic detail (no outline yet) ─────────────────────────────

function TopicDetailCard({ topic, busy, onApprove, onReject, onGenerateOutline }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-7">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Topic</p>
      {topic.target_query && (
        <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3">{topic.target_query}</span>
      )}
      <h2 className="text-xl font-bold text-gray-900 mb-4 leading-snug">{topic.title}</h2>

      <blockquote className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 italic leading-relaxed mb-6">
        "{topic.reasoning}"
      </blockquote>

      {topic.status === 'proposed' && (
        <div className="flex gap-2">
          <button disabled={busy} onClick={onApprove}
            className={`text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl ${btnBase}`} style={btnStyle()}>
            Approve topic
          </button>
          <button disabled={busy} onClick={onReject}
            className={`text-sm font-semibold text-gray-500 hover:text-red-500 px-4 py-2 ${btnBase}`} style={btnStyle()}>
            Reject
          </button>
        </div>
      )}
      {topic.status === 'approved' && (
        <button disabled={busy} onClick={onGenerateOutline}
          className={`text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl ${btnBase}`} style={btnStyle()}>
          {busy ? 'Generating outline…' : 'Generate outline →'}
        </button>
      )}
      {topic.status === 'rejected' && (
        <p className="text-sm text-gray-400">This topic was rejected.</p>
      )}
    </div>
  )
}

// ─── Right column: outline editor (Ithica-style expanded fields) ────────────

// Normalizes older { h2, h3s } outline rows (from before the Title+Description redesign)
// into the current { title, description } shape so existing outlines still edit cleanly.
function normalizeSections(sections) {
  return (sections || []).map((sec) =>
    sec.h2 !== undefined ? { title: sec.h2, description: (sec.h3s || []).join(' ') } : sec
  )
}

function OutlineDetailPanel({ outline, busy, onSave, onApproveAndWrite }) {
  const [h1, setH1] = useState(outline.h1 || '')
  const [targetKeyword, setTargetKeyword] = useState(outline.target_keyword || '')
  const [angle, setAngle] = useState(outline.angle || '')
  const [sections, setSections] = useState(() => normalizeSections(outline.outline_json))
  const [saving, setSaving] = useState(false)

  const updateTitle = (i, value) => setSections(s => s.map((sec, idx) => idx === i ? { ...sec, title: value } : sec))
  const updateDescription = (i, value) => setSections(s => s.map((sec, idx) => idx === i ? { ...sec, description: value } : sec))
  const addSection = () => setSections(s => [...s, { title: '', description: '' }])
  const removeSection = (i) => setSections(s => s.filter((_, idx) => idx !== i))

  const save = async () => {
    setSaving(true)
    try { await onSave({ h1, target_keyword: targetKeyword, angle, outline_json: sections }) } finally { setSaving(false) }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-7">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Outline</p>

      <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
      <input value={h1} onChange={e => setH1(e.target.value)}
        className="w-full text-base font-semibold text-gray-900 border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Target keyword</label>
          <input value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Angle</label>
          <input value={angle} onChange={e => setAngle(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {outline.evidence_quote && (
        <blockquote className="text-sm text-blue-900 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 italic leading-relaxed mb-5">
          "{outline.evidence_quote}"
        </blockquote>
      )}

      <p className="text-xs text-gray-400 mb-3">Core sections (intro, TL;DR, closing, and FAQ are added automatically)</p>

      <div className="space-y-3 mb-4">
        {sections.map((sec, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-400 flex-shrink-0">{i + 1}.</span>
              <input value={sec.title} onChange={e => updateTitle(i, e.target.value)}
                className="flex-1 text-sm font-semibold border-b border-transparent hover:border-gray-200 focus:border-blue-400 outline-none px-1 py-0.5 bg-transparent" />
              <button onClick={() => removeSection(i)} className="text-xs font-semibold text-red-400 hover:text-red-600 flex-shrink-0">Remove</button>
            </div>
            <textarea value={sec.description} onChange={e => updateDescription(i, e.target.value)} rows={2}
              className="w-full text-xs text-gray-500 border border-transparent hover:border-gray-200 focus:border-blue-400 outline-none px-1 py-0.5 bg-transparent resize-none" />
          </div>
        ))}
      </div>

      <button onClick={addSection} className="text-xs font-semibold text-blue-500 hover:text-blue-700 mb-6">+ Add section</button>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className={`text-sm font-semibold border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 ${btnBase}`} style={btnStyle()}>
          {saving ? 'Saving…' : 'Save edits'}
        </button>
        <button disabled={busy} onClick={() => onApproveAndWrite({ h1, target_keyword: targetKeyword, angle, outline_json: sections })}
          className={`text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl ${btnBase}`} style={btnStyle()}>
          {busy ? 'Writing…' : 'Approve & write article →'}
        </button>
      </div>
    </div>
  )
}

// ─── Right column: article ready summary ────────────────────────────────────

function ArticleDetailCard({ article, onOpen }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-7">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Article</p>
      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-4 ${
        article.quality_status === 'pass' ? 'bg-emerald-100 text-emerald-700' : article.quality_status === 'flagged' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
      }`}>
        {article.quality_status === 'pass' ? '✓ Quality checks passed' : article.quality_status === 'flagged' ? '⚠ Needs review' : 'Draft'}
      </span>
      <p className="text-sm text-gray-500 mb-6">{article.word_count ? `${article.word_count} words` : ''}</p>
      <button onClick={onOpen} className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl ${btnBase}`} style={btnStyle()}>
        Open article →
      </button>
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────

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
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [busyTopicId, setBusyTopicId] = useState('')

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
    api(`/api/articles/topics?runId=${selectedRunId}`).then((data) => {
      setTopics(data)
      // Lock in an explicit selection the first time topics load, rather than relying on
      // a `topics[0]` fallback re-derived on every render — once the user (or this default)
      // has picked a topic by id, later refetches must not silently swap which one is shown.
      setSelectedTopicId((prev) => (prev && data.some((t) => t.id === prev)) ? prev : (data[0]?.id || ''))
    }).catch(() => {})
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

  const withBusy = async (topicId, fn) => {
    setBusyTopicId(topicId)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err.data?.error || err.message || 'Something went wrong. Try again.')
    } finally {
      setBusyTopicId('')
    }
  }

  const approveTopic = (topic) => withBusy(topic.id, () =>
    api(`/api/articles/topics/${topic.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }).then(refreshTopicsAndOutlines))
  const rejectTopic = (topic) => withBusy(topic.id, () =>
    api(`/api/articles/topics/${topic.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) }).then(refreshTopicsAndOutlines))

  const addTopic = ({ title, reasoning, targetQuery }) =>
    api('/api/articles/topics', { method: 'POST', body: JSON.stringify({ runId: selectedRunId, title, reasoning, targetQuery }) })
      .then((data) => { refreshTopicsAndOutlines(); if (data.topic) setSelectedTopicId(data.topic.id) })

  const generateOutlineFor = (topic) => withBusy(topic.id, () =>
    api('/api/articles/outlines/generate', { method: 'POST', body: JSON.stringify({ topicIds: [topic.id] }) }).then(refreshTopicsAndOutlines))

  const saveOutline = (outline, fields) =>
    api(`/api/articles/outlines/${outline.id}`, { method: 'PATCH', body: JSON.stringify(fields) }).then(refreshTopicsAndOutlines)

  const generateArticle = async (outline, topic) => {
    const data = await api('/api/articles/generate', { method: 'POST', body: JSON.stringify({ outlineId: outline.id }) })
    setArticleDetails(prev => ({ ...prev, [data.articleId]: {
      content_html: data.html, content_markdown: data.markdown, quality_json: data.quality,
    } }))
    refreshTopicsAndOutlines()
    api('/api/articles/quota').then(setQuota).catch(() => {})
    if (data.articleId) setOpenArticle({ id: data.articleId, title: topic?.title })
  }

  const approveAndWrite = (outline, topic, fields) => withBusy(topic.id, async () => {
    await saveOutline(outline, fields)
    if (outline.status !== 'approved') {
      await api(`/api/articles/outlines/${outline.id}/approve`, { method: 'POST' })
    }
    await generateArticle(outline, topic)
  })

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
  const selectedTopic = topics.find(t => t.id === selectedTopicId) || topics[0] || null
  const selectedOutline = selectedTopic ? outlineByTopicId[selectedTopic.id] : null
  const selectedArticle = selectedOutline ? articleByOutlineId[selectedOutline.id] : null

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <label className="text-xs font-semibold text-gray-500">Domain:</label>
        <select value={selectedRunId} onChange={e => { setSelectedRunId(e.target.value); setSelectedTopicId('') }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {runs.map(r => <option key={r.id} value={r.id}>{r.brand} — {r.url}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5"><p className="text-sm text-red-600">{error}</p></div>}

      <div className="flex gap-6 items-start">
        {/* Left: topic list */}
        <div className="w-80 flex-shrink-0">
          <QuotaMeter quota={quota} />
          <CadenceBanner cadence={cadence} quota={quota} />

          <div className="flex flex-col gap-2 mb-4">
            <button onClick={generateTopics} disabled={generatingTopics}
              className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl ${btnBase}`} style={btnStyle()}>
              {generatingTopics ? 'Generating…' : topics.length > 0 ? 'Regenerate topics' : "Generate this month's topics"}
            </button>
            <button onClick={() => setAddModalOpen(true)} className={`text-sm font-semibold border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-xl ${btnBase}`} style={btnStyle()}>
              + Add topic
            </button>
          </div>

          {topics.length === 0 ? (
            <p className="text-sm text-gray-400">No topics yet.</p>
          ) : (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{topics.length} grounded topics</p>
          )}

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {topics.map((topic, i) => {
              const outline = outlineByTopicId[topic.id]
              const article = outline ? articleByOutlineId[outline.id] : null
              return (
                <TopicListItem
                  key={topic.id}
                  topic={topic}
                  article={article}
                  selected={selectedTopic ? topic.id === selectedTopic.id : false}
                  onSelect={() => setSelectedTopicId(topic.id)}
                  style={{ animationDelay: `${i * 40}ms` }}
                />
              )
            })}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="flex-1 min-w-0">
          <StepTransition stepKey={`${selectedTopic?.id || 'none'}:${selectedArticle ? 'article' : selectedOutline ? 'outline' : 'topic'}`}>
            {!selectedTopic ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <p className="text-sm text-gray-400">Select a topic from the list to see its details.</p>
              </div>
            ) : selectedArticle ? (
              <ArticleDetailCard article={selectedArticle} onOpen={() => openArticlePanel(selectedArticle, selectedTopic.title)} />
            ) : selectedOutline ? (
              <OutlineDetailPanel
                outline={selectedOutline}
                busy={busyTopicId === selectedTopic.id}
                onSave={(fields) => saveOutline(selectedOutline, fields)}
                onApproveAndWrite={(fields) => approveAndWrite(selectedOutline, selectedTopic, fields)}
              />
            ) : (
              <TopicDetailCard
                topic={selectedTopic}
                busy={busyTopicId === selectedTopic.id}
                onApprove={() => approveTopic(selectedTopic)}
                onReject={() => rejectTopic(selectedTopic)}
                onGenerateOutline={() => generateOutlineFor(selectedTopic)}
              />
            )}
          </StepTransition>
        </div>
      </div>

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
        angle={openArticle ? articleDetails[openArticle.id]?.angle : ''}
      />
    </div>
  )
}
