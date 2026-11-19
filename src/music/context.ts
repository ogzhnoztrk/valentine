import { createContext } from 'react'
import type { MusicTrack } from '../config.ts'

export type MusicControls = {
  playing: boolean
  volume: number
  track: MusicTrack
  hint: string | null
  toggle: () => void
  /** Tarayıcı engellerse ilk dokunuşta / butonda müzik başlatır. */
  ensurePlaying: () => void
  next: () => void
  previous: () => void
  setVolume: (value: number) => void
}

export const MusicContext = createContext<MusicControls | null>(null)
