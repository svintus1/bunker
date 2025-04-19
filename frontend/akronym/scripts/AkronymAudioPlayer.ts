type AudioEvent = 'play' | 'pause' | 'ended' | 'error' | 'timeupdate'
type Callback = (payload?: any) => void

export class AkronymAudioPlayer {
  private audio: HTMLAudioElement
  private events = new Map<AudioEvent, Callback[]>()

  constructor(src?: string) {
    this.audio = new Audio(src)
    this.audio.preload = 'auto'
    this.registerNativeEvents()
  }

  load(src: string): void {
    this.audio.src = src
    this.audio.load()
  }

  play(): Promise<void> {
    return this.audio.play()
  }

  pause(): void {
    this.audio.pause()
  }

  stop(): void {
    this.audio.pause()
    this.audio.currentTime = 0
  }

  seek(time: number): void {
    this.audio.currentTime = time
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.min(1, Math.max(0, volume))
  }

  mute(): void {
    this.audio.muted = true
  }

  unmute(): void {
    this.audio.muted = false
  }

  on(event: AudioEvent, cb: Callback): void {
    const list = this.events.get(event) || []
    list.push(cb)
    this.events.set(event, list)
  }

  private trigger(event: AudioEvent, payload?: any): void {
    (this.events.get(event) || []).forEach(cb => cb(payload))
  }

  private registerNativeEvents(): void {
    this.audio.addEventListener('play',   () => this.trigger('play'))
    this.audio.addEventListener('pause',  () => this.trigger('pause'))
    this.audio.addEventListener('ended',  () => this.trigger('ended'))
    this.audio.addEventListener('error',  () => this.trigger('error'))
    this.audio.addEventListener('timeupdate',
      () => this.trigger('timeupdate', this.audio.currentTime)
    )
  }
}
