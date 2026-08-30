import { Link } from 'react-router-dom'
import PeachLogo from './PeachLogo'
import { btnBase, btnStyle } from '../lib/motion'

export default function Footer() {
  return (
    <footer className="bg-blue-950 border-t border-blue-900 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-[1.2fr_1fr_1fr] gap-10">
          <div>
            <PeachLogo iconClassName="h-6 w-8" textClassName="text-lg" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-blue-300">
              AI visibility for brands. See where you appear, who gets cited instead, and what to improve next.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-blue-400 mb-3.5">Peach</p>
            <div className="grid gap-2.5 text-sm text-blue-200">
              <Link to="/features" className="hover:text-white transition-colors w-fit">Features</Link>
              <Link to="/pricing" className="hover:text-white transition-colors w-fit">Pricing</Link>
              <Link to="/blog" className="hover:text-white transition-colors w-fit">Blog</Link>
              <Link to="/login" className="hover:text-white transition-colors w-fit">Sign in</Link>
              <a href="mailto:hello@gotopeach.com" className="hover:text-white transition-colors w-fit">Customer support</a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-blue-400 mb-3.5">Follow Peach</p>
            <div className="flex gap-2.5">
              <a href="https://www.linkedin.com/company/gotopeach" target="_blank" rel="noopener noreferrer" aria-label="Peach on LinkedIn"
                className={`w-9 h-9 rounded-lg border border-blue-800 grid place-items-center text-blue-200 text-sm font-bold hover:bg-blue-900 hover:text-white transition-colors ${btnBase}`} style={btnStyle()}>in</a>
              <a href="https://x.com/go2peach" target="_blank" rel="noopener noreferrer" aria-label="Peach on X"
                className={`w-9 h-9 rounded-lg border border-blue-800 grid place-items-center text-blue-200 text-sm font-bold hover:bg-blue-900 hover:text-white transition-colors ${btnBase}`} style={btnStyle()}>X</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-blue-400">© {new Date().getFullYear()} Peach</p>
          <a href="mailto:hello@gotopeach.com" className="text-xs text-blue-400 hover:text-white transition-colors">hello@gotopeach.com</a>
        </div>
      </div>
    </footer>
  )
}
