import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_PLATFORMS, PlatformChip, PlatformRow } from '../components/llmPlatforms'

function Check() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#5B3DF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ─── Plan definitions ─────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Starter',
    monthly: 89,
    yearly: 74,
    yearlyTotal: 890,
    who: 'Solo marketer or founder',
    platforms: ['chatgpt', 'gemini', 'googleaio'],
    usageLine: '40 prompts tracked / month · 1 domain',
    included: [
      'AI Visibility Report',
      'Gap Opportunities',
      'Action Plan',
      'CSV export',
      'Email support',
    ],
    cta: 'Get started',
    ctaLink: '/app',
  },
  {
    name: 'Growth',
    monthly: 199,
    yearly: 166,
    yearlyTotal: 1990,
    who: 'Growing brands & marketers',
    platforms: ['chatgpt', 'gemini', 'perplexity', 'googleaio'],
    usageLine: '80 prompts tracked / month · 5 domains',
    highlighted: true,
    badge: 'Most popular',
    included: [
      'Everything in Starter',
      'Competitor analysis',
      'Google AI Overview tracking',
      'AI crawler audit',
      'Dashboard trends',
      'Priority support',
    ],
    cta: 'Get started',
    ctaLink: '/app',
  },
  {
    name: 'Scale',
    monthly: 349,
    yearly: 291,
    yearlyTotal: 3490,
    who: 'Agencies & large teams',
    platforms: ['chatgpt', 'gemini', 'perplexity', 'googleaio', 'claude'],
    usageLine: '150 prompts tracked / month · 20 domains',
    included: [
      'Everything in Growth',
      'Weekly monitoring',
      'PDF report download',
      '3 team seats',
      'Dedicated onboarding call',
    ],
    cta: 'Get started',
    ctaLink: '/app',
  },
]

const ENTERPRISE = {
  included: [
    'Unlimited prompts',
    'Unlimited domains',
    'White-label reports',
    'Custom integrations',
    'Claude tracking',
    'SLA support',
  ],
}

const FAQS = [
  {
    q: 'What counts as a prompt?',
    a: 'Each visibility run tests your brand across 3 buyer-intent queries. 40 prompts/mo = ~13 full runs per month.',
  },
  {
    q: 'Can I run any website?',
    a: 'Yes. Enter any URL — we crawl it and auto-generate category-specific queries. No manual setup needed.',
  },
  {
    q: "What's the difference between ChatGPT and Google AI Overview?",
    a: 'ChatGPT answers from training data (knowledge cutoff). Google AIO pulls from live web results. Both matter for different buyer moments.',
  },
  {
    q: 'Can I upgrade or downgrade?',
    a: 'Yes, any time. Changes take effect at the next billing cycle. No lock-ins or cancellation fees.',
  },
]

function FAQItem({ item, open, onToggle }) {
  return (
    <div className="bg-white border border-[#E8E2F5] rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#F8F6FE] transition-colors">
        <span className="font-semibold text-[#14182B] text-[15px]">{item.q}</span>
        <span className="w-6 h-6 flex items-center justify-center text-[#5B3DF5] text-lg flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-[#677085] leading-relaxed">{item.a}</div>
      )}
    </div>
  )
}

// ─── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, annual, expanded, onToggleExpand }) {
  const highlighted = plan.highlighted
  const price = annual ? plan.yearly : plan.monthly
  const visibleFeatures = expanded ? plan.included : plan.included.slice(0, 5)
  const hasMore = plan.included.length > 5

  return (
    <div className={`relative rounded-[20px] p-8 flex flex-col bg-white border transition-all ${
      highlighted ? 'border-[#5B3DF5] bg-[#F8F6FE] shadow-md' : 'border-[#E8E2F5] shadow-sm'
    }`}>
      {highlighted && (
        <div className="absolute top-0 left-8 right-8 h-1 bg-[#5B3DF5] rounded-b-full" />
      )}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5B3DF5] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">
          {plan.badge}
        </div>
      )}

      <h2 className="font-bold text-lg text-[#14182B] mb-1">{plan.name}</h2>
      <p className="text-sm text-[#677085] mb-6">{plan.who}</p>

      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold text-[#14182B]">${price}</span>
          <span className="text-sm text-[#677085] mb-0.5">/mo</span>
        </div>
        {annual && <p className="text-xs text-[#677085] mt-1">billed ${plan.yearlyTotal}/yr</p>}
      </div>

      <PlatformRow platforms={plan.platforms} showScanning={false} />

      <p className="text-sm font-semibold text-[#14182B] mb-4">{plan.usageLine}</p>
      <div className="border-t border-[#E8E2F5] mb-5" />

      <div className="mb-6 flex-1">
        <p className="text-xs font-semibold text-[#677085] uppercase tracking-wide mb-3">Included</p>
        <ul className="space-y-2.5">
          {visibleFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check />
              <span className="text-sm text-[#14182B]/90 leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button onClick={onToggleExpand} className="text-xs font-semibold text-[#5B3DF5] hover:text-[#4c30dd] mt-3">
            {expanded ? 'Show fewer features ↑' : 'See all features ↓'}
          </button>
        )}
      </div>

      <Link
        to={plan.ctaLink}
        className="block text-center text-sm font-semibold py-3 rounded-xl transition-colors bg-[#5B3DF5] hover:bg-[#4c30dd] text-white"
      >
        {plan.cta} →
      </Link>
    </div>
  )
}

