export type HeartParticle = {
  id: number
  x: number
  y: number
  dx: number
  size: number
  duration: number
  color: string
}

const palette = ['#f0c4c4', '#f4ece3', '#e4c7a1', '#d36b78']

let heartId = 1

export function makeHearts(x: number, y: number, count: number): HeartParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: heartId++,
    x: x + (Math.random() - 0.5) * 18,
    y,
    dx: (Math.random() - 0.5) * 90,
    size: 12 + Math.random() * 14,
    duration: 1000 + Math.random() * 800,
    color: palette[(index + heartId) % palette.length] ?? palette[0],
  }))
}
