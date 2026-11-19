import { motion, useMotionValue, useSpring } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { cn } from '../lib/cn.ts'

type MagneticButtonProps = {
  className?: string
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  scale?: number
}

export function MagneticButton({ className, children, onClick, disabled, scale = 1 }: MagneticButtonProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  function onMove(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - (bounds.left + bounds.width / 2)) * 0.22)
    y.set((event.clientY - (bounds.top + bounds.height / 2)) * 0.22)
  }

  return (
    <motion.button
      type="button"
      className={cn(className)}
      disabled={disabled}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{ x: springX, y: springY }}
      animate={{ scale }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.button>
  )
}
