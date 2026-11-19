import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { siteConfig } from '../../config.ts'

export function CardsScene({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion() === true
  const cards = siteConfig.cards.items
  const [flipped, setFlipped] = useState<boolean[]>(() => cards.map(() => false))
  const [allOpen, setAllOpen] = useState(false)
  const opened = useRef(new Set<number>())
  const sent = useRef(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (!allOpen || sent.current) return
    const id = window.setTimeout(() => {
      if (sent.current) return
      sent.current = true
      onDoneRef.current()
    }, reduced ? 800 : 5200)
    return () => window.clearTimeout(id)
  }, [allOpen, reduced])

  function toggle(index: number) {
    setFlipped((current) => current.map((value, item) => (item === index ? !value : value)))
    opened.current.add(index)
    if (opened.current.size === cards.length) setAllOpen(true)
  }

  return (
    <section className="h-full overflow-y-auto px-5 pt-24 pb-28">
      <h1 className="serif mx-auto max-w-3xl text-center text-4xl leading-tight font-medium sm:text-5xl">
        {siteConfig.cards.title.split(' ').map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="mr-[0.28em] inline-block"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.045, duration: 0.5 }}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      <div className="mx-auto mt-10 grid w-full max-w-5xl gap-4 md:grid-cols-3">
        {cards.map((card, index) => {
          const isFlipped = flipped[index] ?? false
          return (
            <motion.button
              key={card.front}
              type="button"
              className="card-shell relative h-72 w-full text-left sm:h-80"
              style={{ perspective: 1200 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + index * 0.12 }}
              onClick={() => toggle(index)}
              aria-pressed={isFlipped}
              aria-label={isFlipped ? card.back : card.front}
            >
              <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: reduced ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="face card-front absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[1.6rem] p-6"
                  style={{ transform: 'translateZ(1px)' }}
                >
                  <span className="text-[11px] tracking-[0.32em] text-gold">0{index + 1}</span>
                  <p className="serif text-3xl leading-snug text-cream italic">{card.front}</p>
                  <span className="text-[10px] tracking-[0.28em] text-cream/55 uppercase">{siteConfig.cards.flipHint}</span>
                </div>
                <div
                  className="face paper absolute inset-0 flex items-center overflow-hidden rounded-[1.6rem] p-6"
                  style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
                >
                  <p className="serif text-2xl leading-snug">{card.back}</p>
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      {allOpen && (
        <motion.span
          className="fixed bottom-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.7rem))] left-1/2 z-30 h-px w-24 origin-left -translate-x-1/2 bg-blush"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: reduced ? 0.8 : 5.2, ease: 'linear' }}
          aria-hidden
        />
      )}
    </section>
  )
}
