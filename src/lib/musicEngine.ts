const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='

const pitch = {
  D3: 146.83,
  F3: 174.61,
  G3: 196,
  A3: 220,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
} as const

// Original phrase. Not a transcription of a published song.
const melody: number[] = [
  pitch.E4, 0, pitch.G4, pitch.A4, pitch.C5, 0, pitch.A4, pitch.G4,
  pitch.E4, 0, pitch.G4, pitch.E4, pitch.D4, 0, pitch.E4, pitch.G4,
  pitch.A4, 0, pitch.C5, pitch.A4, pitch.G4, 0, pitch.F4, pitch.E4,
  pitch.A4, 0, pitch.E4, 0, pitch.A4, pitch.B4, pitch.C5, 0,
  pitch.D5, pitch.C5, pitch.A4, 0, pitch.F4, pitch.G4, pitch.A4, 0,
  pitch.C5, 0, pitch.B4, pitch.A4, pitch.G4, pitch.E4, 0, pitch.G4,
  pitch.B4, 0, pitch.G4, pitch.A4, pitch.B4, 0, pitch.A4, pitch.G4,
  pitch.A4, pitch.E4, 0, pitch.G4, pitch.A4, 0, 0, 0,
]

const chords: Array<{ step: number; notes: number[] }> = [
  { step: 0, notes: [pitch.A3, pitch.C4, pitch.E4] },
  { step: 8, notes: [pitch.C4, pitch.E4, pitch.G4] },
  { step: 16, notes: [pitch.F3, pitch.A3, pitch.C4] },
  { step: 24, notes: [pitch.A3, pitch.C4, pitch.E4] },
  { step: 32, notes: [pitch.D3, pitch.F3, pitch.A3] },
  { step: 40, notes: [pitch.A3, pitch.C4, pitch.E4] },
  { step: 48, notes: [pitch.G3, pitch.B3, pitch.D4] },
  { step: 56, notes: [pitch.A3, pitch.C4, pitch.E4] },
]

export class MusicEngine {
  disposed = false
  private volume: number
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private send: GainNode | null = null
  private audio: HTMLAudioElement | null = null
  private unlocker: HTMLAudioElement | null = null
  private primed = false
  private playing = false
  private mode: 'idle' | 'synth' | 'file' = 'idle'
  private timer = 0
  private step = 0
  private nextTime = 0
  private readonly stepDur = 60 / 68 / 2
  private operation = 0
  private fadeToken = 0
  private fileUrl = ''

  constructor(volume: number) {
    this.volume = volume
  }

