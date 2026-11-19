import { useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

const colors = ['#f4ece3', '#f0c4c4', '#d36b78', '#e4c7a1', '#fff8f4']

type Piece = {
  id: number
  left: number
  delay: number
  duration: number
  dx: number
  rot: number
  color: string
  heart: boolean
  size: number
}

function createPieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    duration: 1.7 + Math.random() * 1.5,
    dx: (Math.random() - 0.5) * 220,
    rot: Math.random() * 640 - 320,
    color: colors[id % colors.length] ?? colors[0],
    heart: id % 3 === 0,
    size: 7 + Math.random() * 8,
  }))
}

export function Celebration() {
  const reduced = useReducedMotion() === true
  const pieces = useMemo(() => createPieces(reduced ? 16 : 58), [reduced])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={piece.heart ? 'confetti-heart' : 'confetti-bit'}
          style={{
            left: `${piece.left}%`,
            color: piece.color,
            background: piece.heart ? 'transparent' : piece.color,
            width: piece.heart ? undefined : piece.size,
            height: piece.heart ? undefined : piece.size * 0.55,
            fontSize: piece.heart ? piece.size + 8 : undefined,
            borderRadius: piece.heart ? undefined : 2,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ['--dx' as string]: `${piece.dx}px`,
            ['--rot' as string]: `${piece.rot}deg`,
          }}
        >
          {piece.heart ? '♥' : ''}
        </span>
      ))}
    </div>
  )
}
