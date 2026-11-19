import { createPortal } from 'react-dom'
import type { HeartParticle } from '../lib/hearts.ts'

type RisingHeartsProps = {
  hearts: HeartParticle[]
  onDone: (id: number) => void
}

export function RisingHearts({ hearts, onDone }: RisingHeartsProps) {
  if (hearts.length === 0) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[46]" aria-hidden>
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="heart-rise"
          style={{
            left: heart.x,
            top: heart.y,
            color: heart.color,
            fontSize: heart.size,
            animationDuration: `${heart.duration}ms`,
            ['--dx' as string]: `${heart.dx}px`,
          }}
          onAnimationEnd={() => onDone(heart.id)}
        >
          ♥
        </span>
      ))}
    </div>,
    document.body,
  )
}
