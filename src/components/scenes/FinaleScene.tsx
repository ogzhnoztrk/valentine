import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ChevronDown, Heart } from 'lucide-react'
import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { siteConfig } from '../../config.ts'
import { asset } from '../../lib/assets.ts'
import { makeHearts } from '../../lib/hearts.ts'
import type { HeartParticle } from '../../lib/hearts.ts'
import { RisingHearts } from '../RisingHearts.tsx'

const floaters = [
  { top: '6%', left: '-8%', size: 14, delay: '0s' },
  { top: '18%', right: '-10%', size: 11, delay: '0.8s' },
  { bottom: '18%', left: '-6%', size: 12, delay: '0.3s' },
  { bottom: '8%', right: '-4%', size: 16, delay: '1.1s' },
]

export function FinaleScene() {
  const reduced = useReducedMotion() === true
  const photo = siteConfig.finale
  const [failed, setFailed] = useState(false)
  const [hearts, setHearts] = useState<HeartParticle[]>([])
  const photoTaps = useRef(0)
  const closingRef = useRef<HTMLParagraphElement>(null)
  const closingVisible = useInView(closingRef, { amount: 0.7 })
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const tiltX = useSpring(rotateX, { stiffness: 140, damping: 16 })
  const tiltY = useSpring(rotateY, { stiffness: 140, damping: 16 })
  const scale = useMotionValue(1)
  const note = photo.polaroidNote || siteConfig.herName

  const removeHeart = useCallback((id: number) => {
    setHearts((current) => current.filter((heart) => heart.id !== id))
  }, [])

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - bounds.left) / bounds.width - 0.5
    const py = (event.clientY - bounds.top) / bounds.height - 0.5
    rotateY.set(px * 12)
    rotateX.set(-py * 8)
  }

  function onPhoto(event: ReactPointerEvent<HTMLDivElement>) {
    event.stopPropagation()
    if (!reduced) void animate(scale, [1, 1.035, 1], { duration: 0.4 })
    photoTaps.current += 1
    if (photoTaps.current % 3 !== 0) return
    const bounds = event.currentTarget.getBoundingClientRect()
    setHearts((current) =>
      [...current, ...makeHearts(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 14)].slice(-30),
    )
  }

  function onSurface(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('button, a, input, textarea, [data-photo]')) return
    setHearts((current) => [...current, ...makeHearts(event.clientX, event.clientY, 3)].slice(-24))
  }

  return (
    <section className="h-full overflow-y-auto" onPointerDown={onSurface}>
      <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center px-6 pt-[max(6rem,10vh)] pb-28 text-center">
        <motion.h1
          className="serif max-w-[14em] text-4xl leading-tight font-medium sm:text-6xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {photo.title}
        </motion.h1>

        <motion.div
          className="relative mt-10 w-[min(72vw,280px)]"
          style={{ rotate: -1.6 }}
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          {floaters.map((item) => (
            <Heart
              key={`${item.top ?? item.bottom}-${item.left ?? item.right}`}
              aria-hidden
              className="pointer-events-none absolute fill-blush/80 text-blush"
              style={{
                top: item.top,
                left: item.left,
                right: item.right,
                bottom: item.bottom,
                width: item.size,
                height: item.size,
                animation: reduced ? undefined : `drift 4.8s ease-in-out ${item.delay} infinite`,
              }}
            />
          ))}
          <div className="[perspective:900px]">
            <motion.div
              data-photo
              className="relative bg-[#f6f0e8] px-2.5 pt-2.5 pb-12 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
              style={{ rotateX: tiltX, rotateY: tiltY, scale }}
              onPointerMove={onPointerMove}
              onPointerLeave={() => {
                rotateX.set(0)
                rotateY.set(0)
              }}
              onPointerDown={onPhoto}
            >
              {/* 9:16 — ask.jpeg kolajıyla aynı oran; kırpma yok */}
              <div className="relative aspect-[9/16] overflow-hidden bg-[#1a0a10]">
                {!failed && (
                  <motion.img
                    src={asset(photo.photo)}
                    alt={photo.photoAlt}
                    className="absolute inset-0 h-full w-full object-contain"
                    draggable={false}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    onError={() => setFailed(true)}
                  />
                )}
                {failed && (
                  <div className="absolute inset-0 grid place-items-center px-6 text-sm leading-relaxed text-cream/80">
                    {photo.photoHint}
                  </div>
                )}
                <motion.span
                  className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  initial={{ x: '-130%' }}
                  animate={{ x: '320%' }}
                  transition={{ delay: 0.7, duration: 1.3, ease: 'easeInOut' }}
                />
              </div>
              <p className="serif absolute inset-x-0 bottom-2.5 text-center text-lg text-[#6e2436] italic">
                {note || '♥'}
              </p>
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-10 max-w-md space-y-3">
          {photo.lines.map((line, index) => (
            <motion.p
              key={line}
              className="serif text-xl leading-relaxed text-cream/90 sm:text-2xl"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ delay: index * 0.12, duration: 0.55 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.p
          ref={closingRef}
          className="serif mt-12 text-5xl leading-none font-medium sm:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
        >
          {photo.closing}
        </motion.p>

        {siteConfig.myName && (
          <p className="mt-8 text-[11px] tracking-[0.38em] text-cream/55 uppercase">{siteConfig.myName}</p>
        )}
      </div>

      {!closingVisible && (
        <button
          type="button"
          className="fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] left-1/2 z-30 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-cream/25 bg-ink/40"
          aria-label="Devamını gör"
          onClick={() => closingRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      <RisingHearts hearts={hearts} onDone={removeHeart} />
    </section>
  )
}
