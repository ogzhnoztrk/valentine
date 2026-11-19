import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { siteConfig } from '../config.ts'
import { asset } from '../lib/assets.ts'
import { MusicEngine } from '../lib/musicEngine.ts'
import { MusicContext } from './context.ts'

const tracks = siteConfig.music.tracks

function isGestureBlocked(error: unknown) {
  return error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<MusicEngine | null>(null)
  const requestRef = useRef(0)
  const indexRef = useRef(0)
  const playingRef = useRef(false)
  const volumeRef = useRef(siteConfig.music.defaultVolume)
  /** İlk açılışta otomatik başlat; kullanıcı duraklatınca bir daha zorlama. */
  const autoUnlockRef = useRef(true)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolumeState] = useState(siteConfig.music.defaultVolume)
  const [hint, setHint] = useState<string | null>(null)

  const getEngine = useCallback(() => {
    if (!engineRef.current || engineRef.current.disposed) {
      const engine = new MusicEngine(volumeRef.current)
      engineRef.current = engine
    }
    return engineRef.current
  }, [])

  useEffect(() => {
    return () => {
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!hint) return
    const id = window.setTimeout(() => setHint(null), 5600)
    return () => window.clearTimeout(id)
  }, [hint])

  // Dosyayı önceden yükle; jest anında play() hemen çalışsın.
  useEffect(() => {
    const track = tracks[0]
    if (!track?.src) return
    getEngine().preload(asset(track.src))
  }, [getEngine])

  const start = useCallback(
    async (trackIndex: number) => {
      const engine = getEngine()
      const requestId = ++requestRef.current
      engine.prime()
      const track = tracks[trackIndex]
      if (!track) return

      try {
        if (track.src) {
          // canLoadAsset await'i jest'i bozuyordu — doğrudan çal.
          await engine.playFile(asset(track.src))
        } else {
          await engine.playSynth()
        }
        if (requestId !== requestRef.current) return
        playingRef.current = true
        autoUnlockRef.current = false
        setPlaying(true)
        setHint(null)
      } catch (error) {
        if (requestId !== requestRef.current) return
        playingRef.current = false
        setPlaying(false)
        // Autoplay engeli: sessiz kal, ilk dokunuşta tekrar dene.
        if (isGestureBlocked(error) && autoUnlockRef.current) return
        setHint(track.src ? siteConfig.music.missingHint : siteConfig.music.unsupported)
      }
    },
    [getEngine],
  )

  const pause = useCallback(async () => {
    autoUnlockRef.current = false
    requestRef.current += 1
    playingRef.current = false
    setPlaying(false)
    await getEngine().pause()
  }, [getEngine])

  const toggle = useCallback(() => {
    if (playingRef.current) {
      void pause()
      return
    }
    void start(indexRef.current)
  }, [pause, start])

  const ensurePlaying = useCallback(() => {
    if (playingRef.current) return
    void start(indexRef.current)
  }, [start])

  // Site açılınca dene; tarayıcı engellerse ilk jestte hemen başlat.
  useEffect(() => {
    void start(0)

    const unlock = (event: Event) => {
      if (!autoUnlockRef.current) {
        window.removeEventListener('pointerdown', unlock, true)
        window.removeEventListener('keydown', unlock, true)
        window.removeEventListener('touchstart', unlock, true)
        return
      }
      if (playingRef.current) {
        autoUnlockRef.current = false
        return
      }
      // Müzik dock kendi toggle'ını kullansın.
      if (event.target instanceof Element && event.target.closest('[data-music-dock]')) return
      void start(indexRef.current)
    }

    window.addEventListener('pointerdown', unlock, true)
    window.addEventListener('keydown', unlock, true)
    window.addEventListener('touchstart', unlock, { capture: true, passive: true })

    return () => {
      window.removeEventListener('pointerdown', unlock, true)
      window.removeEventListener('keydown', unlock, true)
      window.removeEventListener('touchstart', unlock, true)
    }
  }, [start])

  const changeTrack = useCallback(
    (nextIndex: number) => {
      const total = tracks.length
      if (total === 0) return
      const normalized = (nextIndex + total) % total
      indexRef.current = normalized
      setIndex(normalized)
      if (!playingRef.current) return
      void start(normalized)
    },
    [start],
  )

  const next = useCallback(() => changeTrack(indexRef.current + 1), [changeTrack])
  const previous = useCallback(() => changeTrack(indexRef.current - 1), [changeTrack])

  const setVolume = useCallback(
    (value: number) => {
      const nextVolume = Math.min(1, Math.max(0, value))
      volumeRef.current = nextVolume
      setVolumeState(nextVolume)
      getEngine().setVolume(nextVolume)
    },
    [getEngine],
  )

  const value = useMemo(
    () => ({
      playing,
      volume,
      track: tracks[index] ?? tracks[0],
      hint,
      toggle,
      ensurePlaying,
      next,
      previous,
      setVolume,
    }),
    [playing, volume, index, hint, toggle, ensurePlaying, next, previous, setVolume],
  )

  return <MusicContext value={value}>{children}</MusicContext>
}
