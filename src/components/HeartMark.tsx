import { useId } from 'react'
import { cn } from '../lib/cn.ts'

export function HeartMark({ className }: { className?: string }) {
  const id = `heart-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg viewBox="0 0 100 100" className={cn('heart-glow', className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#f6d5d2" />
          <stop offset="46%" stopColor="#d4536a" />
          <stop offset="100%" stopColor="#6d2034" />
        </linearGradient>
      </defs>
      <path
        d="M50 86C50 86 14 64 14 40C14 25 25 15 37 15C44.5 15 49 20 50 25C51 20 55.5 15 63 15C75 15 86 25 86 40C86 64 50 86 50 86Z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}
