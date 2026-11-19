import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { siteConfig } from '../../config.ts'
import { useTypewriter } from '../../hooks/useTypewriter.ts'
import { makeHearts } from '../../lib/hearts.ts'
import type { HeartParticle } from '../../lib/hearts.ts'
import { cn } from '../../lib/cn.ts'
import { Celebration } from '../Celebration.tsx'
import { HeartMark } from '../HeartMark.tsx'
import { MagneticButton } from '../MagneticButton.tsx'
import { RisingHearts } from '../RisingHearts.tsx'

const yesClass =
  'rounded-full bg-cream px-7 py-3 text-sm font-medium tracking-[0.16em] text-burgundy shadow-[0_12px_40px_rgba(244,236,227,0.2)]'
const noClass =
  'max-w-[16rem] rounded-full border border-cream/30 bg-ink/45 px-5 py-3 text-center text-sm leading-snug tracking-[0.08em] text-cream shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-md'

function findPoint(avoid?: DOMRect) {
  const width = 180
  const height = 58
  const margin = 8
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const x = margin + Math.random() * Math.max(1, window.innerWidth - width - margin * 2)
    const y = 74 + Math.random() * Math.max(1, window.innerHeight - height - 100)
    const hitsYes = avoid
      ? x < avoid.right + 18 && x + width > avoid.left - 18 && y < avoid.bottom + 18 && y + height > avoid.top - 18
      : false
    const hitsMusic = x > window.innerWidth - 130 && y < 84
    if (!hitsYes && !hitsMusic) return { x, y }
  }
  return { x: margin, y: Math.max(84, window.innerHeight - height - 24) }
}

