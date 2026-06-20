import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    who: 'Solo marketer',
    desc: 'Track AI visibility for one brand. Unlimited reports.',
    cta: 'Get started',
    features: [
      '1 domain / brand',
      'Unlimited visibility reports',
      'All 3 AI engines (Claude, ChatGPT, Gemini)',
      '10 buyer-intent questions per run',
      'Gap analysis + content recommendations',
      'Email support',
    ],
  },
  {
    name: 'Agency',
    price: '$149',
    period: '/month',
    who: 'Agency · 5–15 people',
    desc: 'Manage multiple clients from one dashboard.',
    cta: 'Get started',
    highlighted: true,
    badge: 'Most popular',
    features: [
      '5 domains / brands',
      'Unlimited reports across all domains',
      'Up to 5 team members',
      'All Starter features',
      'Competitor blog monitoring',
      'Slack + email alerts',
      'Priority support',
    ],
  },
  {
    name: 'Agency Pro',
    price: '$299',
    period: '/month',
    who: 'Larger agencies',
    desc: 'Unlimited brands, white-label output, full team access.',
    cta: 'Get started',
    features: [
      'Unlimited domains / brands',
      'Unlimited reports',
      'Unlimited team members',
      'All Agency features',
      'White-label PDF reports',
      'GSC integration (coming soon)',
      'Dedicated onboarding call',
    ],
  },
]

function Check({ light }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${light ? 'text-indigo-200' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function PricingV2() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple pricing. Unlimited reports.</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            No credits. No per-report fees. Run as many visibility checks as you need — your plan covers everything.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {plans.map((plan) => (
            <div key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col relative ${
                plan.highlighted ? 'bg-indigo-600 border-indigo-600 shadow-xl scale-[1.03]' : 'bg-white border-gray-200'
              }`}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h2 className={`font-bold text-lg mb-0.5 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h2>
                <p className={`text-xs mb-4 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>{plan.who}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                <p className={`text-sm ${plan.highlighted ? 'text-indigo-100' : 'text-gray-500'}`}>{plan.desc}</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check light={plan.highlighted} />
                    <span className={`text-sm ${plan.highlighted ? 'text-indigo-100' : 'text-gray-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/v2/app"
                className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                  plan.highlighted ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Questions</h2>
          <div className="space-y-3">
            {[
              ['Why no credit system?', 'Credits kill reporting momentum. A flat monthly plan means you run reports when you need to, not when you have budget left.'],
              ['What\'s a "domain"?', 'One root domain (e.g. acme.com). You can run unlimited reports — visibility checks, gap analyses, content briefs — for any brand on that domain.'],
              ['Can I change plans?', 'Anytime. Upgrades take effect immediately. Downgrades apply at next billing cycle.'],
              ['Do you offer a trial?', 'Run a demo report to see exactly what you\'d get before subscribing.'],
            ].map(([q, a]) => (
              <div key={q} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
