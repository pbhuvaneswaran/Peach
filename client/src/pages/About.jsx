import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">About</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-6">
            Built by a marketer, for marketers
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-4">
            I'm Bhuvaneswaran P — content marketer. I built this tool because I kept running into the same wall:
            switching between GSC, Ahrefs, Semrush, and 5 browser tabs just to answer one question — <em>why did this post drop?</em>
          </p>
          <p className="text-gray-500 leading-relaxed mb-4">
            Then AI search changed the game. My colleagues started asking a new question: <em>does our brand even show up when someone asks ChatGPT about our category?</em> Nobody had a clean answer.
          </p>
          <p className="text-gray-500 leading-relaxed">
            I built Visibility.ai to answer both. It started as an SEO rank diagnosis tool — paste a URL, get a diagnosis. Then I talked to 20+ marketers and agency owners. The bigger pain was AEO/GEO visibility: brands spending months on content but invisible in AI-generated answers. This tool now covers both.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
          <h2 className="font-bold text-gray-900 mb-4">What we believe</h2>
          <div className="space-y-4">
            {[
              ['No credits', 'Credit systems kill reporting momentum. Flat monthly pricing means you can run reports whenever you need to.'],
              ['Plain English, not raw data', 'The output is a diagnosis and an action plan — not a spreadsheet you still need to interpret.'],
              ['Writer-ready output', 'Every gap analysis ends with a content brief. No extra step between insight and execution.'],
              ['Built from real feedback', 'Every feature in this tool was requested by a real marketer. Not invented. Validated.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{title} — </span>
                  <span className="text-sm text-gray-500">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 mb-10">
          <h2 className="font-bold text-indigo-900 mb-2">This is Project Shipyard S2</h2>
          <p className="text-sm text-indigo-700 leading-relaxed">
            I'm building this in public — every sprint, every decision, every pivot. Follow along on LinkedIn to see what gets shipped, what gets cut, and what the users actually say.
          </p>
          <a href="https://linkedin.com/in/bhuvaneswaran" target="_blank" rel="noreferrer"
            className="inline-block mt-4 text-sm font-semibold text-indigo-600 hover:underline">
            Follow the build on LinkedIn →
          </a>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Questions? Feedback?</h2>
          <p className="text-gray-500 text-sm mb-5">I read every message. Especially if you've found something broken or something missing.</p>
          <a href="mailto:hello@visibility.ai"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            Email me →
          </a>
        </div>
      </div>
    </div>
  )
}
