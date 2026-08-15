import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// Read stored session from localStorage synchronously — no network wait
function getStoredUser() {
  try {
    const key = Object.keys(localStorage).find(
      k => k.startsWith('sb-') && k.endsWith('-auth-token')
    )
    if (!key) return null
    const data = JSON.parse(localStorage.getItem(key))
    // Check token isn't expired
    if (data?.expires_at && data.expires_at < Date.now() / 1000) return null
    return data?.user ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // Initialize instantly from localStorage — no spinner, no wait
  const [user, setUser] = useState(getStoredUser)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Sync with real session in background (updates if token refreshed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
