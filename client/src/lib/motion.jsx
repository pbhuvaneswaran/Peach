// Shared motion primitives — emil-design-eng conventions used across the app.
// Originally lived only in PublishConnectModal.jsx; extracted here so every
// button/modal/panel in the app shares one press-feedback + easing standard
// instead of each screen reinventing (or skipping) it.

// Stronger-than-default ease-out curve — built-in CSS ease-out is too weak to
// read as intentional. Use for anything entering/appearing.
export const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'

// Press feedback for any pressable element (buttons, cards, chips, tabs).
// Subtle scale-down on :active, 150ms, so the UI feels like it heard the click.
export const btnBase = 'transition-transform duration-150 active:scale-[0.97]'
export function btnStyle() {
  return { transitionTimingFunction: EASE_OUT }
}

import { useState, useEffect } from 'react'

// Wraps content whose identity changes via `stepKey` (a tab id, a wizard step,
// a selected list item) so switching crossfades + scales in from 0.97, instead
// of hard-cutting. Never animate from scale(0) — start close to full size so it
// reads as one continuous surface, not two different screens swapping.
export function StepTransition({ stepKey, children, className = '' }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // Two-paint trick: reset to the "before" state, then flip to "after" on the
    // next frame so the browser actually paints the transition instead of
    // collapsing it. Needed because CSS @starting-style isn't used here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(false)
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [stepKey])
  return (
    <div
      className={`transition-[opacity,transform] duration-200 ${className}`}
      style={{
        transitionTimingFunction: EASE_OUT,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.97)',
      }}
    >
      {children}
    </div>
  )
}

// Centered modal backdrop + panel. Handles its own mount/unmount so the exit
// transition gets to play instead of the DOM node being yanked instantly —
// pass `show` and render this unconditionally; it returns null once fully closed.
export function Modal({ show, onClose, children, panelClassName = '', backdropClassName = 'bg-[#172554]/40' }) {
  const [rendered, setRendered] = useState(show)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- two-paint mount/reveal trick, see StepTransition above
      setRendered(true)
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
    const t = setTimeout(() => setRendered(false), 200)
    return () => clearTimeout(t)
  }, [show])

  if (!rendered) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${backdropClassName}`}
      style={{ transitionTimingFunction: EASE_OUT, opacity: visible ? 1 : 0 }}
      onClick={onClose}
    >
      <div
        className={`transition-[opacity,transform] duration-200 ${panelClassName}`}
        style={{
          transitionTimingFunction: EASE_OUT,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.95)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// Right-edge slide-over (drawer), for full-screen side panels like the article
// editor — distinct from Modal because it's anchored to an edge, not centered.
export function Drawer({ show, onClose, children, panelClassName = '', backdropClassName = 'bg-black/40' }) {
  const [rendered, setRendered] = useState(show)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- two-paint mount/reveal trick, see StepTransition above
      setRendered(true)
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
    const t = setTimeout(() => setRendered(false), 250)
    return () => clearTimeout(t)
  }, [show])

  if (!rendered) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${backdropClassName}`}
      style={{ transitionTimingFunction: EASE_OUT, opacity: visible ? 1 : 0 }}
      onClick={onClose}
    >
      <div
        className={`transition-transform duration-250 ${panelClassName}`}
        style={{
          transitionTimingFunction: EASE_OUT,
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
