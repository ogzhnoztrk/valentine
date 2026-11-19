import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { siteConfig } from '../config.ts'
import { asset } from '../lib/assets.ts'
import { MusicEngine } from '../lib/musicEngine.ts'
import { canLoadAsset } from '../lib/probe.ts'
import { MusicContext } from './context.ts'

const tracks = siteConfig.music.tracks

export function MusicProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<MusicEngine | null>(null)
  const requestRef = useRef(0)
  const indexRef = useRef(0)
  const playingRef = useRef(false)
  const volumeRef = useRef(siteConfig.music.defaultVolume)
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

  const start = useCallback(
    async (trackIndex: number) => {
      const engine = getEngine()
      const requestId = ++requestRef.current
      engine.prime()
      const track = tracks[trackIndex]
      if (!track) return

      try {
        if (track.src) {
          const url = asset(track.src)
          const available = await canLoadAsset(url)
          if (requestId !== requestRef.current) return
          if (!available) {
            playingRef.current = false
            setPlaying(false)
            setHint(siteConfig.music.missingHint)
            await engine.pause()
            return
          }
          await engine.playFile(url)
        } else {
          await engine.playSynth()
        }
        if (requestId !== requestRef.current) return
        playingRef.current = true
        setPlaying(true)
        setHint(null)
      } catch {
        if (requestId !== requestRef.current) return
        playingRef.current = false
        setPlaying(false)
        setHint(track.src ? siteConfig.music.missingHint : siteConfig.music.unsupported)
      }
    },
    [getEngine],
  )

  const pause = useCallback(async () => {
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
      next,
      previous,
      setVolume,
    }),
    [playing, volume, index, hint, toggle, next, previous, setVolume],
  )

  return <MusicContext value={value}>{children}</MusicContext>
}
