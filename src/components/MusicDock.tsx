import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/cn.ts'
import { useMusic } from '../music/useMusic.ts'

export function MusicDock() {
  const music = useMusic()
  const [open, setOpen] = useState(false)

  function togglePlay() {
    music.toggle()
  }

  return (
    <div className="fixed top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-50 flex flex-col items-end">
      <div className="relative">
        <span className="music-breathe pointer-events-none absolute inset-[-6px] rounded-full" aria-hidden />
        <span className="music-breathe music-breathe-delay pointer-events-none absolute inset-[-6px] rounded-full" aria-hidden />
        <div className="glass relative flex items-center rounded-full p-1">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full"
            onClick={togglePlay}
            aria-label={music.playing ? 'Müziği duraklat' : 'Müziği çal'}
          >
            {music.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
          {music.playing && (
            <span className="mr-1 flex h-3 items-end gap-0.5" aria-hidden>
              <span className="eq-bar" />
              <span className="eq-bar" style={{ animationDelay: '0.15s' }} />
              <span className="eq-bar" style={{ animationDelay: '0.3s' }} />
            </span>
          )}
          <button
            type="button"
            className="grid h-10 w-8 place-items-center"
            aria-expanded={open}
            aria-label="Şarkı ve ses"
            onClick={() => setOpen((value) => !value)}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass mt-2 w-[min(18rem,calc(100vw-1.5rem))] rounded-[1.4rem] p-4"
          >
            <p className="serif truncate text-2xl text-cream italic">{music.track.title}</p>
            <p className="mt-1 text-[10px] tracking-[0.22em] text-cream/55 uppercase">{music.track.artist}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" className="rounded-full border border-cream/20 p-2" onClick={music.previous} aria-label="Önceki parça">
                <SkipBack className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-full bg-cream px-4 py-2 text-xs tracking-[0.18em] text-ink uppercase" onClick={togglePlay}>
                {music.playing ? 'Duraklat' : 'Çal'}
              </button>
              <button type="button" className="rounded-full border border-cream/20 p-2" onClick={music.next} aria-label="Sonraki parça">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-4 flex items-center gap-3">
              <Volume2 className="h-4 w-4 shrink-0 text-cream/70" />
              <input
                className="volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={music.volume}
                aria-label="Ses seviyesi"
                onChange={(event) => music.setVolume(Number(event.target.value))}
              />
            </label>
            {music.hint && <p className="mt-3 text-xs leading-relaxed text-gold">{music.hint}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
