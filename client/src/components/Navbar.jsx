import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar({ version = 'v1' }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const v2 = version === 'v2'
  const pricingLink = v2 ? '/v2/pricing' : '/pricing'
  const featuresLink = '/features'

  return (
    <nav className="bg-[#FCFAF6] sticky top-0 z-50 print:hidden border-b border-[#E8E2F5] shadow-[0_1px_0_rgba(20,24,43,0.02)]">
      <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="w-7 h-7 rounded-lg bg-[#FFD8C2] flex items-center justify-center text-[#5B3DF5] text-sm font-bold">✳</span>
          <span className="brand-wordmark text-[#14182B] text-2xl">Peach</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to={featuresLink}
            className={`text-sm font-medium transition-colors ${location.pathname === featuresLink ? 'text-[#5B3DF5]' : 'text-[#677085] hover:text-[#14182B]'}`}>
            Features
          </Link>
          <Link to={pricingLink}
            className={`text-sm font-medium transition-colors ${location.pathname === pricingLink ? 'text-[#5B3DF5]' : 'text-[#677085] hover:text-[#14182B]'}`}>
            Pricing
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-[#677085] hover:text-[#14182B] transition-colors">
            Sign in
          </Link>
          <Link to="/login"
            className="bg-[#5B3DF5] hover:bg-[#4c30dd] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Try for free
          </Link>
        </div>

        <button className="md:hidden p-2 text-[#677085]" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8E2F5] px-6 py-4 space-y-3 bg-[#FCFAF6]">
          <Link to={featuresLink} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#14182B] hover:text-[#5B3DF5]">Features</Link>
          <Link to={pricingLink} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#14182B] hover:text-[#5B3DF5]">Pricing</Link>
          <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#14182B] hover:text-[#5B3DF5]">Sign in</Link>
          <Link to="/login" onClick={() => setMobileOpen(false)}
            className="block w-full text-center bg-[#5B3DF5] text-white text-sm font-semibold px-4 py-2.5 rounded-lg mt-2">
            Try for free
          </Link>
        </div>
      )}
    </nav>
  )
}
