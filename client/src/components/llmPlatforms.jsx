// ─── LLM Brand icons (accurate inline SVG) ────────────────────────────────────

// OpenAI / ChatGPT — the OpenAI logomark
export function ChatGPTIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04.527.527 0 0 0 .14-.079l4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.491zm-9.662-4.13a4.476 4.476 0 0 1-.535-3.014.527.527 0 0 0 .142.085l4.778 2.758a.795.795 0 0 0 .786 0l5.833-3.369v2.332a.07.07 0 0 1-.028.061L9.74 20.173a4.5 4.5 0 0 1-6.142-1.874zm-1.26-10.358a4.475 4.475 0 0 1 2.366-1.973V11.6a.79.79 0 0 0 .393.681l5.833 3.369-2.02 1.168a.07.07 0 0 1-.067.004L4.019 14.06a4.501 4.501 0 0 1-1.701-6.12zm16.597 3.855l-5.833-3.369 2.02-1.168a.07.07 0 0 1 .067-.004l4.824 2.786a4.5 4.5 0 0 1-.693 8.114V12.58a.79.79 0 0 0-.385-.784zm2.01-3.023a.527.527 0 0 0-.141-.085l-4.778-2.758a.795.795 0 0 0-.786 0L9.409 9.3V6.967a.07.07 0 0 1 .028-.061l4.832-2.79a4.5 4.5 0 0 1 6.678 4.66zm-12.64 4.135l-2.02-1.168a.07.07 0 0 1-.038-.052V6.178a4.5 4.5 0 0 1 7.375-3.453.527.527 0 0 0-.14.08L8.704 5.553a.795.795 0 0 0-.393.681zm1.097-2.365l2.597-1.5 2.597 1.5v2.999l-2.597 1.5-2.597-1.5z" fill="#000"/>
    </svg>
  )
}

// Google Gemini — the 4-pointed star shape
export function GeminiIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="gemini-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285F4"/>
          <stop offset="1" stopColor="#9B72CB"/>
        </linearGradient>
      </defs>
      <path d="M12 2C12 7.523 16.477 12 22 12C16.477 12 12 16.477 12 22C12 16.477 7.523 12 2 12C7.523 12 12 7.523 12 2Z" fill="url(#gemini-grad)"/>
    </svg>
  )
}

// Google AI Overview — the multicolor Google G
export function GoogleAIOIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// Claude / Anthropic — the Anthropic diamond star logo
export function ClaudeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M13.827 3.658l6.529 13.06a.813.813 0 0 1-.728 1.174h-2.31a.813.813 0 0 1-.73-.453l-1.17-2.34H8.582l-1.17 2.34a.813.813 0 0 1-.73.453H4.372a.813.813 0 0 1-.729-1.174l6.53-13.06a2.032 2.032 0 0 1 3.654 0zM12 7.297l-2.217 4.435h4.434z" fill="#D97757"/>
    </svg>
  )
}

// Perplexity — stylized compass/star mark in brand teal
export function PerplexityIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.3 5.2L20 5.2l-1.9 5.7L22 14l-4.3 1.4L18 21l-6-3.8L6 21l.3-5.6L2 14l3.9-3.1L4 5.2l5.7 2 2.3-5.2z" fill="#20808D"/>
    </svg>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const PLATFORM_ICONS = {
  chatgpt:     { Icon: ChatGPTIcon,     label: 'ChatGPT' },
  gemini:      { Icon: GeminiIcon,      label: 'Gemini' },
  perplexity:  { Icon: PerplexityIcon,  label: 'Perplexity' },
  googleaio:   { Icon: GoogleAIOIcon,   label: 'Google AI Overviews' },
  claude:      { Icon: ClaudeIcon,      label: 'Claude' },
}

// eslint-disable-next-line react-refresh/only-export-components
export const ALL_PLATFORMS = ['chatgpt', 'gemini', 'perplexity', 'googleaio', 'claude']

export function ScanningIndicator({ label = 'Scanning AI answer engines' }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5B3DF5] opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5B3DF5]" />
      </span>
      <span className="text-[10px] font-bold text-[#677085] uppercase tracking-widest">{label}</span>
    </div>
  )
}

export function PlatformChip({ platformKey, index, small }) {
  const { Icon, label } = PLATFORM_ICONS[platformKey]
  return (
    <div
      className={`chip-scan group relative flex items-center gap-1.5 bg-white border border-[#E8E2F5] rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(91,61,245,0.15)] ${small ? 'px-2 py-1' : 'px-3 py-1.5'}`}
      style={{ '--i': index }}
    >
      <Icon size={small ? 14 : 18} />
      <span className={`font-medium text-[#14182B] whitespace-nowrap ${small ? 'text-[11px]' : 'text-xs'}`}>{label}</span>
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#14182B] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
        Track visibility in {label}
      </span>
    </div>
  )
}

export function PlatformRow({ platforms, label = 'Track visibility across', extraLabel, showScanning = true }) {
  return (
    <div className="mb-5">
      {showScanning && <ScanningIndicator />}
      <p className="text-[10px] font-bold text-[#677085] uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {platforms.map((key, i) => <PlatformChip key={key} platformKey={key} index={i} />)}
      </div>
      {extraLabel && <p className="text-xs text-[#677085] mt-2">{extraLabel}</p>}
    </div>
  )
}