// ─── Pricing Page ─────────────────────────────────────────────────────────────

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const [expandedPlans, setExpandedPlans] = useState({})
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="bg-[#FCFAF6] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-[#14182B] mb-3">Plans & Pricing</h1>
          <p className="text-lg text-[#677085] max-w-xl mx-auto mb-6">
            Know where you stand in AI search. Start free, scale when you're ready.
          </p>

          <div className="inline-flex items-center gap-1 bg-[#F1EDFF] rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${!annual ? 'bg-white text-[#14182B] shadow-sm' : 'text-[#677085]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${annual ? 'bg-white text-[#14182B] shadow-sm' : 'text-[#677085]'}`}
            >
              Annual
              <span className="text-[10px] font-black bg-[#DCF5E4] text-[#1B8A4A] px-1.5 py-0.5 rounded-full">Save 2 mo</span>
            </button>
          </div>
        </div>

        {/* 3-card row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              annual={annual}
              expanded={!!expandedPlans[plan.name]}
              onToggleExpand={() => setExpandedPlans((prev) => ({ ...prev, [plan.name]: !prev[plan.name] }))}
            />
          ))}
        </div>
      </div>

      {/* Enterprise — separate horizontal section */}
      <section className="bg-[#F1EDFF] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-[24px] border border-[#E8E2F5] p-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#14182B] mb-2">Enterprise</h2>
              <p className="text-sm text-[#677085] mb-4">For large teams, agencies, and white-label workflows.</p>
              <p className="text-[#14182B] leading-relaxed">
                Custom AI visibility monitoring built around your clients, domains, and reporting needs.
              </p>
            </div>
            <div>
              <PlatformRow platforms={ALL_PLATFORMS} extraLabel="Plus custom monitoring options" showScanning={false} />
              <ul className="space-y-2.5 mb-6">
                {ENTERPRISE.included.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check />
                    <span className="text-sm text-[#14182B]/90 leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:hello@gotopeach.com"
                className="inline-block text-center text-sm font-semibold py-3 px-6 rounded-xl border border-[#5B3DF5] text-[#5B3DF5] hover:bg-[#F1EDFF] transition-colors"
              >
                Talk to us →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Free report — conversion moment */}
      <section className="bg-[#FFF1E6] py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-[#B4632A] uppercase tracking-widest mb-3">Not ready to commit?</p>
          <h2 className="text-3xl font-bold text-[#14182B] mb-4">Start with one free visibility report.</h2>
          <p className="text-[#677085] mb-8">
            See how AI describes your brand, where competitors are cited, and what to improve next.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['AI visibility score', 'Competitor gaps', 'Content action plan'].map((pill) => (
              <span key={pill} className="text-sm font-medium text-[#14182B] bg-white border border-[#E8E2F5] px-4 py-2 rounded-full">{pill}</span>
            ))}
          </div>

          <p className="text-[#14182B] font-medium mb-4">See how your brand appears across the AI answers buyers trust.</p>
          <div className="flex justify-center mb-2">
            <div className="flex flex-wrap justify-center gap-2">
              {ALL_PLATFORMS.map((key, i) => <PlatformChip key={key} platformKey={key} index={i} />)}
            </div>
          </div>
          <p className="text-[10px] text-[#677085] mb-10">Platform names and logos are trademarks of their respective owners. Peach is not affiliated with or endorsed by these companies.</p>

          <Link
            to="/login"
            onClick={() => localStorage.removeItem('peach_last_result')}
            className="inline-block bg-[#5B3DF5] hover:bg-[#4c30dd] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
          >
            Check your AI visibility →
          </Link>
          <p className="text-xs text-[#677085] mt-3">No credit card · Results in under 3 minutes</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24">
        <div className="max-w-[760px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#14182B] text-center mb-2">Questions before you choose a plan.</h2>
          <p className="text-[#677085] text-center mb-10">Everything you need to know before tracking your AI visibility.</p>
          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <FAQItem key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
