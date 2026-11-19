import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { siteConfig } from '../../config.ts'
import { useTypewriter } from '../../hooks/useTypewriter.ts'
import { wait } from '../../lib/wait.ts'
import { useMusic } from '../../music/useMusic.ts'
import { HeartMark } from '../HeartMark.tsx'
import { MagneticButton } from '../MagneticButton.tsx'

const orbits = [
  { radius: 92, duration: 16, size: 4, delay: 0 },
  { radius: 108, duration: 21, size: 3, delay: -6 },
  { radius: 78, duration: 13, size: 3, delay: -2 },
  { radius: 124, duration: 24, size: 5, delay: -9 },
  { radius: 100, duration: 18, size: 3, delay: -4 },
  { radius: 136, duration: 27, size: 3, delay: -12 },
]

type Phase = 'idle' | 'inhale' | 'burst' | 'flash'

export function OpeningScene({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion() === true
  const music = useMusic()
  const [phase, setPhase] = useState<Phase>('idle')
  const [lineReady, setLineReady] = useState(reduced)
  const started = useRef(false)
  const cancelled = useRef(false)
  const typed = useTypewriter(siteConfig.opening.line2, lineReady, 26)
  const burst = useMemo(
    () =>
      Array.from({ length: reduced ? 0 : 24 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 24
        const distance = 100 + (index % 5) * 26
        return {
          id: index,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          size: 12 + (index % 4) * 5,
          delay: (index % 6) * 0.02,
        }
      }),
    [reduced],
  )

  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setLineReady(true), 900)
    return () => window.clearTimeout(id)
  }, [reduced])

  useEffect(() => {
    return () => {
      cancelled.current = true
    }
  }, [])

  async function openSurprise() {
    if (started.current) return
    started.current = true
    // Kullanıcı jesti: müzik burada güvenle açılır.
    music.ensurePlaying()
    if (reduced) {
      onDone()
      return
    }
    setPhase('inhale')
    await wait(780)
    if (cancelled.current) return
    setPhase('burst')
    await wait(640)
    if (cancelled.current) return
    setPhase('flash')
    await wait(460)
    if (cancelled.current) return
    onDone()
  }

  return (
    <section className="relative flex h-full flex-col items-center overflow-y-auto px-6 pt-[max(6.5rem,16vh)] pb-24 text-center">
      {siteConfig.herName && (
        <p className="mb-6 text-[11px] tracking-[0.42em] text-gold/80 uppercase">{siteConfig.herName}</p>
      )}

      <div className="relative grid h-56 w-56 place-items-center sm:h-64 sm:w-64">
        {!reduced && phase === 'idle' && <span className="pulse-ring" />}
        {!reduced && (
          <motion.div className="absolute inset-0" animate={{ opacity: phase === 'idle' ? 1 : 0 }}>
            {orbits.map((orbit) => (
              <span
                key={orbit.radius}
                className="orbit"
                style={{ animationDuration: `${orbit.duration}s`, animationDelay: `${orbit.delay}s` }}
              >
                <span style={{ transform: `translateY(-${orbit.radius}px)` }}>
                  <span
                    className="block rounded-full bg-blush"
                    style={{
                      width: orbit.size,
                      height: orbit.size,
                      marginLeft: -orbit.size / 2,
                      marginTop: -orbit.size / 2,
                      boxShadow: '0 0 10px #f0c4c4',
                    }}
                  />
                </span>
              </span>
            ))}
          </motion.div>
        )}
        <motion.div
          animate={
            phase === 'idle'
              ? { scale: [1, 1.045, 1], opacity: 1 }
              : phase === 'inhale'
                ? { scale: 2.35, opacity: 1 }
                : { scale: 3.1, opacity: 0 }
          }
          transition={
            phase === 'idle'
              ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <HeartMark className="h-40 w-40 sm:h-48 sm:w-48" />
        </motion.div>
        {(phase === 'burst' || phase === 'flash') &&
          burst.map((piece) => (
            <span
              key={piece.id}
              className="burst-heart"
              style={{
                fontSize: piece.size,
                animationDelay: `${piece.delay}s`,
                ['--dx' as string]: `${piece.dx}px`,
                ['--dy' as string]: `${piece.dy}px`,
              }}
            >
              ♥
            </span>
          ))}
      </div>

      <motion.div
        className="mt-8 flex flex-col items-center"
        animate={{ opacity: phase === 'idle' ? 1 : 0, y: phase === 'idle' ? 0 : 10 }}
      >
        <motion.h1
          className="serif max-w-[11em] text-[2.55rem] leading-[1.05] font-medium text-cream sm:text-6xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          {siteConfig.opening.line1}
        </motion.h1>
        <p className="serif mt-5 max-w-[18em] min-h-16 text-xl leading-snug text-blush italic sm:text-2xl">
          {typed.value}
          {lineReady && !typed.done && <span className="caret" aria-hidden />}
        </p>
        {(reduced || typed.done) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
            <MagneticButton
              className="rounded-full border border-cream/30 bg-cream/10 px-8 py-3.5 text-sm tracking-[0.18em] text-cream"
              onClick={() => void openSurprise()}
              disabled={phase !== 'idle'}
            >
              {siteConfig.opening.button}
            </MagneticButton>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: phase === 'flash' ? 1 : 0 }}
        style={{
          background:
            'radial-gradient(circle, rgba(255,244,240,0.95) 0%, rgba(226,154,164,0.5) 38%, transparent 70%)',
        }}
      />
    </section>
  )
}
