import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import { BlogList, BlogPost } from './pages/Blog'
import About from './pages/About'
import AppHome from './pages/AppHome'

function Layout({ children, noFooter }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/features" element={<Layout><Features /></Layout>} />
        <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
        <Route path="/blog" element={<Layout><BlogList /></Layout>} />
        <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/app" element={<Layout noFooter><AppHome /></Layout>} />
        <Route path="*" element={<Layout><div className="max-w-xl mx-auto px-6 py-24 text-center"><h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1><a href="/" className="text-indigo-600 hover:underline text-sm">Go home →</a></div></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
