import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ALL_PLATFORMS, PlatformChip, PlatformRow } from '../components/llmPlatforms'
import { useAuth } from '../context/AuthContext'
import { setPostAuthIntent } from '../lib/postAuthIntent'

function Check() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Soon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      '3 AI engines tracked (ChatGPT, Gemini, Google AI Overview)',
      '1 domain',
      '40 tracked prompts / month',
      '120 AI answers analyzed / month',
      '20 article generations / month',
      '1 seat',
      'Email support',
    ],
    soon: [
      'Scheduled weekly monitoring',
      'Email alerts on visibility drops',
      '50 citation-building credits / month',
      'Integrations: HubSpot, Slack, Notion & more',
    ],
    trial: '15-day free trial',
    cta: 'Start free trial',
    checkoutPlan: 'starter',
  },
  {
    name: 'Growth',
    monthly: 219,
    yearly: 183,
    yearlyTotal: 1830,
    who: 'Growing brands & marketers',
    platforms: ['chatgpt', 'gemini', 'perplexity', 'googleaio'],
    usageLine: '80 prompts tracked / month · 5 domains',
    highlighted: true,
    badge: 'Most popular',
    included: [
      'Everything in Starter',
      '5 domains',
      '80 tracked prompts / month',
      '240 AI answers analyzed / month',
      '40 article generations / month',
      '3 seats',
      'Priority support',
    ],
    soon: [
      'Perplexity tracking',
      'Multi-domain tracking (5 sites)',
      'Team members — 3 seats',
      'Slack & email alerts',
      'Multi-language visibility checks',
      '50 citation-building credits / month',
      'Integrations: Ahrefs, Semrush, Contentful, Framer & more',
    ],
    trial: '30-day free trial',
    cta: 'Start free trial',
    checkoutPlan: 'growth',
  },
]

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
  {
    q: 'Do I need a credit card for the free trial?',
    a: 'No. Starter gives you 15 days free, Growth gives you 30 days free — no card needed until you decide to continue.',
  },
]

function FAQItem({ item, open, onToggle }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#EFF6FF] transition-colors">
        <span className="font-semibold text-[#172554] text-[15px]">{item.q}</span>
        <span className="w-6 h-6 flex items-center justify-center text-[#2563EB] text-lg flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-[#677085] leading-relaxed">{item.a}</div>
      )}
    </div>
  )
}

