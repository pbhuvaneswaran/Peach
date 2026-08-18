import { useState } from 'react'
import { marked } from 'marked'
import { supabase } from '../lib/supabase'

// Shared publish/export bar — used by both the ad-hoc ContentBriefModal (VisibilityFlow.jsx)
// and the Articles dashboard tab, so the WordPress-publish flow only exists in one place.
export function ArticleExportBar({ markdown, title, articleId, onPublished }) {
  const [copied, setCopied] = useState('')
  const [wpPhase, setWpPhase] = useState('hidden') // 'hidden' | 'connect' | 'publishing' | 'done' | 'error'
  const [wpUrl, setWpUrl] = useState(() => {
    try { return JSON.parse(localStorage.getItem('peach_wp_creds') || '{}').url || '' } catch { return '' }
  })
  const [wpPass, setWpPass] = useState(() => {
    try { return JSON.parse(localStorage.getItem('peach_wp_creds') || '{}').password || '' } catch { return '' }
  })
  const [wpError, setWpError] = useState('')

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

  const recordPublish = async () => {
    if (!articleId) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      await fetch(`/api/articles/${articleId}/publish`, {
        method: 'POST', headers, body: JSON.stringify({ target: 'wordpress' }),
      })
      onPublished && onPublished()
    } catch {
      // best-effort — publish status tracking shouldn't block the user seeing their post went live
    }
  }

  const publishToWP = async (url, password) => {
    setWpPhase('publishing')
    setWpError('')
    try {
      const base = url.replace(/\/$/, '')
      const htmlContent = marked.parse(markdown || '')
      const wpRes = await fetch(`${base}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`admin:${password}`),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title || 'Peach Article', content: htmlContent, status: 'draft' }),
      })
      if (!wpRes.ok) throw new Error(`WordPress returned ${wpRes.status}`)
      setWpPhase('done')
      recordPublish()
    } catch (err) {
      setWpError(err.message || 'Could not publish. Check your site URL and application password.')
      setWpPhase('error')
    }
  }

  const handleWordPress = () => {
    const saved = JSON.parse(localStorage.getItem('peach_wp_creds') || '{}')
    if (!saved.url || !saved.password) {
      setWpPhase('connect')
      return
    }
    publishToWP(saved.url, saved.password)
  }

  const saveWpAndPublish = () => {
    if (!wpUrl.trim() || !wpPass.trim()) return
    localStorage.setItem('peach_wp_creds', JSON.stringify({ url: wpUrl.trim(), password: wpPass.trim() }))
    publishToWP(wpUrl.trim(), wpPass.trim())
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={copyMarkdown}
          className="flex items-center gap-1.5 text-xs font-semibold border border-[#BFDBFE] text-[#2563EB] px-3 py-1.5 rounded-lg hover:bg-[#EFF6FF] transition-colors">
          {copied === 'md' ? '✓ Copied!' : '⬇ Copy Markdown'}
        </button>
        <button onClick={copyHtml}
          className="flex items-center gap-1.5 text-xs font-semibold border border-[#BFDBFE] text-[#2563EB] px-3 py-1.5 rounded-lg hover:bg-[#EFF6FF] transition-colors">
          {copied === 'html' ? '✓ Copied!' : '⬇ Copy HTML'}
        </button>
        <button onClick={handleWordPress}
          className="flex items-center gap-1.5 text-xs font-semibold border border-[#BFDBFE] text-[#2563EB] px-3 py-1.5 rounded-lg hover:bg-[#EFF6FF] transition-colors">
          {wpPhase === 'done' ? '✓ Published as draft' : wpPhase === 'publishing' ? 'Publishing…' : '⬆ Publish to WordPress'}
        </button>
        <span className="text-[11px] text-[#94A3B8] self-center ml-1">More integrations (Webflow, Notion, HubSpot) coming soon</span>
      </div>

      {(wpPhase === 'connect' || wpPhase === 'error') && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-[#172554] mb-3">Connect WordPress</p>
          <div className="space-y-2 mb-3">
            <input value={wpUrl} onChange={e => setWpUrl(e.target.value)}
              placeholder="https://yoursite.com"
              className="w-full text-sm border border-[#BFDBFE] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white" />
            <input value={wpPass} onChange={e => setWpPass(e.target.value)}
              type="password" placeholder="WordPress Application Password"
              className="w-full text-sm border border-[#BFDBFE] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white" />
          </div>
          <p className="text-xs text-[#667085] mb-3">
            Get an Application Password in WordPress → Users → Profile → Application Passwords.
          </p>
          {wpError && <p className="text-xs text-red-600 mb-2">{wpError}</p>}
          <button onClick={saveWpAndPublish}
            className="text-sm font-semibold bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1D4ED8]">
            Connect & publish as draft
          </button>
        </div>
      )}
    </div>
  )
}
