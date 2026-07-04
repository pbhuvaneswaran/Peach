import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const CLEAR_LAST_RESULT = () => localStorage.removeItem('peach_last_result')

// Royal bright blue — homepage accent (kept separate from the app's violet brand color)
const ACCENT = '#3355FF'
const ACCENT_HOVER = '#2645E0'

const HERO_QUESTIONS = [
  'What is the best ecommerce tool?',
  'Which tool is better for solopreneurs?',
  'What are the alternatives to [competitor]?',
  'Best free [product category] tools?',
]

function useQuestionPairCycle(holdMs = 2200, typingSpeedMs = 32) {
  const [pairIndex, setPairIndex] = useState(0)

  useEffect(() => {
    const pair = [HERO_QUESTIONS[pairIndex * 2], HERO_QUESTIONS[pairIndex * 2 + 1]]
    const maxLen = Math.max(...pair.map(q => q.length))
    const totalMs = maxLen * typingSpeedMs + holdMs
    const timer = setTimeout(() => setPairIndex(p => (p + 1) % 2), totalMs)
    return () => clearTimeout(timer)
  }, [pairIndex, holdMs, typingSpeedMs])

  return pairIndex
}

function TypewriterText({ text }) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    let charIndex = 0
    const timer = setInterval(() => {
      charIndex++
      setDisplay(text.slice(0, charIndex))
      if (charIndex >= text.length) clearInterval(timer)
    }, 32)
    return () => clearInterval(timer)
  }, [text])

  return (
    <>
      {display}
      <span className="inline-block w-[2px] h-4 ml-0.5 align-middle animate-pulse" style={{ background: ACCENT }} />
    </>
  )
}

function QuestionCard({ text }) {
  return (
    <div className="bg-white border border-[#E8E2F5] rounded-xl px-4 py-3 text-[#14182B] text-sm leading-relaxed max-w-md min-h-[44px] flex items-center">
      “<TypewriterText key={text} text={text} />”
    </div>
  )
}

function RadarPulse() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#FFB27A]/25" style={{ animation: 'ping 2.4s cubic-bezier(0,0,0.2,1) infinite' }} />
      <span className="absolute inline-flex h-[70%] w-[70%] rounded-full" style={{ background: `${ACCENT}33`, animation: 'ping 2.4s cubic-bezier(0,0,0.2,1) infinite', animationDelay: '0.5s' }} />
      <span className="relative inline-flex h-8 w-8 rounded-full items-center justify-center text-white text-base font-bold"
        style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #FF9D6C 100%)` }}>
        ✳
      </span>
    </div>
  )
}

function StepIcon({ path }) {
  return (
    <svg className="w-5 h-5 text-[#3355FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={path} />
    </svg>
  )
}

