import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="brand-wordmark text-black text-lg">Peach</span>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">
          <Link to="/features" className="hover:text-black transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-black transition-colors">Pricing</Link>
          <Link to="/blog" className="hover:text-black transition-colors">Blog</Link>
          <a href="mailto:hello@gotopeach.com" className="hover:text-black transition-colors">Contact</a>
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="#" className="hover:text-black transition-colors">Terms</a>
        </div>
        <p className="text-xs text-neutral-400">© {new Date().getFullYear()} Peach</p>
      </div>
    </footer>
  )
}
