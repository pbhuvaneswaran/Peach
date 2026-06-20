import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: '₹2,999',
    period: '/month',
    who: 'Solo marketer',
    desc: 'Everything you need to track and improve your brand\'s AI visibility.',
    cta: 'Get started',
    color: 'gray',
    features: [
      '1 domain',
      'Unlimited visibility reports',
      'Unlimited rank diagnoses',
      'AI visibility across Claude, ChatGPT, Gemini',
      'Content gap analysis',
      'Writer-ready content briefs',
      'Email rank drop alerts',
    ],
  },
  {
    name: 'Agency',
    price: '₹7,999',
    period: '/month',
    who: 'Small agency · 5–15 people',
    desc: 'Manage multiple clients without juggling multiple tools.',
    cta: 'Get started',
    color: 'indigo',
    highlighted: true,
    badge: 'Most popular',
    features: [
      '5 domains',
      'Unlimited reports across all domains',
      'Multiple team users',
      'All Starter features',
      'Competitor blog monitor',
      'Telegram + WhatsApp alerts',
      'Priority support',
    ],
  },
  {
    name: 'Agency Pro',
    price: '₹14,999',
    period: '/month',
    who: 'Larger agencies',
    desc: 'Full power with white-label output for client presentations.',
    cta: 'Get started',
    color: 'gray',
    features: [
      'Unlimited domains',
      'Unlimited reports',
      'Unlimited users',
      'All Agency features',
      'White-label report output',
      'Google Search Console integration',
      'Dedicated onboarding',
    ],
  },
]

function Check() {
  return (
    <svg className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function Pricing() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, flat pricing</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            No credits. No per-report charges. Run as many reports as you need — your subscription covers unlimited use on your domains.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 relative flex flex-col ${
                plan.highlighted
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105'
                  : 'bg-white border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h2 className={`font-bold text-lg mb-0.5 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h2>
                <p className={`text-xs mb-4 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>{plan.who}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>{plan.period}</span>
                </div>
                <p className={`text-sm ${plan.highlighted ? 'text-indigo-100' : 'text-gray-500'}`}>{plan.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    {plan.highlighted
                      ? <svg className="w-4 h-4 text-indigo-200 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      : <Check />
                    }
                    <span className={`text-sm ${plan.highlighted ? 'text-indigo-100' : 'text-gray-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/app"
                className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Why no credit system?',
                a: 'Credits kill reporting momentum. We heard this directly from the marketers we built this for. Flat monthly pricing means you can run reports whenever you need them without thinking about costs.',
              },
              {
                q: 'What counts as a domain?',
                a: 'One domain = one root domain (e.g. acme.com). You can run unlimited reports — visibility checks, rank diagnoses, content briefs — against any URLs on that domain.',
              },
              {
                q: 'Can I upgrade or downgrade anytime?',
                a: 'Yes. Your plan changes at the next billing cycle. No lock-ins.',
              },
              {
                q: 'Is there a free trial?',
                a: 'You can run a demo report without signing up to see exactly what the tool produces. When you\'re ready to track your own brand, start a paid plan.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