function StepCard({ num, icon, title, desc }) {
  return (
    <div className="relative bg-white border border-[#E8E2F5] rounded-2xl p-6 flex-1">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl font-bold text-[#DCD4F2] tracking-tight">{num}</span>
        <span className="w-9 h-9 rounded-lg bg-[#F1EDFF] flex items-center justify-center"><StepIcon path={icon} /></span>
      </div>
      <h4 className="font-semibold text-[#14182B] mb-1.5">{title}</h4>
      <p className="text-sm text-[#677085] leading-relaxed">{desc}</p>
    </div>
  )
}

function BentoCard({ className = '', accent, children }) {
  return (
    <div className={`bg-white border border-[#E8E2F5] rounded-2xl p-6 transition-all hover:shadow-md hover:border-[#3355FF]/30 ${accent ? 'ring-1 ring-[#FFD8C2]' : ''} ${className}`}>
      {children}
    </div>
  )
}

function PersonaIcon({ path }) {
  return (
    <svg className="w-5 h-5 text-[#3355FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={path} />
    </svg>
  )
}

function PersonaCard({ icon, title, desc }) {
  return (
    <div className="bg-white border border-[#E8E2F5] rounded-2xl p-6 hover:shadow-md hover:border-[#3355FF]/30 transition-all">
      <span className="w-9 h-9 rounded-lg bg-[#F1EDFF] flex items-center justify-center mb-4"><PersonaIcon path={icon} /></span>
      <div className="w-6 h-0.5 bg-[#3355FF] rounded-full mb-3" />
      <h4 className="font-semibold text-[#14182B] mb-1.5">{title}</h4>
      <p className="text-sm text-[#677085] leading-relaxed">{desc}</p>
    </div>
  )
}

const FAQS = [
  {
    q: 'What is a citation score?',
    a: 'Your citation score shows how often AI platforms mention or reference your brand for relevant buyer questions. It’s basically useless — users told us they were frustrated and asked what the point of a single score even is. That’s why we don’t add that to Peach.',
  },
  {
    q: 'Which AI platforms does Peach track?',
    a: 'Peach is built to monitor visibility across major AI answer engines such as ChatGPT, Gemini, Perplexity, Grok, and Claude.',
  },
  {
    q: 'Is Peach an SEO tool?',
    a: 'Not exactly. SEO helps you rank in search results. Peach helps you understand whether AI systems mention, recommend, or cite your brand in generated answers.',
  },
  {
    q: 'Can I compare my visibility with competitors?',
    a: 'Yes. Peach shows which competitors are appearing in the same buyer prompts and where they are winning visibility.',
  },
  {
    q: 'Does Peach tell me what to fix?',
    a: 'Yes. You get clear opportunities around missing content, weak source signals, competitor gaps, and high-value prompts.',
  },
]

function FAQItem({ item, open, onToggle }) {
  return (
    <div className="bg-white border border-[#E8E2F5] rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#F8F6FE] transition-colors">
        <span className="font-semibold text-[#14182B] text-[15px]">{item.q}</span>
        <span className="w-6 h-6 flex items-center justify-center text-[#3355FF] text-lg flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-[#677085] leading-relaxed">{item.a}</div>
      )}
    </div>
  )
}

