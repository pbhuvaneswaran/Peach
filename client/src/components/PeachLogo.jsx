// Icon: speech bubble + magnifying glass with sparkles, matching the Peach brand mark.
export default function PeachLogo({ className = '', iconClassName = 'h-7 w-7', textClassName = 'text-xl', iconColor = '#fff', textColor = '#fff', dotColor = '#93c5fd', showText = true }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 60 44" className={iconClassName} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="3" cy="27" r="1.8" fill={iconColor} />
        <path d="M8 27H16" stroke={iconColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M8 20H20" stroke={iconColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="20" r="14" stroke={iconColor} strokeWidth="3" />
        <path d="M20 30 L16 38 L26 32 Z" fill={iconColor} />
        <circle cx="24" cy="20" r="1.8" fill={iconColor} />
        <circle cx="30" cy="20" r="1.8" fill={iconColor} />
        <circle cx="36" cy="20" r="1.8" fill={iconColor} />
        <path d="M40 30 L48 38" stroke={iconColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M50 6 L51.5 10 L55.5 11.5 L51.5 13 L50 17 L48.5 13 L44.5 11.5 L48.5 10 Z" fill={iconColor} />
        <path d="M56 15 L56.8 17 L58.8 17.8 L56.8 18.6 L56 20.6 L55.2 18.6 L53.2 17.8 L55.2 17 Z" fill={iconColor} />
      </svg>
      {showText && (
        <span className={`font-extrabold tracking-tight ${textClassName}`} style={{ color: textColor, fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif' }}>
          Peach<span style={{ color: dotColor }}>.</span>
        </span>
      )}
    </span>
  )
}
