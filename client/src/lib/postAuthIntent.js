const KEY = 'peach_post_auth_intent'

// Remembers what a logged-out user was trying to do (e.g. checkout a paid plan)
// before they were sent to sign up, so we can resume it once they're authenticated.

export function setPostAuthIntent(intent) {
  localStorage.setItem(KEY, JSON.stringify(intent))
}

function consumePostAuthIntent() {
  const raw = localStorage.getItem(KEY)
  localStorage.removeItem(KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export async function resolvePostAuthRedirect(navigate, session) {
  const intent = consumePostAuthIntent()

  if (intent?.type === 'checkout' && intent.plan && session?.access_token) {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: intent.plan, email: session.user?.email }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
    } catch {
      // fall through to /app below
    }
  }

  navigate('/app')
}
