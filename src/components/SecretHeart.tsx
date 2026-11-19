import { motion, useReducedMotion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { siteConfig } from '../config.ts'

export function SecretHeart({ onOpen }: { onOpen: () => void }) {
  const reduced = useReducedMotion() === true

  return (
    <motion.button
      type="button"
      aria-label={siteConfig.secret.label}
      onClick={onOpen}
      className="fixed top-[22%] left-[max(0.8rem,env(safe-area-inset-left))] z-40 text-blush"
      animate={reduced ? undefined : { y: [0, -8, 0], opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Heart className="h-4 w-4 fill-rose stroke-blush" />
    </motion.button>
  )
}
