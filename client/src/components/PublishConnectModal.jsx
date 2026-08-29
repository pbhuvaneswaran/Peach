import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function WordPressWizard({ onConnected, onCancel }) {
  const { session } = useAuth()
  const [step, setStep] = useState(1)
  const [siteUrl, setSiteUrl] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const normalizedUrl = siteUrl.trim().replace(/\/$/, '')

  const connect = async () => {
    setVerifying(true)
    setError('')
    try {
      const verifyRes = await fetch(`${normalizedUrl}/wp-json/wp/v2/users/me`, {
        headers: { Authorization: 'Basic ' + btoa(`admin:${password}`) },
      })
      if (!verifyRes.ok) throw new Error('Could not verify — check your site URL and Application Password.')

      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }
      await fetch('/api/publish-targets', {
        method: 'POST', headers,
        body: JSON.stringify({ type: 'wordpress', config: { url: normalizedUrl, password } }),
      })
      onConnected()
    } catch (err) {
      setError(err.message || 'Connection failed.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Step {step} of 3</p>

      {step === 1 && (
        <>
          <h3 className="text-base font-bold text-gray-900 mb-1">What's your site URL?</h3>
          <p className="text-sm text-gray-500 mb-4">Your self-hosted WordPress site's address.</p>
          <input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://yoursite.com"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel} className="text-sm font-semibold text-gray-500 px-4 py-2">Cancel</button>
            <button onClick={() => setStep(2)} disabled={!normalizedUrl}
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg">
              Next →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h3 className="text-base font-bold text-gray-900 mb-1">Create an Application Password</h3>
          <p className="text-sm text-gray-500 mb-3">
            Open your WordPress admin, scroll to "Application Passwords," name it (e.g. "Peach"), and click "Add New Application Password."
          </p>
          <a href={`${normalizedUrl}/wp-admin/profile.php#application-passwords-section`} target="_blank" rel="noreferrer"
            className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-800 mb-5">
            Open Application Passwords settings →
          </a>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setStep(1)} className="text-sm font-semibold text-gray-500 px-4 py-2">← Back</button>
            <button onClick={() => setStep(3)} className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              I have my password →
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3 className="text-base font-bold text-gray-900 mb-1">Paste your Application Password</h3>
          <p className="text-sm text-gray-500 mb-3">We'll verify it before connecting.</p>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={() => setStep(2)} className="text-sm font-semibold text-gray-500 px-4 py-2">← Back</button>
            <button onClick={connect} disabled={!password || verifying}
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg">
              {verifying ? 'Verifying…' : 'Connect'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function PeachHostedWizard({ onConnected, onCancel }) {
  const { session } = useAuth()
  const [loaded, setLoaded] = useState(false)
  const [handle, setHandle] = useState('')
  const [existingHandle, setExistingHandle] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/blog-handle', { headers: { Authorization: `Bearer ${session?.access_token || ''}` } })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        setExistingHandle(data.handle || null)
        setHandle(data.handle || data.suggested || '')
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Already has a handle — nothing to set up, just confirm.
  if (loaded && existingHandle) {
    return (
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Peach-hosted blog</h3>
        <p className="text-sm text-gray-500 mb-5">
          Your blog is live at <span className="font-mono text-gray-700">/blog/{existingHandle}</span>. No further setup needed.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-sm font-semibold text-gray-500 px-4 py-2">← Back</button>
          <button onClick={onConnected} className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Continue →
          </button>
        </div>
      </div>
    )
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/blog-handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ handle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error === 'handle_taken' ? 'That handle is already taken.' : (data.error || 'Could not save.'))
      onConnected()
    } catch (err) {
      setError(err.message || 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-1">Set up your Peach-hosted blog</h3>
      <p className="text-sm text-gray-500 mb-3">
        Pick a handle — your articles will be published at <span className="font-mono">/blog/&lt;handle&gt;</span>, a real
        server-rendered page AI crawlers can read.
      </p>
      {loaded && (
        <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="your-brand"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      )}
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm font-semibold text-gray-500 px-4 py-2">← Back</button>
        <button onClick={save} disabled={!handle || saving}
          className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg">
          {saving ? 'Saving…' : 'Save & connect'}
        </button>
      </div>
    </div>
  )
}

const POLL_MS = 10000
const POLL_TIMEOUT_MS = 5 * 60 * 1000

function CustomDomainWizard({ onConnected, onCancel }) {
  const { session } = useAuth()
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` }

  const [status, setStatus] = useState('loading') // loading | locked | none | pending_dns | verified | error
  const [domainInput, setDomainInput] = useState('')
  const [domain, setDomain] = useState(null)
  const [records, setRecords] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const checkVerification = async () => {
    try {
      const res = await fetch('/api/custom-domain/verify', { headers: authHeaders })
      const data = await res.json()
      if (data.domain) setDomain(data.domain)
      if (data.records) setRecords(data.records)
      if (data.status === 'error') { setError(data.message || 'Verification failed.'); setStatus('pending_dns'); return }
      setStatus(data.status)
    } catch {
      setStatus('pending_dns')
    }
  }

  useEffect(() => {
    fetch('/api/blog-handle', { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        if (!data.canUseCustomDomain) { setStatus('locked'); return }
        if (data.customDomain?.domain && data.customDomain.verified) {
          setDomain(data.customDomain.domain)
          setStatus('verified')
        } else if (data.customDomain?.domain) {
          setDomain(data.customDomain.domain)
          checkVerification()
        } else {
          setStatus('none')
        }
      })
      .catch(() => setStatus('none'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll while pending, stop on verified/locked/none or a 5-minute timeout.
  useEffect(() => {
    if (status !== 'pending_dns') return
    const start = Date.now()
    const interval = setInterval(() => {
      if (Date.now() - start > POLL_TIMEOUT_MS) { setTimedOut(true); clearInterval(interval); return }
      checkVerification()
    }, POLL_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const connectDomain = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/custom-domain', { method: 'POST', headers: authHeaders, body: JSON.stringify({ domain: domainInput.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || (data.error === 'domain_taken' ? 'That domain is already connected to another account.' : 'Could not connect that domain.'))
      setDomain(data.domain)
      setRecords(data.records)
      setTimedOut(false)
      setStatus('pending_dns')
    } catch (err) {
      setError(err.message || 'Could not connect that domain.')
    } finally {
      setBusy(false)
    }
  }

  const disconnect = async () => {
    setBusy(true)
    setError('')
    try {
      await fetch('/api/custom-domain', { method: 'DELETE', headers: authHeaders })
      setDomain(null)
      setRecords(null)
      setStatus('none')
    } catch {
      setError('Could not disconnect. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const copy = (value) => { try { navigator.clipboard.writeText(value) } catch { /* ignore */ } }

  if (status === 'loading') return <p className="text-sm text-gray-500">Loading…</p>

  if (status === 'locked') {
    return (
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Custom domain</h3>
        <p className="text-sm text-gray-500 mb-5">
          Publish to your own domain (e.g. <span className="font-mono">blog.yoursite.com</span>) with no Peach branding in the URL —
          available on Growth and Enterprise plans.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-sm font-semibold text-gray-500 px-4 py-2">← Back</button>
          <a href="/pricing" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Upgrade →
          </a>
        </div>
      </div>
    )
  }

  if (status === 'verified') {
    return (
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Custom domain</h3>
        <p className="text-sm text-emerald-600 font-semibold mb-1">✓ Connected</p>
        <p className="text-sm text-gray-500 mb-5 font-mono">{domain}</p>
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={disconnect} disabled={busy} className="text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-60 px-4 py-2">
            {busy ? 'Disconnecting…' : 'Disconnect'}
          </button>
          <button onClick={onConnected} className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Continue →
          </button>
        </div>
      </div>
    )
  }

  if (status === 'none') {
    return (
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Connect your domain</h3>
        <p className="text-sm text-gray-500 mb-3">Enter the domain or subdomain you want your blog to serve at.</p>
        <input value={domainInput} onChange={(e) => setDomainInput(e.target.value)} placeholder="blog.yoursite.com"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-sm font-semibold text-gray-500 px-4 py-2">← Back</button>
          <button onClick={connectDomain} disabled={!domainInput.trim() || busy}
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg">
            {busy ? 'Connecting…' : 'Connect domain'}
          </button>
        </div>
      </div>
    )
  }

  // pending_dns
  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-1">Verify domain ownership</h3>
      <p className="text-sm text-gray-500 mb-4">Add these DNS records at your domain provider, then check verification.</p>
      {records && (
        <div className="space-y-2 mb-4">
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TXT record</p>
            <p className="text-xs font-mono text-gray-700 break-all">Name: {records.txt.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-gray-700 break-all">Value: {records.txt.value}</p>
              <button onClick={() => copy(records.txt.value)} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800">Copy</button>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CNAME record</p>
            <p className="text-xs font-mono text-gray-700 break-all">Name: {records.cname.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-gray-700 break-all">Value: {records.cname.value}</p>
              <button onClick={() => copy(records.cname.value)} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800">Copy</button>
            </div>
          </div>
        </div>
      )}
      {timedOut && <p className="text-xs text-amber-600 mb-3">Still not verified? Double-check your DNS records — propagation can take a few minutes to a few hours.</p>}
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={disconnect} disabled={busy} className="text-sm font-semibold text-gray-500 px-4 py-2 disabled:opacity-60">Cancel</button>
        <button onClick={checkVerification} disabled={busy}
          className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg">
          Check verification
        </button>
      </div>
    </div>
  )
}

export function PublishConnectModal({ open, onClose, onConnected }) {
  const { session } = useAuth()
  const [picked, setPicked] = useState(null) // null | 'wordpress_com' | 'wordpress' | 'github' | 'peach_hosted' | 'custom_domain'

  if (!open) return null

  const cards = [
    { id: 'peach_hosted', name: 'Peach-hosted blog', desc: 'No setup — always ready, works for any site' },
    { id: 'custom_domain', name: 'Custom domain', desc: 'Your own domain, no Peach branding — Growth & Enterprise' },
    { id: 'wordpress_com', name: 'WordPress.com', desc: 'Hosted blogs — one-click connect' },
    { id: 'wordpress', name: 'Self-hosted WordPress', desc: 'WordPress.org — guided setup' },
    { id: 'github', name: 'GitHub', desc: 'Publish as .md / .mdx files' },
  ]

  const startOAuth = (provider) => {
    const path = provider === 'wordpress_com' ? '/api/auth/wordpress/start' : '/api/auth/github/start'
    window.location.href = `${path}?token=${encodeURIComponent(session?.access_token || '')}`
  }

  return (
    <div className="fixed inset-0 bg-[#172554]/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        {!picked ? (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Connect an integration</h3>
            <div className="space-y-2">
              {cards.map((c) => (
                <button key={c.id} onClick={() => setPicked(c.id)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </button>
              ))}
            </div>
          </>
        ) : picked === 'wordpress' ? (
          <WordPressWizard onConnected={() => { onConnected(); onClose(); setPicked(null) }} onCancel={() => setPicked(null)} />
        ) : picked === 'peach_hosted' ? (
          <PeachHostedWizard onConnected={() => { onConnected('peach_hosted'); onClose(); setPicked(null) }} onCancel={() => setPicked(null)} />
        ) : picked === 'custom_domain' ? (
          <CustomDomainWizard onConnected={() => { onConnected('custom_domain'); onClose(); setPicked(null) }} onCancel={() => setPicked(null)} />
        ) : (
          <>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Connect {picked === 'wordpress_com' ? 'WordPress.com' : 'GitHub'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              You'll be redirected to {picked === 'wordpress_com' ? 'WordPress.com' : 'GitHub'} to approve access, then brought back here to finish setup.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setPicked(null)} className="text-sm font-semibold text-gray-500 px-4 py-2">← Back</button>
              <button onClick={() => startOAuth(picked)}
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Continue →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
