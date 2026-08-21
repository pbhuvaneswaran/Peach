import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PeachLogo from './PeachLogo'

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
      className={`text-base transition-colors ${location.pathname === to ? 'text-white font-medium' : 'text-blue-200 hover:text-white'}`}>
      {label}
    </Link>
  )

  return (
    <nav className="bg-blue-900 sticky top-0 z-50 print:hidden border-b border-blue-800">
      <div className="max-w-6xl mx-auto px-6 h-28 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <PeachLogo iconClassName="h-9 w-11" textClassName="text-3xl" />
        </Link>

        {/* Desktop nav + actions, grouped on the right */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-10">
            {navLink('/features', 'Features')}
            {navLink('/pricing', 'Pricing')}
            {navLink('/blog', 'Blog')}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-base text-blue-200 max-w-[140px] truncate">{user.email}</span>
              <button onClick={handleSignOut}
                className="text-base text-blue-200 hover:text-white transition-colors px-3 py-1.5">
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login"
              className="text-base font-medium text-white border border-white/25 px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-blue-200" onClick={() => setMobileOpen(!mobileOpen)}>
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
        <div className="md:hidden border-t border-blue-800 bg-blue-900 px-6 py-5 space-y-4">
          <Link to="/features" onClick={() => setMobileOpen(false)} className="block text-sm text-blue-100 hover:text-white">Features</Link>
          <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-blue-100 hover:text-white">Pricing</Link>
          <Link to="/blog" onClick={() => setMobileOpen(false)} className="block text-sm text-blue-100 hover:text-white">Blog</Link>
          {user ? (
            <>
              <span className="block text-sm text-blue-200 truncate">{user.email}</span>
              <button onClick={() => { setMobileOpen(false); handleSignOut() }}
                className="block text-sm text-blue-100 hover:text-white">Sign out</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="inline-block text-sm font-medium text-white border border-white/25 px-5 py-2 rounded-full">
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
