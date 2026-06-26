import { useState } from 'react'

export function useVersion() {
  const [version, setVersion] = useState(() => localStorage.getItem('appVersion') || 'v2')
  const setV = (v) => {
    localStorage.setItem('appVersion', v)
    setVersion(v)
  }
  return { version, setV }
}

export default function VersionToggle({ version, onSelect }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 bg-gray-900 text-white text-xs font-semibold rounded-full px-2 py-1.5 shadow-lg select-none">
      {['v1', 'v2', 'v3'].map(v => (
        <button
          key={v}
          onClick={() => onSelect(v)}
          className={`px-2.5 py-1 rounded-full transition-colors ${version === v ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          {v.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
