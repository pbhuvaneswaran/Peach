import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const navLink = (to, label) => (
    <Link to={to}
      className={`text-sm transition-colors ${location.pathname === to ? 'text-black font-medium' : 'text-neutral-500 hover:text-black'}`}>
      {label}
    </Link>
  )

  return (
    <nav className="bg-white sticky top-0 z-50 print:hidden border-b border-neutral-200">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="brand-wordmark text-black text-xl">Peach</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/features', 'Features')}
          {navLink('/pricing', 'Pricing')}
          {navLink('/blog', 'Blog')}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-neutral-500 max-w-[140px] truncate">{user.email}</span>
              <button onClick={handleSignOut}
                className="text-sm text-neutral-500 hover:text-black transition-colors px-3 py-1.5">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-neutral-500 hover:text-black transition-colors px-3 py-1.5">
                Sign in
              </Link>
              <Link to="/app" onClick={() => localStorage.removeItem('peach_last_result')}
                className="text-sm font-medium bg-black text-white px-4 py-1.5 rounded-full hover:bg-neutral-800 transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-neutral-500" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-6 py-5 space-y-4">
          <Link to="/features" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-700 hover:text-black">Features</Link>
          <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-700 hover:text-black">Pricing</Link>
          <Link to="/blog" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-700 hover:text-black">Blog</Link>
          {user ? (
            <>
              <span className="block text-sm text-neutral-500 truncate">{user.email}</span>
              <button onClick={() => { setMobileOpen(false); handleSignOut() }}
                className="block text-sm text-neutral-700 hover:text-black">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-700 hover:text-black">Sign in</Link>
              <Link to="/app" onClick={() => { setMobileOpen(false); localStorage.removeItem('peach_last_result') }}
                className="inline-block text-sm font-medium bg-black text-white px-5 py-2 rounded-full">
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
