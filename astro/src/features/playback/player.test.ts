import { beforeEach, describe, expect, it } from 'vitest'
import { createPlayer } from './player.store.ts'
import { type Player, type PlayingRadio, isListening } from './player.ts'

const fip: PlayingRadio = {
  id: 'fip',
  name: 'FIP',
  streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
  imageUrl: '/_astro/fip.webp',
}

const panik: PlayingRadio = {
  id: 'radio-panik',
  name: 'Radio Panik',
  streamUrl: 'https://streaming.domainepublic.net/radiopanik.mp3',
  imageUrl: '/_astro/radio-panik.webp',
}

describe('player state', () => {
  let player: Player

  beforeEach(() => {
    player = createPlayer()
  })

  it('starts stopped, with no radio at all', () => {
    expect(player.state.status).toBe('stopped')
    expect(player.state.radio).toBeNull()
  })

  describe('lifecycle of a playback', () => {
    it('goes through loading before established playback', () => {
      player.request(fip)
      expect(player.state.status).toBe('loading')
      expect(player.state.radio).toEqual(fip)

      player.confirmPlaying()
      expect(player.state.status).toBe('playing')
    })

    it('reports an error without losing the radio concerned', () => {
      player.request(fip)
      player.reportError()

      expect(player.state.status).toBe('error')
      // The radio stays known: the interface must be able to name the one that
      // is unavailable, rather than showing an anonymous error.
      expect(player.state.radio).toEqual(fip)
    })

    it('reports being offline apart from an error, keeping the radio', () => {
      player.request(fip)
      player.reportOffline()

      expect(player.state.status).toBe('offline')
      expect(player.state.radio).toEqual(fip)
    })

    it('goes back to loading when the stream re-buffers', () => {
      player.request(fip)
      player.confirmPlaying()
      player.reportLoading()

      expect(player.state.status).toBe('loading')
    })

    it('returns to the initial state on stop', () => {
      player.request(fip)
      player.confirmPlaying()
      player.stop()

      expect(player.state.status).toBe('stopped')
      expect(player.state.radio).toBeNull()
    })
  })

  describe('pause', () => {
    it('pauses without forgetting the radio', () => {
      player.request(fip)
      player.confirmPlaying()
      player.pause()

      // The lock screen keeps showing it, and can resume it.
      expect(player.state.status).toBe('paused')
      expect(player.state.radio).toEqual(fip)
    })

    it('ignores events lagging behind a pause', () => {
      player.request(fip)
      player.pause()
      player.confirmPlaying()
      player.reportLoading()
      player.reportError()
      player.reportReconnecting()

      expect(player.state.status).toBe('paused')
    })

    it('resumes on a new request', () => {
      player.request(fip)
      player.pause()
      player.request(fip)

      expect(player.state.status).toBe('loading')
    })

    it('does not pause a stopped player', () => {
      player.pause()

      expect(player.state.status).toBe('stopped')
    })

    it('keeps the message of an abandoned listening', () => {
      for (const report of ['reportError', 'reportOffline', 'reportInterrupted'] as const) {
        player.request(fip)
        player[report]()
        const status = player.state.status
        player.pause()

        expect(player.state.status).toBe(status)
      }
    })
  })

  describe('reconnection', () => {
    it('reports a reconnection apart from loading and error, keeping the radio', () => {
      player.request(fip)
      player.confirmPlaying()
      player.reportReconnecting()

      expect(player.state.status).toBe('reconnecting')
      expect(player.state.radio).toEqual(fip)
    })

    it('stays reconnecting while an attempt buffers', () => {
      player.request(fip)
      player.confirmPlaying()
      player.reportReconnecting()
      player.reportLoading()

      // The attempt buffering is part of the reconnection: showing an initial
      // load would erase the distinction.
      expect(player.state.status).toBe('reconnecting')
    })

    it('goes back to playing once an attempt succeeds', () => {
      player.request(fip)
      player.reportReconnecting()
      player.confirmPlaying()

      expect(player.state.status).toBe('playing')
    })

    it('reports an interruption only the listener can undo, keeping the radio', () => {
      player.request(fip)
      player.reportReconnecting()
      player.reportInterrupted()

      expect(player.state.status).toBe('interrupted')
      expect(player.state.radio).toEqual(fip)
    })
  })

  describe('whether the radio has played', () => {
    it('has not until the stream actually plays', () => {
      player.request(fip)
      player.reportReconnecting()
      expect(player.state.played).toBe(false)

      player.confirmPlaying()
      expect(player.state.played).toBe(true)
    })

    it('still has when the same radio is resumed or relaunched', () => {
      player.request(fip)
      player.confirmPlaying()
      player.pause()
      player.request(fip)

      expect(player.state.played).toBe(true)
    })

    it('has not once another radio is chosen, or after a stop', () => {
      player.request(fip)
      player.confirmPlaying()
      player.request(panik)
      expect(player.state.played).toBe(false)

      player.confirmPlaying()
      player.stop()
      player.request(panik)
      expect(player.state.played).toBe(false)
    })
  })

  describe('only one stream at a time', () => {
    it('replaces the current radio when another is requested', () => {
      player.request(fip)
      player.confirmPlaying()
      expect(player.state.radio).toEqual(fip)

      player.request(panik)

      // There is only one radio in the state: the first is no longer playable,
      // hence no longer audible. Uniqueness is structural, not conventional.
      expect(player.state.radio).toEqual(panik)
      expect(player.state.status).toBe('loading')
    })

    it('goes back to loading even when the same radio is relaunched', () => {
      player.request(fip)
      player.confirmPlaying()
      player.request(fip)

      expect(player.state.status).toBe('loading')
    })

    it('leaves the error state as soon as another radio is started', () => {
      player.request(fip)
      player.reportError()
      player.request(panik)

      expect(player.state.status).toBe('loading')
      expect(player.state.radio).toEqual(panik)
    })
  })

  describe('events lagging behind a stop', () => {
    it('ignores a playback confirmation arriving after a stop', () => {
      player.request(fip)
      player.stop()
      player.confirmPlaying()

      expect(player.state.status).toBe('stopped')
      expect(player.state.radio).toBeNull()
    })

    it('ignores an error arriving after a stop', () => {
      player.request(fip)
      player.stop()
      player.reportError()

      expect(player.state.status).toBe('stopped')
    })

    it('ignores an offline report arriving after a stop', () => {
      player.request(fip)
      player.stop()
      player.reportOffline()

      expect(player.state.status).toBe('stopped')
    })

    it('ignores a reconnection or an interruption arriving after a stop', () => {
      player.request(fip)
      player.stop()
      player.reportReconnecting()
      player.reportInterrupted()

      expect(player.state.status).toBe('stopped')
    })

    it('ignores a loading report arriving after a stop', () => {
      player.request(fip)
      player.stop()
      player.reportLoading()

      expect(player.state.status).toBe('stopped')
    })
  })

  describe('events lagging behind a failure', () => {
    const failures = {
      error: (p: Player) => p.reportError(),
      offline: (p: Player) => p.reportOffline(),
      interrupted: (p: Player) => p.reportInterrupted(),
    }

    for (const [status, fail] of Object.entries(failures)) {
      it(`keeps the ${status} message whatever the element reports afterwards`, () => {
        player.request(fip)
        fail(player)
        // As when the system resumes a released element: only the listener
        // leaves a failure, by starting a radio.
        player.reportLoading()
        player.confirmPlaying()
        player.reportReconnecting()

        expect(player.state.status).toBe(status)
        expect(player.state.radio).toEqual(fip)
      })
    }
  })

  it('never starts on its own', () => {
    // "No automatic playback" requirement: a fresh player, including one
    // rebuilt from stored state, is never playing.
    expect(createPlayer().state.status).toBe('stopped')
  })

  it('counts only a listening in progress as listening', () => {
    expect(['loading', 'playing', 'reconnecting'].every((s) => isListening(s as never))).toBe(true)
    for (const status of ['stopped', 'paused', 'error', 'offline', 'interrupted'] as const) {
      expect(isListening(status), status).toBe(false)
    }
  })
})
