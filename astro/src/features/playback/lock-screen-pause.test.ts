import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockRadio } from './radio.fixture.ts'

const nina = createMockRadio()

/** Les écouteurs par type d'événement, pour les doublures ci-dessous. */
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
 * Un téléphone verrouillé. Un iPhone (vérifications sur appareil d'ohmyradios 1.1,
 * 2026-10-19) suspend une page qui ne joue rien, et un silence lancé juste après la
 * pause du flux se bloque ; Chrome sur Android montre en lecture un élément qui joue.
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
  vi.stubGlobal('location', { origin: 'https://www.nina.example' })
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
    /** Les appels à `pause()`, avec la source mise en pause à chaque fois. */
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

  it('should keep the page awake with the silence for ten minutes when paused, so that play can resume', async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(nina)
    audio.fire('playing')
    expect(player.state.status).toBe('playing')

    press('pause')
    expect(player.state.status).toBe('paused')
    expect(navigator.mediaSession.playbackState).toBe('paused')
    // Le flux est remplacé par le silence sans être mis en pause d'abord.
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
    expect(audio.src).toBe(nina.streamUrl)
    expect(player.state.status).toBe('loading')
    controls.detachElement()
  })

  it('should play again when play is pressed while the silence keeps the page awake', async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(nina)
    audio.fire('playing')
    press('pause')
    audio.fire('playing')

    press('play')
    expect(audio.src).toBe(nina.streamUrl)
    audio.fire('playing')
    expect(player.state.status).toBe('playing')
    // Les dix minutes ne courent plus : rien ne met le flux en pause.
    for (let second = 0; second < 10 * 60; second += 1) {
      audio.currentTime += 1
      vi.advanceTimersByTime(1000)
    }
    expect(audio.paused).toBe(false)
    expect(player.state.status).toBe('playing')
    controls.detachElement()
  })

  it('should reconnect when the stream says playing but never moves', async () => {
    vi.useFakeTimers()
    const { controls, player, audio } = await lockedPhone()
    controls.play(nina)
    // iOS l'a fait après une coupure réseau, écran verrouillé (website#92).
    audio.fire('playing')
    expect(player.state.status).toBe('playing')

    vi.advanceTimersByTime(10_000)
    expect(player.state.status).toBe('reconnecting')
    controls.detachElement()
  })

  it('should play again when the headset is pressed twice, which iOS sends as pause', async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(nina)
    audio.fire('playing')
    press('pause')
    // Le silence joue : WebKit voit l'élément en lecture, et la bascule renvoie
    // pause.
    audio.fire('playing')

    press('pause')
    expect(audio.src).toBe(nina.streamUrl)
    expect(player.state.status).toBe('loading')
    audio.fire('playing')
    expect(player.state.status).toBe('playing')
    controls.detachElement()
  })

  it('should leave the element to the iPhone when a call paused it, and play again once it ends', async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(nina)
    audio.fire('playing')

    // La sonnerie : le système met l'élément en pause.
    audio.paused = true
    audio.fire('pause')
    expect(player.state.status).toBe('paused')
    expect(audio.pauses).toEqual([])
    expect(audio.src).toBe(nina.streamUrl)
    expect(navigator.mediaSession.playbackState).toBe('paused')

    // L'appel se termine : le système envoie play.
    press('play')
    expect(player.state.status).toBe('loading')
    expect(audio.paused).toBe(false)
    audio.fire('playing')
    expect(player.state.status).toBe('playing')
    controls.detachElement()
  })

  it('should take the pause as imposed when a call sends it after cutting the element', async () => {
    vi.useFakeTimers()
    const { controls, player, audio, press } = await lockedPhone()
    controls.play(nina)
    audio.fire('playing')

    // La sonnerie sur iOS 27 : l'élément est coupé, puis pause est envoyé.
    audio.paused = true
    press('pause')
    audio.fire('pause')
    expect(player.state.status).toBe('paused')
    // Une pause imposée : le flux est gardé, et aucun silence ne joue.
    expect(audio.src).toBe(nina.streamUrl)
    expect(audio.paused).toBe(true)

    // Décroché : pause de nouveau, l'élément toujours coupé. Pas la bascule du casque.
    press('pause')
    expect(player.state.status).toBe('paused')
    expect(audio.paused).toBe(true)

    // L'appel se termine.
    press('play')
    expect(player.state.status).toBe('loading')
    controls.detachElement()
  })

  it('should pause the element again when a call paused it on Android, which resumes it all the same', async () => {
    vi.useFakeTimers()
    const { controls, player, audio } = await lockedPhone(ANDROID)
    controls.play(nina)
    audio.fire('playing')

    audio.paused = true
    audio.fire('pause')
    expect(player.state.status).toBe('paused')
    expect(audio.pauses).toEqual([nina.streamUrl])
    controls.detachElement()
  })

  it('should pause the silence at once when on Android, where it would show as playing', async () => {
    const { controls, player, audio, press } = await lockedPhone(ANDROID)
    controls.play(nina)
    audio.fire('playing')

    press('pause')
    expect(audio.pauses).toEqual([nina.streamUrl])
    expect(audio.src.startsWith('blob:')).toBe(true)
    // Lancé, car Chrome ne garde dans sa session qu'un élément qui a joué (E6)…
    expect(audio.paused).toBe(false)
    audio.fire('playing')
    // …puis mis en pause.
    expect(audio.paused).toBe(true)
    expect(player.state.status).toBe('paused')
    controls.detachElement()
  })
})
