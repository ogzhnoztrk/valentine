import { useContext } from 'react'
import { MusicContext } from './context.ts'

export function useMusic() {
  const value = useContext(MusicContext)
  if (!value) throw new Error('Müzik kontrolleri hazır değil.')
  return value
}