export default function HomeV2() {
  const [openFaq, setOpenFaq] = useState(0)
  const pairIndex = useQuestionPairCycle()

  return (
    <div className="bg-[#FCFAF6]">
      {/* Hero */}
      <section className="relative bg-[#F1EDFF] overflow-hidden">
        <div className="absolute right-8 top-10 hidden md:block">
          <RadarPulse />
        </div>
        <div className="max-w-2xl mx-auto px-6 py-20">
          <h1 className="text-3xl md:text-4xl font-bold text-[#14182B] leading-tight tracking-tight mb-5">
            Your customers are not just searching on Google anymore
          </h1>
          <p className="text-[#677085] text-base mb-4">They are asking LLMs:</p>
          <div className="space-y-2.5 mb-6">
            <QuestionCard text={HERO_QUESTIONS[pairIndex * 2]} />
            <QuestionCard text={HERO_QUESTIONS[pairIndex * 2 + 1]} />
          </div>
          <p className="text-[#14182B] text-base mb-2">AI gives your buyers an answer. <span className="font-bold">Is your brand part of it?</span></p>
          <p className="bg-[#FFF1E7] rounded-lg px-4 py-3.5 text-[#14182B] text-base font-semibold leading-snug mb-8">
            Peach shows you how to earn more <span style={{ color: ACCENT }}>mentions, citations, and recommendations</span> across AI search.
          </p>
          <Link to="/login" onClick={CLEAR_LAST_RESULT}
            className="inline-block text-white font-semibold px-9 py-4 rounded-xl transition-colors text-lg shadow-sm"
            style={{ background: ACCENT }}
            onMouseEnter={e => e.currentTarget.style.background = ACCENT_HOVER}
            onMouseLeave={e => e.currentTarget.style.background = ACCENT}>
            Check your AI visibility →
          </Link>
          <p className="text-xs text-[#677085] mt-4">Free report · Results in under 3 minutes</p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F1EDFF] border-t border-[#E8E2F5] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#14182B] text-center mb-12">See where AI puts you in three steps.</h2>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <StepCard num="01" icon="M13 10V3L4 14h7v7l9-11h-7z" title="Add your website"
              desc="Tell Peach what you do and who you compete with." />
            <StepCard num="02" icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.5 0-2.91-.32-4.14-.89L3 20l1.06-3.6C3.39 15.13 3 13.6 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" title="We test buyer questions"
              desc="Peach runs the questions your customers are already asking AI." />
            <StepCard num="03" icon="M9 19V6l7-3v13M9 19l-6 2V8l6-2m0 13l7-3V6m-7 13l7-3" title="Get your visibility report"
              desc="See where you are cited, where competitors win, and what to fix next." />
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-[#FCFAF6] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#14182B] mb-3">What you get in every report</h2>
            <p className="text-[#677085]">No raw data dumps. Just clear next steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <BentoCard className="md:col-span-2">
              <h3 className="font-semibold text-[#14182B] mb-1.5">Your AI Visibility Score</h3>
              <p className="text-sm text-[#677085] leading-relaxed mb-4">See how you appear across ChatGPT, Gemini, Perplexity, and Google AI Overviews.</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-[#3355FF]"
                  style={{ background: `conic-gradient(#3355FF 0% 38%, #F1EDFF 38% 100%)` }}>
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-sm">38%</div>
                </div>
                <span className="text-xs text-[#677085]">Your current overall score across all tracked engines.</span>
              </div>
            </BentoCard>
            <BentoCard accent>
              <h3 className="font-semibold text-[#14182B] mb-1.5">Competitor Citation Gaps</h3>
              <p className="text-sm text-[#677085] leading-relaxed">See where competitors are cited and you are missing.</p>
            </BentoCard>
            <BentoCard>
              <h3 className="font-semibold text-[#14182B] mb-1.5">Buyer Questions That Matter</h3>
              <p className="text-sm text-[#677085] leading-relaxed">Find the exact questions customers ask before choosing a tool.</p>
            </BentoCard>
            <BentoCard>
              <h3 className="font-semibold text-[#14182B] mb-1.5">Real AI Answers</h3>
              <p className="text-sm text-[#677085] leading-relaxed">Read the real answers generated about your category and brand.</p>
            </BentoCard>
            <BentoCard className="md:col-span-2">
              <h3 className="font-semibold text-[#14182B] mb-1.5">Your Content Action Plan</h3>
              <p className="text-sm text-[#677085] leading-relaxed">Get specific, writer-ready recommendations on what to create, improve, or prove.</p>
            </BentoCard>
            <BentoCard>
              <h3 className="font-semibold text-[#14182B] mb-1.5">Full Question Log</h3>
              <p className="text-sm text-[#677085] leading-relaxed">Every prompt, answer, citation, and visibility signal in one place.</p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#14182B] text-center mb-12">Built for teams that need to be in the answer.</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <PersonaCard icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              title="Content & SEO" desc="Turn missing AI citations into your next content priorities." />
            <PersonaCard icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2"
              title="Growth Teams" desc="See whether AI is sending high-intent buyers to you—or competitors." />
            <PersonaCard icon="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z"
              title="Founders & Marketers" desc="Know how AI describes your brand before customers do." />
            <PersonaCard icon="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 00-3-3.87M9 12a4 4 0 00-3 3.87"
              title="Agencies" desc="Show clients where they appear in AI answers—and where they do not." />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F1EDFF] py-20">
        <div className="max-w-[760px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#14182B] text-center mb-2">Questions before you check your visibility.</h2>
          <p className="text-[#677085] text-center mb-10">Everything you need to know about how Peach works.</p>
          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <FAQItem key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-[#677085] mb-2">Still curious? Check your AI visibility in under 3 minutes.</p>
            <Link to="/login" onClick={CLEAR_LAST_RESULT} className="text-sm font-semibold text-[#3355FF] hover:text-[#2645E0]">
              Get your free report →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#FCFAF6] max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-[#14182B] mb-4">Find out where you stand in AI search</h2>
        <p className="text-[#677085] mb-8">Results in under 3 minutes. No setup required.</p>
        <Link to="/login" onClick={CLEAR_LAST_RESULT}
          className="bg-[#3355FF] hover:bg-[#2645E0] text-white font-bold px-8 py-4 rounded-xl transition-colors text-base shadow-sm">
          Check your AI visibility →
        </Link>
      </section>
    </div>
  )
}