// ─── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, annual, expanded, onToggleExpand, onCta, checkingOut }) {
  const highlighted = plan.highlighted
  const price = annual ? plan.yearly : plan.monthly
  const visibleFeatures = expanded ? plan.included : plan.included.slice(0, 5)
  const hasMore = plan.included.length > 5
  const soonFeatures = plan.soon || []

  return (
    <div className={`relative rounded-[20px] p-8 flex flex-col bg-white border transition-all ${
      highlighted ? 'border-[#2563EB] bg-[#EFF6FF] shadow-md' : 'border-[#BFDBFE] shadow-sm'
    }`}>
      {highlighted && (
        <div className="absolute top-0 left-8 right-8 h-1 bg-[#2563EB] rounded-b-full" />
      )}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">
          {plan.badge}
        </div>
      )}

      <h2 className="font-bold text-lg text-[#172554] mb-1">{plan.name}</h2>
      <p className="text-sm text-[#677085] mb-6">{plan.who}</p>

      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold text-[#172554]">${price}</span>
          <span className="text-sm text-[#677085] mb-0.5">/mo</span>
        </div>
        {annual && <p className="text-xs text-[#677085] mt-1">billed ${plan.yearlyTotal}/yr</p>}
        {plan.trial && (
          <p className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-[#1B8A4A] bg-[#DCF5E4] px-2.5 py-1 rounded-full">
            ✓ {plan.trial} · No card required
          </p>
        )}
      </div>

      <PlatformRow platforms={plan.platforms} showScanning={false} />

      <p className="text-sm font-semibold text-[#172554] mb-4">{plan.usageLine}</p>
      <div className="border-t border-[#BFDBFE] mb-5" />

      <div className="mb-6 flex-1">
        <p className="text-xs font-semibold text-[#677085] uppercase tracking-wide mb-3">Included</p>
        <ul className="space-y-2.5">
          {visibleFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check />
              <span className="text-sm text-[#172554]/90 leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button onClick={onToggleExpand} className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] mt-3">
            {expanded ? 'Show fewer features ↑' : 'See all features ↓'}
          </button>
        )}
        {soonFeatures.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dashed border-[#CBD5E1]">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2.5">Coming soon</p>
            <ul className="space-y-2">
              {soonFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Soon />
                  <span className="text-sm text-[#94A3B8] leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={() => onCta && onCta(plan)}
        disabled={checkingOut}
        className="w-full text-sm font-semibold py-3 rounded-xl transition-colors bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white"
      >
        {checkingOut ? 'Redirecting...' : `${plan.cta} →`}
      </button>
    </div>
  )
}

// ─── Pricing Page ─────────────────────────────────────────────────────────────

export default function Pricing() {
  useEffect(() => { document.title = 'Pricing — Peach' }, [])
  const [annual, setAnnual] = useState(false)
  const [expandedPlans, setExpandedPlans] = useState({})
  const [openFaq, setOpenFaq] = useState(0)
  const [checkingOut, setCheckingOut] = useState(null)
  const [livePrices, setLivePrices] = useState(null) // { starter: { monthly, currency }, growth: {...} } | null while unavailable
  const { user, session } = useAuth()
  const navigate = useNavigate()

  // Pull current prices straight from Dodo so this page never drifts from what's actually
  // charged at checkout. Falls back to the hardcoded PLANS defaults below if this fails.
  useEffect(() => {
    fetch('/api/pricing')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setLivePrices(data) })
      .catch(() => {})
  }, [])

  // Annual = 2 months free (monthly × 10), same "Save 2 mo" promise regardless of price source
  const plans = PLANS.map(plan => {
    const live = livePrices?.[plan.checkoutPlan]
    const monthly = live?.monthly ?? plan.monthly
    return { ...plan, monthly, yearly: Math.round((monthly * 10) / 12), yearlyTotal: monthly * 10 }
  })

  const handleCta = (plan) => {
    if (!user) {
      setPostAuthIntent(
        plan.ctaLink === '/app' ? { type: 'app' } : { type: 'checkout', plan: plan.checkoutPlan }
      )
      navigate('/signup')
      return
    }
    if (plan.ctaLink === '/app') {
      navigate('/app')
    } else {
      handleCheckout(plan.checkoutPlan)
    }
  }

  const handleCheckout = async (plan) => {
    setCheckingOut(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ plan, email: user?.email }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || 'Failed to start checkout. Please try again.')
      }
    } catch {
      alert('Failed to connect to payment server. Please try again.')
    } finally {
      setCheckingOut(null)
    }
  }

  return (
    <div>

      {/* Header (dark) */}
      <section className="bg-blue-900 px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Plans & Pricing</h1>
        <p className="text-lg text-blue-100 max-w-xl mx-auto mb-6">
          Know where you stand in AI search. Start free, scale when you're ready.
        </p>

        <div className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-xl p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${!annual ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${annual ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100'}`}
          >
            Annual
            <span className="text-[10px] font-black bg-[#DCF5E4] text-[#1B8A4A] px-1.5 py-0.5 rounded-full">Save 2 mo</span>
          </button>
        </div>
      </section>

      {/* Plan cards (pale) */}
      <section className="bg-blue-50 px-6 py-20">
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className="w-full sm:w-[340px]">
              <PlanCard
                plan={plan}
                annual={annual}
                expanded={!!expandedPlans[plan.name]}
                onToggleExpand={() => setExpandedPlans((prev) => ({ ...prev, [plan.name]: !prev[plan.name] }))}
                onCta={handleCta}
                checkingOut={checkingOut === plan.checkoutPlan}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Free report — conversion moment (dark) */}
      <section className="bg-blue-900 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Not ready to commit?</p>
          <h2 className="text-3xl font-bold text-white mb-4">Start with one free visibility report.</h2>
          <p className="text-blue-100 mb-8">
            See how AI describes your brand, where competitors are cited, and what to improve next.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['AI visibility score', 'Competitor gaps', 'Content action plan'].map((pill) => (
              <span key={pill} className="text-sm font-medium text-white bg-white/10 border border-white/20 px-4 py-2 rounded-full">{pill}</span>
            ))}
          </div>

          <p className="text-white font-medium mb-4">See how your brand appears across the AI answers buyers trust.</p>
          <div className="flex justify-center mb-2">
            <div className="flex flex-wrap justify-center gap-2">
              {ALL_PLATFORMS.map((key, i) => <PlatformChip key={key} platformKey={key} index={i} />)}
            </div>
          </div>
          <p className="text-[10px] text-blue-200 mb-10">Platform names and logos are trademarks of their respective owners. Peach is not affiliated with or endorsed by these companies.</p>

          <Link
            to="/login"
            onClick={() => localStorage.removeItem('peach_last_result')}
            className="inline-block bg-white hover:bg-blue-50 text-blue-700 font-semibold px-8 py-3.5 rounded-xl transition-colors"
          >
            Check your AI visibility →
          </Link>
          <p className="text-xs text-blue-200 mt-3">No credit card · Results in under 3 minutes</p>
        </div>
      </section>

      {/* FAQ (pale) */}
      <section className="bg-blue-50 py-24">
        <div className="max-w-[760px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#172554] text-center mb-2">Questions before you choose a plan.</h2>
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
