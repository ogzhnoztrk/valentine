import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { siteConfig } from '../config.ts'
import { useTypewriter } from '../hooks/useTypewriter.ts'

export function SecretNote({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const typed = useTypewriter(siteConfig.secret.message, open, 24)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={siteConfig.secret.label}
            className="glass w-full max-w-md rounded-[1.75rem] px-7 py-8 text-center"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="serif text-3xl leading-snug text-cream italic sm:text-4xl">
              {typed.value}
              {!typed.done && <span className="caret" aria-hidden />}
            </p>
            <button
              ref={closeRef}
              type="button"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2 text-xs tracking-[0.22em] uppercase"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
              {siteConfig.secret.close}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
