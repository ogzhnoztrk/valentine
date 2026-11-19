import { useEffect, useState } from 'react'

export function useTypewriter(text: string, active: boolean, speed = 28) {
  const reduced = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )[0]
  const key = `${active}:${text}`
  const [state, setState] = useState({ key, count: 0 })

  if (state.key !== key) setState({ key, count: 0 })

  useEffect(() => {
    if (!active || reduced) return
    let current = 0
    const id = window.setInterval(() => {
      current += 1
      setState({ key, count: current })
      if (current >= text.length) window.clearInterval(id)
    }, speed)
    return () => window.clearInterval(id)
  }, [active, key, reduced, speed, text])

  if (!active) return { value: '', done: false }
  if (reduced) return { value: text, done: true }

  return {
    value: text.slice(0, state.count),
    done: state.count >= text.length,
  }
}
