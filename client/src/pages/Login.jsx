import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'check-email'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleEmail = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Enter your email address.')
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/app` },
      })
      if (err) throw err
      setMode('check-email')
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    // TODO: wire Google OAuth once credentials are added to Supabase dashboard
    setError('Google sign-in coming soon — use email for now.')
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <Link to="/" className="mb-8">
        <span className="text-3xl font-bold text-gray-900 tracking-tight">Peach</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

        {mode === 'check-email' ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-6">
              We sent a magic link to <span className="font-semibold text-gray-700">{email}</span>.<br />
              Click it to sign in — no password needed.
            </p>
            <button
              onClick={() => { setMode('signin'); setEmail('') }}
              className="text-sm text-indigo-600 hover:underline"
            >
              ← Use a different email
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-gray-400 text-center mb-7">
              {mode === 'signin' ? 'Sign in to your Peach account' : 'Start tracking your AI visibility'}
            </p>

            <form onSubmit={handleEmail} className="space-y-3 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Sending...' : 'Continue'}
              </button>
            </form>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="text-center text-sm text-gray-400 mt-6">
              {mode === 'signin' ? (
                <>New here?{' '}
                  <button onClick={() => setMode('signup')} className="text-indigo-600 font-medium hover:underline">
                    Create an account
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => setMode('signin')} className="text-indigo-600 font-medium hover:underline">
                    Sign in
  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-6 text-center">
        By continuing you agree to our{' '}
        <Link to="/terms" className="underline hover:text-gray-600">Terms</Link>{' '}
        and{' '}
        <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
      </p>
    </div>
  )
}
