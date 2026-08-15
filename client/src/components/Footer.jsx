import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-blue-950 border-t border-blue-900 mt-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="brand-wordmark text-white text-lg">Peach</span>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-blue-300">
          <Link to="/features" className="hover:text-white transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <a href="mailto:hello@gotopeach.com" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="text-xs text-blue-400">© {new Date().getFullYear()} Peach</p>
      </div>
    </footer>
  )
}
