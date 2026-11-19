import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { forwardRef, memo, useCallback, useEffect, useState, type ReactNode } from 'react'
import { Ambient } from './components/Ambient.tsx'
import { CursorGlow } from './components/CursorGlow.tsx'
import { FilmGrain } from './components/FilmGrain.tsx'
import { MusicDock } from './components/MusicDock.tsx'
import { SecretHeart } from './components/SecretHeart.tsx'
import { SecretNote } from './components/SecretNote.tsx'
import { CardsScene } from './components/scenes/CardsScene.tsx'
import { FinaleScene } from './components/scenes/FinaleScene.tsx'
import { OpeningScene } from './components/scenes/OpeningScene.tsx'
import { QuestionScene } from './components/scenes/QuestionScene.tsx'
import { siteConfig } from './config.ts'
import { asset } from './lib/assets.ts'
import { cn } from './lib/cn.ts'
import { MusicProvider } from './music/MusicProvider.tsx'
import type { Mood, SceneId } from './types.ts'

const steps: SceneId[] = ['opening', 'cards', 'question', 'finale']

const SceneFrame = forwardRef<HTMLDivElement, { children: ReactNode }>(function SceneFrame({ children }, ref) {
  const reduced = useReducedMotion() ?? false
  return (
    <motion.div
      ref={ref}
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.55, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
})

function Progress({ scene }: { scene: SceneId }) {
  if (scene === 'finale') return null
  return (
    <div
      className="pointer-events-none fixed bottom-[max(0.9rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 gap-2"
      aria-hidden
    >
      {steps.map((step) => (
        <span
          key={step}
          className={cn('h-1 rounded-full transition-all duration-500', step === scene ? 'w-6 bg-blush' : 'w-1.5 bg-cream/35')}
        />
      ))}
    </div>
  )
}

const Experience = memo(function Experience() {
  const [scene, setScene] = useState<SceneId>('opening')
  const [mood, setMood] = useState<Mood>('night')
  const [secretOpen, setSecretOpen] = useState(false)
  const closeSecret = useCallback(() => setSecretOpen(false), [])

  useEffect(() => {
    document.title = siteConfig.metaTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', siteConfig.metaDescription)
    const image = new Image()
    image.src = asset(siteConfig.finale.photo)
  }, [])

  return (
    <div className="relative h-full overflow-hidden text-cream">
      <Ambient mood={mood} />
      <CursorGlow />
      <div className="relative z-10 h-full">
        <AnimatePresence mode="wait">
          {scene === 'opening' && (
            <SceneFrame key="opening">
              <OpeningScene onDone={() => setScene('cards')} />
            </SceneFrame>
          )}
          {scene === 'cards' && (
            <SceneFrame key="cards">
              <CardsScene onDone={() => setScene('question')} />
            </SceneFrame>
          )}
          {scene === 'question' && (
            <SceneFrame key="question">
              <QuestionScene
                onWarm={() => setMood('blush')}
                onDone={() => {
                  setMood('warm')
                  setScene('finale')
                }}
              />
            </SceneFrame>
          )}
          {scene === 'finale' && (
            <SceneFrame key="finale">
              <FinaleScene />
            </SceneFrame>
          )}
        </AnimatePresence>
      </div>
      <FilmGrain />
      {scene !== 'question' && <SecretHeart onOpen={() => setSecretOpen(true)} />}
      <Progress scene={scene} />
      <SecretNote open={secretOpen} onClose={closeSecret} />
    </div>
  )
})

export default function App() {
  return (
    <MusicProvider>
      <Experience />
      <MusicDock />
    </MusicProvider>
  )
}
