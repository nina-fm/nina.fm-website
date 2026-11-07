import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PlayingRadio } from './player.ts'

const panik: PlayingRadio = {
  id: 'radio-panik',
  name: 'Radio Panik',
  streamUrl: 'https://example.org/panik.mp3',
  imageUrl: '/_astro/panik.webp',
}

/** Listeners by event type, for the stand-ins below. */
const listenersOf = () => {
  const listeners = new Map<string, (() => void)[]>()
  return {
    addEventListener: (type: string, listener: () => void) =>
      listeners.set(type, [...(listeners.get(type) ?? []), listener]),
    fire: (type: string) => {
      for (const listener of listeners.get(type) ?? []) listener()
    },
  }
}

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
const ANDROID =
  'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36'

/**
 * A locked phone. An iPhone (on-device-checks 1.1, 2026-10-19) suspends a page
 * that plays nothing, and a silence started right after pausing the stream
 * stalls; Chrome on Android shows a playing element as playing.
 */
async function lockedPhone(userAgent = IPHONE) {
  const actions = new Map<string, () => void>()
  vi.stubGlobal('document', { ...listenersOf(), documentElement: { lang: 'fr' } })
  vi.stubGlobal('window', listenersOf())
  vi.stubGlobal('navigator', {
    onLine: true,
    userAgent,
    maxTouchPoints: 5,
    mediaSession: {
      metadata: null,
      playbackState: 'none',
      setActionHandler: (action: string, handler: () => void) => actions.set(action, handler),
    },
  })
  vi.stubGlobal('location', { origin: 'https://ohmyradios.example' })
  vi.stubGlobal('MediaMetadata', class {})
  vi.resetModules()
  const controls = await import('./controls.client.ts')
  const { player } = await import('./player.store.ts')

  const audio = {
    ...listenersOf(),
    src: '',
    loop: false,
    paused: true,
    currentTime: 0,
    /** Calls to `pause()`, the source paused each time. */
    pauses: [] as string[],
    play() {
      audio.paused = false
      audio.fire('play')
      return new Promise<void>(() => undefined)
    },
    pause() {
      audio.pauses.push(audio.src)
      if (audio.paused) return
      audio.paused = true
      audio.fire('pause')
    },
    load: () => undefined,
    getAttribute: (name: string) => (name === 'src' && audio.src ? audio.src : null),
    removeAttribute: () => {
      audio.src = ''
    },
  }
  controls.attachElement(audio as unknown as HTMLAudioElement)
  return { controls, player, audio, press: (action: string) => actions.get(action)!() }
}

describe('the lock screen pause on a locked phone', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('keeps the page awake with the silence for ten minutes, so that play can resume', async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(panik)
    audio.fire('playing')
    expect(player.state.status).toBe('playing')

    press('pause')
    expect(player.state.status).toBe('paused')
    expect(navigator.mediaSession.playbackState).toBe('paused')
    // The stream is swapped for the silence without being paused first.
    expect(audio.pauses).toEqual([])
    expect(audio.src.startsWith('blob:')).toBe(true)
    audio.fire('playing')
    expect(audio.paused).toBe(false)

    vi.advanceTimersByTime(10 * 60_000 - 1)
    expect(audio.paused).toBe(false)
    vi.advanceTimersByTime(1)
    expect(audio.paused).toBe(true)
    expect(player.state.status).toBe('paused')

    press('play')
    expect(audio.src).toBe(panik.streamUrl)
    expect(player.state.status).toBe('loading')
    controls.detachElement()
  })

  it('plays again from the lock screen while the silence keeps the page awake', async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(panik)
    audio.fire('playing')
    press('pause')
    audio.fire('playing')

    press('play')
    expect(audio.src).toBe(panik.streamUrl)
    audio.fire('playing')
    expect(player.state.status).toBe('playing')
    // The ten minutes no longer run: nothing pauses the stream.
    vi.advanceTimersByTime(10 * 60_000)
    expect(audio.paused).toBe(false)
    controls.detachElement()
  })

  it("plays again on the headphones' second press, which iOS sends as pause", async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(panik)
    audio.fire('playing')
    press('pause')
    // The silence plays: WebKit sees the element playing, and the toggle
    // sends pause again.
    audio.fire('playing')

    press('pause')
    expect(audio.src).toBe(panik.streamUrl)
    expect(player.state.status).toBe('loading')
    audio.fire('playing')
    expect(player.state.status).toBe('playing')
    controls.detachElement()
  })

  it('leaves the element a call paused to the iPhone, which plays again once the call ends', async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(panik)
    audio.fire('playing')

    // The ringing: the system pauses the element.
    audio.paused = true
    audio.fire('pause')
    expect(player.state.status).toBe('paused')
    expect(audio.pauses).toEqual([])
    expect(audio.src).toBe(panik.streamUrl)
    expect(navigator.mediaSession.playbackState).toBe('paused')

    // The call ends: the system sends play.
    press('play')
    expect(player.state.status).toBe('loading')
    expect(audio.paused).toBe(false)
    audio.fire('playing')
    expect(player.state.status).toBe('playing')
    controls.detachElement()
  })

  it('takes the pause a call sends, once it cut the element, for the system, never for a press', async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(panik)
    audio.fire('playing')

    // The ringing on iOS 27: the element is cut, then pause is sent.
    audio.paused = true
    press('pause')
    audio.fire('pause')
    expect(player.state.status).toBe('paused')
    // An imposed pause: the stream is kept, and no silence plays.
    expect(audio.src).toBe(panik.streamUrl)
    expect(audio.paused).toBe(true)

    // Answered: pause again, the element still cut. Not the headset's toggle.
    press('pause')
    expect(player.state.status).toBe('paused')
    expect(audio.paused).toBe(true)

    // The call ends.
    press('play')
    expect(player.state.status).toBe('loading')
    controls.detachElement()
  })

  it('pauses the element a call paused again on Android, which resumes it all the same', async () => {
    vi.useFakeTimers()
    const { controls, player, audio } = await lockedPhone(ANDROID)
    controls.play(panik)
    audio.fire('playing')

    audio.paused = true
    audio.fire('pause')
    expect(player.state.status).toBe('paused')
    expect(audio.pauses).toEqual([panik.streamUrl])
    controls.detachElement()
  })

  it('pauses the silence at once on Android, where it would show as playing', async () => {
    const { controls, player, audio, press } = await lockedPhone(ANDROID)
    controls.play(panik)
    audio.fire('playing')

    press('pause')
    expect(audio.pauses).toEqual([panik.streamUrl])
    expect(audio.src.startsWith('blob:')).toBe(true)
    // Started, as Chrome keeps in its session only an element that played (E6)…
    expect(audio.paused).toBe(false)
    audio.fire('playing')
    // …then paused.
    expect(audio.paused).toBe(true)
    expect(player.state.status).toBe('paused')
    controls.detachElement()
  })
})
