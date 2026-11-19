import { useEffect, useState } from 'react'

export function CursorGlow() {
  const [enabled] = useState(() => {
    return (
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  })

  useEffect(() => {
    if (!enabled) return
    const node = document.querySelector<HTMLDivElement>('[data-cursor-glow]')
    if (!node) return

    let x = window.innerWidth * 0.7
    let y = window.innerHeight * 0.3
    let currentX = x
    let currentY = y
    let frame = 0

    const onMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      node.style.opacity = '1'
    }

    const loop = () => {
      currentX += (x - currentX) * 0.12
      currentY += (y - currentY) * 0.12
      node.style.transform = `translate3d(${currentX - 160}px, ${currentY - 160}px, 0)`
      frame = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove)
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [enabled])

  if (!enabled) return null
  return <div data-cursor-glow className="cursor-glow" aria-hidden />
}