export function QuestionScene({ onWarm, onDone }: { onWarm: () => void; onDone: () => void }) {
  const reduced = useReducedMotion() === true
  const stages = siteConfig.question.noStages
  const intro = useTypewriter(siteConfig.question.intro, true, 30)
  const [showAsk, setShowAsk] = useState(false)
  const [noCount, setNoCount] = useState(0)
  const [flee, setFlee] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [hearts, setHearts] = useState<HeartParticle[]>([])
  const [celebrating, setCelebrating] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const countRef = useRef(0)
  const fleeRef = useRef(false)
  const answeredRef = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const yesRef = useRef<HTMLSpanElement>(null)
  const posRef = useRef<{ x: number; y: number } | null>(null)
  const lastJump = useRef(0)
  const fleeTimer = useRef(0)
  const jumpTimer = useRef(0)
  const onDoneRef = useRef(onDone)
  const onWarmRef = useRef(onWarm)

  useEffect(() => {
    onDoneRef.current = onDone
    onWarmRef.current = onWarm
  })

  useEffect(() => {
    return () => {
      window.clearTimeout(fleeTimer.current)
      window.clearTimeout(jumpTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!intro.done) return
    const id = window.setTimeout(() => setShowAsk(true), reduced ? 180 : 1400)
    return () => window.clearTimeout(id)
  }, [intro.done, reduced])

  const relocate = useCallback(() => {
    const target = yesRef.current?.querySelector('button') ?? yesRef.current
    const next = findPoint(target?.getBoundingClientRect())
    posRef.current = next
    setPos(next)
  }, [])

  const removeHeart = useCallback((id: number) => {
    setHearts((current) => current.filter((heart) => heart.id !== id))
  }, [])

  function emitHearts() {
    const rect = buttonRef.current?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top : window.innerHeight / 2
    setHearts((current) => [...current, ...makeHearts(x, y, 7)].slice(-30))
  }

  function beginFlee() {
    if (fleeRef.current || answeredRef.current) return
    const rect = buttonRef.current?.getBoundingClientRect()
    const start = { x: rect?.left ?? 16, y: rect?.top ?? 120 }
    posRef.current = start
    fleeRef.current = true
    setPos(start)
    setFlee(true)
    jumpTimer.current = window.setTimeout(() => {
      if (!answeredRef.current) relocate()
    }, 90)
  }

  function pressNo() {
    if (answeredRef.current) return
    countRef.current += 1
    const next = countRef.current
    setNoCount(next)
    emitHearts()
    if (next > stages.length) {
      window.clearTimeout(fleeTimer.current)
      if (fleeRef.current) relocate()
      else beginFlee()
      return
    }
    if (next === stages.length) {
      window.clearTimeout(fleeTimer.current)
      fleeTimer.current = window.setTimeout(beginFlee, reduced ? 200 : 1100)
    }
  }

  function pressYes() {
    if (answeredRef.current) return
    answeredRef.current = true
    window.clearTimeout(fleeTimer.current)
    window.clearTimeout(jumpTimer.current)
    setCelebrating(true)
  }

  useEffect(() => {
    if (!celebrating) return
    onWarmRef.current()
    const fade = window.setTimeout(() => setLeaving(true), reduced ? 500 : 2300)
    const done = window.setTimeout(() => onDoneRef.current(), reduced ? 800 : 2750)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(done)
    }
  }, [celebrating, reduced])

  useEffect(() => {
    if (!flee || celebrating) return
    const id = window.setInterval(() => {
      if (!answeredRef.current) relocate()
    }, 1600)
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const current = posRef.current
      if (!current) return
      const now = performance.now()
      if (now - lastJump.current < 350) return
      const dx = event.clientX - (current.x + 80)
      const dy = event.clientY - (current.y + 26)
      if (Math.hypot(dx, dy) < 120) {
        lastJump.current = now
        relocate()
      }
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('pointermove', onMove)
    }
  }, [celebrating, flee, relocate])

  const stageLabel = stages[Math.min(Math.max(noCount, 1), stages.length) - 1]
  const label = noCount === 0 ? siteConfig.question.no : (stageLabel ?? siteConfig.question.no)
  const yesScale = 1 + Math.min(noCount, 7) * 0.09
  const noScale = 1 + Math.min(noCount, stages.length) * 0.05

  return (
    <section className="relative flex h-full flex-col items-center overflow-y-auto px-6 pt-[max(6.5rem,14vh)] pb-24 text-center">
      <p className="serif max-w-[16em] min-h-16 text-3xl leading-tight text-cream/85 italic sm:text-4xl">
        {intro.value}
        {!intro.done && <span className="caret" aria-hidden />}
      </p>

      {showAsk && (
        <motion.div
          className="mt-8 flex w-full flex-col items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="serif max-w-[12em] text-5xl leading-[1.05] font-medium sm:text-7xl">
            {siteConfig.question.ask}
          </h1>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span ref={yesRef} className="inline-flex">
              <MagneticButton
                className={cn(yesClass, noCount >= 2 && 'yes-pulse')}
                scale={yesScale}
                onClick={pressYes}
                disabled={celebrating}
              >
                {siteConfig.question.yes}
              </MagneticButton>
            </span>
            {!flee && (
              <motion.button
                ref={buttonRef}
                type="button"
                className={noClass}
                animate={{ scale: noScale }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                onClick={pressNo}
              >
                {label}
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      <RisingHearts hearts={hearts} onDone={removeHeart} />

      {flee && pos && !celebrating &&
        createPortal(
          <motion.button
            ref={buttonRef}
            type="button"
            className={noClass}
            initial={{ left: pos.x, top: pos.y, scale: noScale }}
            animate={{ left: pos.x, top: pos.y, scale: 0.72 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{ position: 'fixed', zIndex: 46 }}
            onClick={pressNo}
          >
            {label}
          </motion.button>,
          document.body,
        )}

      {celebrating &&
        createPortal(
          <motion.div
            className="fixed inset-0 z-[48] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: leaving ? 0 : 1 }}
            transition={{ duration: 0.45 }}
          >
            <Celebration />
            <div className="relative z-10 px-6 text-center">
              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14 }}
              >
                <HeartMark className="mx-auto h-28 w-28" />
              </motion.div>
              <motion.p
                className="serif mt-6 text-5xl leading-tight text-cream italic sm:text-7xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {siteConfig.question.yesMessage}
              </motion.p>
            </div>
          </motion.div>,
          document.body,
        )}
    </section>
  )
}
