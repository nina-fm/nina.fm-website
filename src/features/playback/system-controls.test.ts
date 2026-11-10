import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlayingRadio } from './player.ts'
import { RECLAIM_AFTER_MS, systemMetadata } from './system-controls.ts'

const nina: PlayingRadio = {
  id: 'nina',
  name: 'Nina.fm',
  streamUrl: 'https://flux.example/nina.mp3',
  imageUrl: '/maskable_icon_x512.png',
}

const ORIGIN = 'https://www.nina.example'

/** Écouteurs par type d'événement, pour les doublures ci-dessous. */
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

describe('systemMetadata', () => {
  it('should show Nina.fm alone with the default artwork when nothing is on air', () => {
    expect(systemMetadata(nina, ORIGIN, null)).toEqual({
      title: 'Nina.fm',
      artist: 'Nina.fm',
      album: 'Nina.fm',
      artwork: [96, 128, 192, 384, 512].map((size) => ({
        src: `${ORIGIN}/maskable_icon_x${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
      })),
    })
  })

  it('should show the mixtape, its DJs and its cover in every size when one is on air', () => {
    const shown = systemMetadata(nina, ORIGIN, {
      title: 'Sous les tropiques',
      artist: 'Alice & Bob',
      cover: 'https://api.nina.example/covers/m1.jpg',
    })

    expect([shown.title, shown.artist, shown.album]).toEqual(['Sous les tropiques', 'Alice & Bob', 'Nina.fm'])
    expect(shown.artwork).toHaveLength(6)
    expect(shown.artwork?.every((image) => image.src === 'https://api.nina.example/covers/m1.jpg')).toBe(true)
  })

  it('should show the Nina.fm logo when a track alone is on air, without cover', () => {
    const shown = systemMetadata(nina, ORIGIN, { title: 'Ta Bom', artist: 'Chinese Man' })

    expect(shown.artwork?.map((image) => image.src)).toContain(`${ORIGIN}/maskable_icon_x512.png`)
    expect(shown.artwork?.every((image) => image.src.includes('/maskable_icon_x'))).toBe(true)
  })

  it('should fall back on Nina.fm as artist when the mixtape has no DJ', () => {
    expect(systemMetadata(nina, ORIGIN, { title: 'Interlude' }).artist).toBe('Nina.fm')
  })
})

describe('the system controls while listening', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  async function listening() {
    const handlers = new Map<string, (() => void) | null>()
    const writes = vi.fn()
    let metadata: { init: MediaMetadataInit } | null = null
    const mediaSession = {
      playbackState: 'none',
      setActionHandler: (action: string, handler: (() => void) | null) => handlers.set(action, handler),
    }
    Object.defineProperty(mediaSession, 'metadata', {
      get: () => metadata,
      set: (value: { init: MediaMetadataInit } | null) => {
        writes(value)
        metadata = value
      },
    })
    vi.stubGlobal('window', listenersOf())
    vi.stubGlobal('navigator', { onLine: true, userAgent: 'Desktop', maxTouchPoints: 0, mediaSession })
    vi.stubGlobal('location', { origin: ORIGIN })
    vi.stubGlobal(
      'MediaMetadata',
      class {
        constructor(readonly init: MediaMetadataInit) {}
      },
    )
    vi.resetModules()
    const controls = await import('./controls.client.ts')
    const client = await import('./system-controls.client.ts')
    const { player } = await import('./player.store.ts')
    const audio = {
      ...listenersOf(),
      paused: false,
      play: vi.fn(() => Promise.resolve()),
      pause: vi.fn(),
      load: () => undefined,
      getAttribute: () => 'https://flux.example/nina.mp3',
      removeAttribute: () => undefined,
      currentTime: 0,
    }
    controls.attachElement(audio as unknown as HTMLAudioElement)
    controls.play(nina)
    return { controls, client, player, audio, handlers, writes, shown: () => metadata?.init, mediaSession }
  }

  it('should rewrite the lock screen when the mixtape changes, and only then', async () => {
    const { controls, client, writes, shown } = await listening()
    writes.mockClear()

    client.showTrackOnSystem({ title: 'Sous les tropiques', artist: 'Alice & Bob' })
    expect(shown()?.title).toBe('Sous les tropiques')
    client.showTrackOnSystem({ title: 'Sous les tropiques', artist: 'Alice & Bob' })
    expect(writes).toHaveBeenCalledTimes(1)

    client.showTrackOnSystem(null)
    expect([shown()?.title, shown()?.artist]).toEqual(['Nina.fm', 'Nina.fm'])
    expect(writes).toHaveBeenCalledTimes(2)
    controls.detachElement()
  })

  it('should show the mixtape announced before the listening started when playback starts', async () => {
    const { controls, client, shown } = await listening()
    controls.stop()
    client.showTrackOnSystem({ title: 'Sous les tropiques' })
    expect(shown()).toBeUndefined()

    controls.play(nina)
    expect(shown()?.title).toBe('Sous les tropiques')
    controls.detachElement()
  })

  it('should really pause the audio when the lock screen pause is pressed', async () => {
    const { controls, player, audio, handlers, mediaSession } = await listening()
    audio.fire('playing')

    handlers.get('pause')!()
    expect(player.state.status).toBe('paused')
    expect(audio.pause).toHaveBeenCalled()
    expect(mediaSession.playbackState).toBe('paused')
    controls.detachElement()
  })

  it('should stop the listening when the lock screen stop is pressed', async () => {
    const { controls, player, handlers, mediaSession } = await listening()

    handlers.get('stop')!()
    expect(player.state.status).toBe('stopped')
    expect(mediaSession.playbackState).toBe('none')
    controls.detachElement()
  })

  it('should refuse seeking when buttons are handed, so a live stream offers no ±10 s', async () => {
    const { controls, handlers } = await listening()
    for (const action of ['seekbackward', 'seekforward', 'seekto']) {
      expect(handlers.has(action)).toBe(true)
      expect(handlers.get(action)).toBeNull()
    }
    controls.detachElement()
  })

  it('should show the thumbnail on the lock screen once the cover is found too heavy', async () => {
    const cover = 'https://api.nina.example/files/images/covers/a1-mix.jpeg'
    const thumbnail = 'https://api.nina.example/files/images/covers/thumb/a1-mix.jpeg'
    const size = (url: string) => (url === cover ? '803122' : '7720')
    vi.stubGlobal('fetch', (url: string) =>
      Promise.resolve({ ok: true, headers: new Headers({ 'content-length': size(url) }) }),
    )
    const { controls, client, shown } = await listening()

    client.showTrackOnSystem({ title: 'Eternelle', cover })
    expect(shown()?.artwork?.[0]?.src).toBe(cover)
    await vi.waitFor(() => expect(shown()?.artwork?.[0]?.src).toBe(thumbnail))
    controls.detachElement()
  })

  it('should hand the buttons again a moment after the sound starts, as the iPhone needs', async () => {
    const { controls, player, audio, handlers } = await listening()
    audio.fire('playing')
    // Déclarés au départ du son : l'écran verrouillé de l'iPhone les a ignorés.
    handlers.clear()

    vi.advanceTimersByTime(RECLAIM_AFTER_MS)
    handlers.get('stop')!()
    expect(player.state.status).toBe('stopped')
    controls.detachElement()
  })
})
