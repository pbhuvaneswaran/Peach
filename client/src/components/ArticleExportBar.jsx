import { useState, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import { useAuth } from '../context/AuthContext'
import { PublishConnectModal } from './PublishConnectModal'

const TYPE_LABELS = {
  wordpress: 'WordPress',
  wordpress_com: 'WordPress.com',
  github: 'GitHub',
  peach_hosted: 'Peach-hosted blog',
}

// Shared publish panel — used by both the ad-hoc ContentBriefModal (VisibilityFlow.jsx)
// and the article editor, so every publishing integration only exists in one place.
export function ArticleExportBar({ markdown, title, articleId, onPublished }) {
  const { session } = useAuth()
  const [copied, setCopied] = useState('')
  const [targets, setTargets] = useState([])
  const [connectOpen, setConnectOpen] = useState(false)
  const [publishingId, setPublishingId] = useState('')
  const [publishedUrls, setPublishedUrls] = useState({})
  const [wpPhase, setWpPhase] = useState({}) // targetId -> 'publishing' | 'done' | 'error'
  const [error, setError] = useState('')
  const [blogHandle, setBlogHandle] = useState(undefined) // undefined = not loaded yet, null = not set
  const [customDomain, setCustomDomain] = useState(null) // { domain, verified } | null

  const authHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' }
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
    return headers
  }, [session])

  const refreshTargets = useCallback(() => {
    fetch('/api/publish-targets', { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => setTargets(Array.isArray(data) ? data : []))
      .catch(() => {})
    fetch('/api/blog-handle', { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        setBlogHandle(data.handle || null)
        setCustomDomain(data.customDomain?.verified ? data.customDomain : null)
      })
      .catch(() => setBlogHandle(null))
  }, [authHeaders])

  useEffect(() => { refreshTargets() }, [refreshTargets])

  // Peach-hosted blog is always available — no OAuth row in publish_targets, just merged in here.
  const allTargets = blogHandle !== undefined
    ? [{ id: 'peach_hosted', type: 'peach_hosted', config: {} }, ...targets]
    : targets

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown)
    setCopied('md')
    setTimeout(() => setCopied(''), 2000)
  }

  const copyHtml = () => {
    navigator.clipboard.writeText(marked.parse(markdown || ''))
    setCopied('html')
    setTimeout(() => setCopied(''), 2000)
  }

  const recordPublish = async (target, publishedUrl) => {
    if (!articleId) return
    try {
      await fetch(`/api/articles/${articleId}/publish`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ target, publishedUrl }),
      })
      onPublished && onPublished()
    } catch {
      // best-effort — publish status tracking shouldn't block the user seeing their post went live
    }
  }

  const publishToWordPress = async (t) => {
    setWpPhase((p) => ({ ...p, [t.id]: 'publishing' }))
    setError('')
    try {
      const base = t.config.url.replace(/\/$/, '')
      const htmlContent = marked.parse(markdown || '')
      const res = await fetch(`${base}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: { Authorization: 'Basic ' + btoa(`admin:${t.config.password}`), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'Peach Article', content: htmlContent, status: 'draft' }),
      })
      if (!res.ok) throw new Error(`WordPress returned ${res.status}`)
      const data = await res.json()
      setWpPhase((p) => ({ ...p, [t.id]: 'done' }))
      setPublishedUrls((u) => ({ ...u, [t.id]: data.link }))
      recordPublish('wordpress', data.link)
    } catch (err) {
      setError(err.message || 'Could not publish to WordPress.')
      setWpPhase((p) => ({ ...p, [t.id]: 'error' }))
    }
  }

  const publishServerSide = async (t) => {
    setPublishingId(t.id)
    setError('')
    try {
      const res = await fetch(`/api/articles/${articleId}/publish`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ target: t.type, targetId: t.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publish failed')
      setPublishedUrls((u) => ({ ...u, [t.id]: data.published_url }))
      onPublished && onPublished()
    } catch (err) {
      setError(err.message || 'Publish failed.')
    } finally {
      setPublishingId('')
    }
  }

  const handlePublish = (t) => {
    if (t.type === 'peach_hosted' && !blogHandle) { setConnectOpen(true); return }
    if (t.type === 'wordpress') publishToWordPress(t)
    else publishServerSide(t)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={copyMarkdown}
          className="flex items-center gap-1.5 text-xs font-semibold border border-[#BFDBFE] text-[#2563EB] px-3 py-1.5 rounded-lg hover:bg-[#EFF6FF] transition-colors">
          {copied === 'md' ? '✓ Copied!' : '⬇ Copy Markdown'}
        </button>
        <button onClick={copyHtml}
          className="flex items-center gap-1.5 text-xs font-semibold border border-[#BFDBFE] text-[#2563EB] px-3 py-1.5 rounded-lg hover:bg-[#EFF6FF] transition-colors">
          {copied === 'html' ? '✓ Copied!' : '⬇ Copy HTML'}
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      {allTargets.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {allTargets.map((t) => {
            const url = publishedUrls[t.id]
            const wpBusy = wpPhase[t.id] === 'publishing'
            const busy = publishingId === t.id || wpBusy
            const needsSetup = t.type === 'peach_hosted' && !blogHandle
            const label = t.type === 'peach_hosted' && customDomain ? customDomain.domain : (TYPE_LABELS[t.type] || t.type)
            return (
              <div key={t.id} className="flex items-center justify-between gap-2 border border-gray-100 rounded-lg px-3 py-2">
                <span className="text-xs font-semibold text-gray-700">{label}</span>
                {url ? (
                  <a href={url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline">
                    ✓ View post →
                  </a>
                ) : (
                  <button onClick={() => handlePublish(t)} disabled={busy}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-60">
                    {busy ? 'Publishing…' : needsSetup ? 'Set up →' : 'Publish →'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <button onClick={() => setConnectOpen(true)}
        className="text-xs font-semibold text-blue-600 hover:text-blue-800">
        + Connect an integration
      </button>

      <PublishConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} onConnected={refreshTargets} />
    </div>
  )
}
