import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { btnBase, btnStyle, StepTransition, Modal } from '../lib/motion'

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

// A labeled, copyable code block — used by the reverse-proxy setup snippets.
function CodeBlock({ label, code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    try { navigator.clipboard.writeText(code) } catch { /* ignore */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <button onClick={copy} className={`text-[10px] font-semibold ${copied ? 'text-emerald-600' : 'text-blue-600 hover:text-blue-800'} ${btnBase}`} style={btnStyle()}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="text-[11px] font-mono text-gray-700 p-3 overflow-x-auto whitespace-pre-wrap break-all">{code}</pre>
    </div>
  )
}

// Per-platform reverse-proxy snippets, forwarding <domain>/blog/* to the customer's stable
// Peach-hosted target (gotopeach.com/blog/:handle/*). Each explicitly sets X-Forwarded-Host
// where the platform doesn't already do it automatically, since server.js's canonical-URL
// logic (getVerifiedForwardedHost) only trusts that header to attribute SEO credit correctly.
function proxyPlatforms(handle, domain) {
  const target = `https://www.gotopeach.com/blog/${handle}`
  return {
    vercel: {
      label: 'Vercel',
      note: 'Add to your vercel.json (Vercel forwards X-Forwarded-Host automatically for external rewrites).',
      code: `{
  "rewrites": [
    { "source": "/blog", "destination": "${target}" },
    { "source": "/blog/:slug", "destination": "${target}/:slug" }
  ]
}`,
    },
    cloudflare: {
      label: 'Cloudflare Worker',
      note: `Add a Worker route for ${domain}/blog/* pointing at this script.`,
      code: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const dest = new URL(
      "https://www.gotopeach.com" + url.pathname.replace("/blog", "/blog/${handle}") + url.search
    );
    const proxyReq = new Request(dest, request);
    proxyReq.headers.set("X-Forwarded-Host", url.hostname);
    return fetch(proxyReq);
  }
}`,
    },
    netlify: {
      label: 'Netlify',
      note: 'Add to your _redirects file (Netlify forwards X-Forwarded-Host automatically for proxy rules).',
      code: `/blog  ${target}  200!
/blog/*  ${target}/:splat  200!`,
    },
    nginx: {
      label: 'Nginx',
      note: 'Add to your server block.',
      code: `location /blog/ {
    proxy_pass ${target}/;
    proxy_set_header Host www.gotopeach.com;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}`,
    },
    other: {
      label: 'Other platform',
      note: 'Any platform that can reverse-proxy: forward every request under /blog/* on your domain to the URL below, preserving the path after /blog, and set an X-Forwarded-Host header equal to your own domain so Peach can give your domain SEO credit.',
      code: `${target}/*`,
    },
  }
}

function CustomDomainWizard({ onConnected, onCancel }) {
  const { session } = useAuth()
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` }

  const [status, setStatus] = useState('loading') // loading | locked | none | pending_dns | verified | proxy_setup
  const [domainInput, setDomainInput] = useState('')
  const [domain, setDomain] = useState(null)
  const [records, setRecords] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  // Proxy-setup step needs the customer's blog handle (the /blog/:handle/* target they
  // proxy to). If they connected a custom domain without ever setting one up via the
  // Peach-hosted-blog option, offer to pick one right here instead of sending them away.
  const [handle, setHandle] = useState(null)
  const [handleInput, setHandleInput] = useState('')
  const [handleSaving, setHandleSaving] = useState(false)
  const [handleError, setHandleError] = useState('')
  const [platform, setPlatform] = useState('vercel')

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
        setHandle(data.handle || null)
        setHandleInput(data.handle || data.suggested || '')
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

  const saveHandle = async () => {
    setHandleSaving(true)
    setHandleError('')
    try {
      const res = await fetch('/api/blog-handle', { method: 'POST', headers: authHeaders, body: JSON.stringify({ handle: handleInput }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error === 'handle_taken' ? 'That handle is already taken.' : (data.error || 'Could not save.'))
      setHandle(data.handle)
    } catch (err) {
      setHandleError(err.message || 'Could not save.')
    } finally {
      setHandleSaving(false)
    }
  }

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

  if (status === 'loading') return <p className="text-sm text-gray-500">Loading…</p>

  if (status === 'locked') {
    return (
      <StepTransition stepKey={status}>
        <h3 className="text-base font-bold text-gray-900 mb-1">Custom domain</h3>
        <p className="text-sm text-gray-500 mb-5">
          Publish to your own domain (e.g. <span className="font-mono">yoursite.com/blog</span>) with no Peach branding in the URL —
          available on Growth and Enterprise plans.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className={`text-sm font-semibold text-gray-500 px-4 py-2 ${btnBase}`} style={btnStyle()}>← Back</button>
          <a href="/pricing" className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg ${btnBase}`} style={btnStyle()}>
            Upgrade →
          </a>
        </div>
      </StepTransition>
    )
  }

  if (status === 'verified') {
    return (
      <StepTransition stepKey={status}>
        <h3 className="text-base font-bold text-gray-900 mb-1">Custom domain</h3>
        <p className="text-sm text-emerald-600 font-semibold mb-1">✓ Connected</p>
        <p className="text-sm text-gray-500 mb-5 font-mono">{domain}</p>
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={disconnect} disabled={busy} className={`text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-60 px-4 py-2 ${btnBase}`} style={btnStyle()}>
            {busy ? 'Disconnecting…' : 'Disconnect'}
          </button>
          <button onClick={() => setStatus('proxy_setup')} className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg ${btnBase}`} style={btnStyle()}>
            Continue →
          </button>
        </div>
      </StepTransition>
    )
  }

  if (status === 'none') {
    return (
      <StepTransition stepKey={status}>
        <h3 className="text-base font-bold text-gray-900 mb-1">Connect your domain</h3>
        <p className="text-sm text-gray-500 mb-3">Enter the domain you want your blog to publish under (e.g. <span className="font-mono">yoursite.com</span> — your blog will live at <span className="font-mono">yoursite.com/blog</span>).</p>
        <input value={domainInput} onChange={(e) => setDomainInput(e.target.value)} placeholder="yoursite.com"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className={`text-sm font-semibold text-gray-500 px-4 py-2 ${btnBase}`} style={btnStyle()}>← Back</button>
          <button onClick={connectDomain} disabled={!domainInput.trim() || busy}
            className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg ${btnBase}`} style={btnStyle()}>
            {busy ? 'Connecting…' : 'Connect domain'}
          </button>
        </div>
      </StepTransition>
    )
  }

  if (status === 'pending_dns') {
    return (
      <StepTransition stepKey={status}>
        <h3 className="text-base font-bold text-gray-900 mb-1">Verify domain ownership</h3>
        <p className="text-sm text-gray-500 mb-4">Add this DNS record at your domain provider to prove you own <span className="font-mono">{domain}</span>, then check verification. This does not change where your site is hosted.</p>
        {records && (
          <div className="mb-4">
            <CodeBlock label={`TXT record — ${records.txt.name}`} code={records.txt.value} />
          </div>
        )}
        {timedOut && <p className="text-xs text-amber-600 mb-3">Still not verified? Double-check the TXT record — DNS propagation can take a few minutes to a few hours.</p>}
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={disconnect} disabled={busy} className={`text-sm font-semibold text-gray-500 px-4 py-2 disabled:opacity-60 ${btnBase}`} style={btnStyle()}>Cancel</button>
          <button onClick={checkVerification} disabled={busy}
            className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg ${btnBase}`} style={btnStyle()}>
            Check verification
          </button>
        </div>
      </StepTransition>
    )
  }

  // proxy_setup — final step: point <domain>/blog/* at Peach via a reverse proxy on the
  // customer's own hosting platform. Needs a blog handle first (the stable target path);
  // offer to pick one inline if they connected a custom domain without setting one up.
  if (!handle) {
    return (
      <StepTransition stepKey="proxy_setup_handle">
        <h3 className="text-base font-bold text-gray-900 mb-1">Almost there — pick a handle</h3>
        <p className="text-sm text-gray-500 mb-3">
          This is your stable Peach-hosted target — <span className="font-mono">{domain}/blog</span> will proxy to it. It's not shown publicly once your domain is set up.
        </p>
        <input value={handleInput} onChange={(e) => setHandleInput(e.target.value)} placeholder="your-brand"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {handleError && <p className="text-xs text-red-600 mb-3">{handleError}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={() => setStatus('verified')} className={`text-sm font-semibold text-gray-500 px-4 py-2 ${btnBase}`} style={btnStyle()}>← Back</button>
          <button onClick={saveHandle} disabled={!handleInput.trim() || handleSaving}
            className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg ${btnBase}`} style={btnStyle()}>
            {handleSaving ? 'Saving…' : 'Save & continue'}
          </button>
        </div>
      </StepTransition>
    )
  }

  const platforms = proxyPlatforms(handle, domain)
  const active = platforms[platform]

  return (
    <StepTransition stepKey="proxy_setup">
      <h3 className="text-base font-bold text-gray-900 mb-1">Set up the redirect</h3>
      <p className="text-sm text-gray-500 mb-4">
        One last step on your end: forward <span className="font-mono">{domain}/blog/*</span> to Peach. Pick your hosting platform below for the exact config.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Object.entries(platforms).map(([key, p]) => (
          <button key={key} onClick={() => setPlatform(key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${btnBase} ${
              platform === key ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`} style={btnStyle()}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-2">{active.note}</p>
      <div className="mb-5">
        <CodeBlock label={active.label} code={active.code} />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setStatus('verified')} className={`text-sm font-semibold text-gray-500 px-4 py-2 ${btnBase}`} style={btnStyle()}>← Back</button>
        <button onClick={onConnected} className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg ${btnBase}`} style={btnStyle()}>
          Done →
        </button>
      </div>
    </StepTransition>
  )
}

export function PublishConnectModal({ open, onClose, onConnected }) {
  const { session } = useAuth()
  const [picked, setPicked] = useState(null) // null | 'wordpress_com' | 'wordpress' | 'github' | 'peach_hosted' | 'custom_domain'

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
    <Modal show={open} onClose={onClose} panelClassName="bg-white rounded-2xl w-full max-w-md p-6">
      <StepTransition stepKey={picked || 'chooser'}>
        {!picked ? (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Connect an integration</h3>
            <div className="space-y-2">
              {cards.map((c) => (
                <button key={c.id} onClick={() => setPicked(c.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors ${btnBase}`}
                  style={btnStyle()}>
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
              <button onClick={() => setPicked(null)} className={`text-sm font-semibold text-gray-500 px-4 py-2 ${btnBase}`} style={btnStyle()}>← Back</button>
              <button onClick={() => startOAuth(picked)}
                className={`text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg ${btnBase}`} style={btnStyle()}>
                Continue →
              </button>
            </div>
          </>
        )}
      </StepTransition>
    </Modal>
  )
}
