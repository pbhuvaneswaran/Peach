import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// Mounted once at the app root. GitHub/WordPress.com OAuth connects are full-page
// redirects, so any article-editor context the user started from is gone by the time
// the browser lands back here — this component picks up wherever the OAuth round-trip
// left off (?github_target=<id> or ?wpcom_target=<id> in the URL) and finishes the
// connection (repo/site picker) regardless of what page the user is currently on.
// Parses the OAuth-return query params exactly once, before the first render, and
// scrubs them from the URL — a lazy useState initializer instead of a mount effect
// avoids an extra render pass for state that's already known synchronously.
function readOAuthReturn() {
  const params = new URLSearchParams(window.location.search)
  const githubTarget = params.get('github_target')
  const wpcomTarget = params.get('wpcom_target')
  const hadError = params.get('github_error') || params.get('wpcom_error')

  if (!githubTarget && !wpcomTarget && !hadError) return { step: null, targetId: null }

  window.history.replaceState({}, '', window.location.pathname)
  if (hadError) return { step: 'error', targetId: null }
  if (githubTarget) return { step: 'github', targetId: githubTarget }
  return { step: 'wordpress_com', targetId: wpcomTarget }
}

export function OAuthConnectionResume() {
  const { session } = useAuth()
  const initial = useState(readOAuthReturn)[0]
  const [step, setStep] = useState(initial.step) // null | 'github' | 'wordpress_com' | 'error'
  const [targetId, setTargetId] = useState(initial.targetId)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState('')
  const [pathPrefix, setPathPrefix] = useState('content')
  const [format, setFormat] = useState('md')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!step || step === 'error' || !targetId || !session?.access_token) return
    const url = step === 'github' ? `/api/github/repos?targetId=${targetId}` : `/api/wordpress/sites?targetId=${targetId}`
    fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => r.json())
      .then((data) => setOptions(Array.isArray(data) ? data : []))
      .catch(() => setOptions([]))
  }, [step, targetId, session])

  if (!step) return null

  const close = () => { setStep(null); setTargetId(null); setOptions([]); setSelected('') }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }
      const body = step === 'github'
        ? (() => { const [owner, repo] = selected.split('/'); return { owner, repo, branch: options.find((o) => o.full_name === selected)?.default_branch || 'main', pathPrefix, format } })()
        : { siteId: selected }
      await fetch(`/api/publish-targets/${targetId}`, { method: 'PATCH', headers, body: JSON.stringify(body) })
      close()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#172554]/40 z-[100] flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        {step === 'error' && (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Connection failed</h3>
            <p className="text-sm text-gray-500 mb-5">Something went wrong finishing that connection. Try again from the Publish menu.</p>
            <button onClick={close} className="text-sm font-semibold bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg">Close</button>
          </>
        )}

        {step === 'github' && (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Connected to GitHub</h3>
            <p className="text-sm text-gray-500 mb-4">Choose which repo to publish articles into.</p>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a repository…</option>
              {options.map((o) => <option key={o.full_name} value={o.full_name}>{o.full_name}</option>)}
            </select>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Folder</label>
            <input value={pathPrefix} onChange={(e) => setPathPrefix(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label className="block text-xs font-semibold text-gray-500 mb-1">File format</label>
            <div className="flex gap-2 mb-5">
              {['md', 'mdx'].map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${format === f ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}>
                  .{f}
                </button>
              ))}
            </div>
            <button onClick={save} disabled={!selected || saving}
              className="w-full text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl">
              {saving ? 'Saving…' : 'Finish connecting'}
            </button>
          </>
        )}

        {step === 'wordpress_com' && (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Connected to WordPress.com</h3>
            <p className="text-sm text-gray-500 mb-4">Choose which site to publish articles into.</p>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a site…</option>
              {options.map((o) => <option key={o.ID} value={o.ID}>{o.name} ({o.URL})</option>)}
            </select>
            <button onClick={save} disabled={!selected || saving}
              className="w-full text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl">
              {saving ? 'Saving…' : 'Finish connecting'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