  setVolume(value: number) {
    this.volume = Math.min(1, Math.max(0, value))
    if (this.audio && this.mode === 'file' && this.playing) this.audio.volume = this.volume
    if (this.master && this.ctx && this.playing && this.mode === 'synth') {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.04)
    }
  }

  prime() {
    if (this.disposed) return
    const ctx = this.ensureGraph()
    if (ctx.state === 'suspended') void ctx.resume()
    if (this.primed) return
    this.primed = true
    const unlocker = new Audio()
    unlocker.preload = 'auto'
    unlocker.src = SILENT_WAV
    unlocker.volume = 0
    this.unlocker = unlocker
    void unlocker.play().then(() => unlocker.pause()).catch(() => undefined)
  }

  async playSynth() {
    if (this.disposed) return
    const operation = ++this.operation
    this.prime()
    if (this.audio && this.mode === 'file' && !this.audio.paused) {
      await this.fadeElement(0, 280)
      if (this.operation !== operation) return
      this.audio.pause()
    }
    if (this.disposed || this.operation !== operation) return

    this.mode = 'synth'
    this.playing = true
    const ctx = this.ensureGraph()
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.06
    this.stopScheduler()
    this.timer = window.setInterval(this.tick, 80)
    this.tick()
    this.ramp(this.volume, 700)
  }

  preload(url: string) {
    if (this.disposed) return
    const audio = this.ensureAudio()
    const absolute = new URL(url, window.location.href).href
    if (this.fileUrl === absolute) return
    this.fileUrl = absolute
    audio.preload = 'auto'
    audio.src = url
    audio.load()
  }

  async playFile(url: string) {
    if (this.disposed) return
    const operation = ++this.operation
    // Jest kaybolmasın diye play()'den önce await yok.
    this.prime()
    this.playing = false
    this.stopScheduler()
    this.ramp(0, 250)

    const audio = this.ensureAudio()
    const absolute = new URL(url, window.location.href).href
    if (this.fileUrl !== absolute) {
      this.fileUrl = absolute
      audio.src = url
    }
    audio.currentTime = 0
    audio.volume = 0
    const playAttempt = audio.play()
    await playAttempt
    if (this.disposed || this.operation !== operation) {
      audio.pause()
      return
    }
    this.mode = 'file'
    this.playing = true
    await this.fadeElement(this.volume, 700)
  }

  async pause() {
    if (this.disposed) return
    const operation = ++this.operation
    this.playing = false
    this.stopScheduler()
    this.ramp(0, 420)
    if (this.audio && this.mode === 'file' && !this.audio.paused) {
      await this.fadeElement(0, 420)
      if (this.operation === operation) this.audio.pause()
    }
  }

  dispose() {
    this.disposed = true
    this.playing = false
    this.operation += 1
    this.fadeToken += 1
    this.stopScheduler()
    this.audio?.pause()
    this.unlocker?.pause()
    void this.ctx?.close()
    this.ctx = null
  }

  private tick = () => {
    if (!this.playing || !this.ctx || this.mode !== 'synth') return
    const horizon = this.ctx.currentTime + 0.28
    while (this.nextTime < horizon) {
      this.playStep(this.step, this.nextTime)
      this.step = (this.step + 1) % melody.length
      this.nextTime += this.stepDur
    }
  }

  private playStep(step: number, time: number) {
    const note = melody[step] ?? 0
    if (note > 0) this.voice(note, time, this.stepDur * 1.35, 0.075, true)
    for (const chord of chords) {
      if (chord.step !== step) continue
      for (const freq of chord.notes) this.voice(freq, time, this.stepDur * 7, 0.03, false)
    }
  }

  private voice(freq: number, when: number, duration: number, amp: number, bright: boolean) {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return

    const osc = ctx.createOscillator()
    const overtone = ctx.createOscillator()
    const shimmer = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    osc.type = bright ? 'triangle' : 'sine'
    overtone.type = 'sine'
    osc.frequency.setValueAtTime(freq, when)
    overtone.frequency.setValueAtTime(freq * 2, when)
    overtone.detune.setValueAtTime(bright ? 7 : 3, when)
    shimmer.gain.value = bright ? 0.25 : 0.05
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(bright ? 1600 : 900, when)
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, amp), when + (bright ? 0.02 : 0.05))
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)

    osc.connect(filter)
    overtone.connect(shimmer)
    shimmer.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    if (this.send) gain.connect(this.send)

    osc.start(when)
    overtone.start(when)
    const stopAt = when + duration + 0.04
    osc.stop(stopAt)
    overtone.stop(stopAt)
    osc.onended = () => {
      osc.disconnect()
      overtone.disconnect()
      shimmer.disconnect()
      filter.disconnect()
      gain.disconnect()
    }
  }

  private ensureGraph() {
    if (this.ctx && this.master) return this.ctx
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = 0
    const dry = ctx.createGain()
    dry.gain.value = 0.9
    const send = ctx.createGain()
    send.gain.value = 0.22
    const convolver = ctx.createConvolver()
    convolver.buffer = this.impulse(ctx)
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -16
    compressor.knee.value = 18
    compressor.ratio.value = 2.4
    compressor.attack.value = 0.01
    compressor.release.value = 0.25

    master.connect(dry)
    dry.connect(compressor)
    send.connect(convolver)
    convolver.connect(compressor)
    compressor.connect(ctx.destination)

    this.ctx = ctx
    this.master = master
    this.send = send
    return ctx
  }

  private impulse(ctx: AudioContext) {
    const length = Math.floor(ctx.sampleRate * 1.15)
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel)
      for (let index = 0; index < length; index += 1) {
        data[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 2.8
      }
    }
    return buffer
  }

  private ensureAudio() {
    if (this.audio) return this.audio
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.setAttribute('playsinline', 'true')
    this.audio = audio
    return audio
  }

  private ramp(to: number, ms: number) {
    if (!this.ctx || !this.master) return
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(to, now + ms / 1000)
  }

  private fadeElement(to: number, ms: number) {
    const audio = this.audio
    if (!audio) return Promise.resolve()
    const token = ++this.fadeToken
    const from = audio.volume
    const start = performance.now()
    return new Promise<void>((resolve) => {
      const step = (now: number) => {
        if (token !== this.fadeToken) {
          resolve()
          return
        }
        const amount = Math.min(1, (now - start) / Math.max(ms, 1))
        audio.volume = from + (to - from) * amount
        if (amount < 1) requestAnimationFrame(step)
        else resolve()
      }
      requestAnimationFrame(step)
    })
  }

  private stopScheduler() {
    window.clearInterval(this.timer)
    this.timer = 0
  }
}
