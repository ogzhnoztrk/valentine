import { motion, useReducedMotion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Mood } from '../types.ts'

type Particle = {
  x: number
  y: number
  r: number
  a: number
  vx: number
  vy: number
  phase: number
}

const petals = [
  { left: '7%', delay: '-2s', duration: '18s', dx: '36px' },
  { left: '24%', delay: '-8s', duration: '22s', dx: '-28px' },
  { left: '46%', delay: '-14s', duration: '19s', dx: '18px' },
  { left: '68%', delay: '-5s', duration: '24s', dx: '-46px' },
  { left: '86%', delay: '-11s', duration: '20s', dx: '22px' },
]

const driftingHearts = [
  { left: '12%', top: '68%', size: 13, delay: '0s', duration: '7s' },
  { left: '78%', top: '18%', size: 11, delay: '1.2s', duration: '8s' },
  { left: '88%', top: '62%', size: 15, delay: '0.4s', duration: '6.5s' },
  { left: '22%', top: '38%', size: 10, delay: '1.8s', duration: '9s' },
  { left: '58%', top: '78%', size: 12, delay: '0.8s', duration: '7.4s' },
]

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.6 + 0.4,
    a: Math.random() * 0.4 + 0.12,
    vx: (Math.random() - 0.5) * 0.16,
    vy: -0.05 - Math.random() * 0.15,
    phase: Math.random() * Math.PI * 2,
  }
}

export function Ambient({ mood }: { mood: Mood }) {
  const reduced = useReducedMotion() === true
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const mobile = window.matchMedia('(max-width: 720px)').matches
    const count = reduced ? 8 : mobile ? 22 : 48
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let frame = 0
    let running = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (particles.length === 0) {
        particles = Array.from({ length: count }, () => createParticle(width, height))
      }
    }

    const draw = (time: number) => {
      if (!running) return
      context.clearRect(0, 0, width, height)
      for (const particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy
        if (particle.y < -4) particle.y = height + 4
        if (particle.x < -4) particle.x = width + 4
        if (particle.x > width + 4) particle.x = -4
        const alpha = particle.a * (0.45 + 0.55 * Math.sin(time * 0.0015 + particle.phase))
        context.beginPath()
        context.fillStyle = `rgba(244, 214, 210, ${alpha})`
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2)
        context.fill()
      }
      frame = requestAnimationFrame(draw)
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(frame)
        return
      }
      if (!running) {
        running = true
        frame = requestAnimationFrame(draw)
      }
    }

    resize()
    frame = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, #5c1c2e 0%, transparent 56%), radial-gradient(ellipse at 100% 100%, #3a1422 0%, transparent 42%), #12080b',
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: mood === 'blush' ? 1 : 0 }}
        transition={{ duration: reduced ? 0.2 : 1.2 }}
        style={{ background: 'radial-gradient(circle at 50% 42%, #c86b7c 0%, #6d2438 46%, #14080c 100%)' }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: mood === 'warm' ? 1 : 0 }}
        transition={{ duration: reduced ? 0.2 : 1.3 }}
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #a85a68 0%, #4c1c2c 50%, #14080c 100%)' }}
      />
      <motion.div
        className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-[#7c2438]/35 blur-3xl"
        animate={reduced ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-4rem] bottom-[-2rem] h-80 w-80 rounded-full bg-[#d36b78]/20 blur-3xl"
        animate={reduced ? undefined : { x: [0, -28, 0], y: [0, -18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {petals.map((petal) => (
        <span
          key={petal.left}
          className="petal"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            ['--dx' as string]: petal.dx,
          }}
        />
      ))}
      {driftingHearts.map((heart) => (
        <Heart
          key={`${heart.left}-${heart.top}`}
          className="absolute fill-blush/40 text-blush/50"
          style={{
            left: heart.left,
            top: heart.top,
            width: heart.size,
            height: heart.size,
            animation: reduced ? undefined : `drift ${heart.duration} ease-in-out ${heart.delay} infinite`,
          }}
        />
      ))}
    </div>
  )
}
