import { useState, useEffect } from 'react'

export function useVersion() {
  const [version, setVersion] = useState(() => localStorage.getItem('appVersion') || 'v2')
  const toggle = () => {
    const next = version === 'v1' ? 'v2' : 'v1'
    localStorage.setItem('appVersion', next)
    setVersion(next)
  }
  return { version, toggle }
}

export default function VersionToggle({ version, onToggle }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold rounded-full px-3 py-2 shadow-lg select-none">
      <span className={version === 'v1' ? 'text-white' : 'text-gray-500'}>V1</span>
      <button
        onClick={onToggle}
        className="relative w-10 h-5 rounded-full transition-colors duration-200"
        style={{ background: version === 'v2' ? '#6366f1' : '#4b5563' }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: version === 'v2' ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
      <span className={version === 'v2' ? 'text-white' : 'text-gray-500'}>V2</span>
    </div>
  )
}
