import { useState } from 'react'
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

export function PublishConnectModal({ open, onClose, onConnected }) {
  const { session } = useAuth()
  const [picked, setPicked] = useState(null) // null | 'wordpress_com' | 'wordpress' | 'github'

  if (!open) return null

  const cards = [
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
