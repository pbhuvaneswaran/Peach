import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { resolvePostAuthRedirect } from '../lib/postAuthIntent'
import { btnBase, btnStyle } from '../lib/motion'

const INDUSTRIES = [
  'SaaS / Software',
  'E-commerce / Retail',
  'Agency / Consulting',
  'Professional Services',
  'Healthcare / Wellness',
  'Finance / Fintech',
  'Education / EdTech',
  'Real Estate',
  'Media / Publishing',
  'Other',
]

const ROLES = [
  'Founder / CEO',
  'Marketing Manager',
  'SEO / Content Lead',
  'Agency Owner',
  'Freelancer',
  'Product Manager',
  'Other',
]

export default function Onboarding() {
  useEffect(() => { document.title = 'Set up your account — Peach' }, [])
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    website_url: localStorage.getItem('peach_prefill_url') || '',
    role: '',
  })

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company_name.trim()) return setError('Company name is required.')
    setError('')
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }

      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      await resolvePostAuthRedirect(navigate, session)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }

    try {
      await fetch('/api/profile/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ company_name: '', industry: '', website_url: form.website_url, role: '' }),
      })
    } catch {
      // ignore — resolvePostAuthRedirect still proceeds; worst case is they're asked again next time
    }

    await resolvePostAuthRedirect(navigate, session)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <Link to="/" className="mb-8">
        <span className="text-3xl font-bold text-white tracking-tight">Peach</span>
      </Link>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-white" />
        <div className="w-8 h-px bg-white/30" />
        <div className="w-2 h-2 rounded-full bg-white/40" />
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-800/20 p-8">
        <div className="mb-6">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Step 1 of 1</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Tell us about your business</h2>
          <p className="text-sm text-gray-400">We use this to tailor your AI visibility reports.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Company name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={set('company_name')}
              placeholder="Acme Inc."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
            <select
              value={form.industry}
              onChange={set('industry')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select your industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Website URL</label>
            <input
              type="text"
              value={form.website_url}
              onChange={set('website_url')}
              placeholder="yourcompany.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your role</label>
            <select
              value={form.role}
              onChange={set('role')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select your role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2 ${btnBase}`}
            style={btnStyle()}
          >
            {saving ? 'Saving…' : 'Continue to Peach →'}
          </button>
        </form>

        <button
          onClick={handleSkip}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
        >
          Skip for now
        </button>
      </div>

      <p className="text-xs text-blue-200 mt-6 text-center">
        You can update this any time in your account settings.
      </p>
    </div>
  )
}
