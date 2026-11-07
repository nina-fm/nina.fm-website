import { beforeEach, describe, expect, it } from 'vitest'
import { createPlayer } from './player.store.ts'
import { type Player, isListening } from './player.ts'
import { createMockRadio } from './radio.fixture.ts'

const nina = createMockRadio()

/** Une seconde radio, pour l'invariant « un seul flux à la fois » seulement. */
const other = createMockRadio({ id: 'other', name: 'Autre radio', streamUrl: 'https://flux.autre.example/live.mp3' })

describe('player state', () => {
  let player: Player

  beforeEach(() => {
    player = createPlayer()
  })

  it('should be stopped with no radio when created', () => {
    expect(player.state.status).toBe('stopped')
    expect(player.state.radio).toBeNull()
  })

  describe('lifecycle of a playback', () => {
    it('should go through loading when playback is requested, then playing', () => {
      player.request(nina)
      expect(player.state.status).toBe('loading')
      expect(player.state.radio).toEqual(nina)

      player.confirmPlaying()
      expect(player.state.status).toBe('playing')
    })

    it('should keep the radio when an error is reported', () => {
      player.request(nina)
      player.reportError()

      expect(player.state.status).toBe('error')
      // La radio reste connue : l'interface doit pouvoir nommer celle qui est
      // indisponible, plutôt que d'afficher une erreur anonyme.
      expect(player.state.radio).toEqual(nina)
    })

    it('should report offline apart from an error when the device has no connection', () => {
      player.request(nina)
      player.reportOffline()

      expect(player.state.status).toBe('offline')
      expect(player.state.radio).toEqual(nina)
    })

    it('should go back to loading when the stream re-buffers', () => {
      player.request(nina)
      player.confirmPlaying()
      player.reportLoading()

      expect(player.state.status).toBe('loading')
    })

    it('should return to the initial state when stopped', () => {
      player.request(nina)
      player.confirmPlaying()
      player.stop()

      expect(player.state.status).toBe('stopped')
      expect(player.state.radio).toBeNull()
    })
  })

  describe('pause', () => {
    it('should keep the radio when paused', () => {
      player.request(nina)
      player.confirmPlaying()
      player.pause()

      // L'écran verrouillé continue de la montrer, et peut la reprendre.
      expect(player.state.status).toBe('paused')
      expect(player.state.radio).toEqual(nina)
    })

    it('should ignore events when they lag behind a pause', () => {
      player.request(nina)
      player.pause()
      player.confirmPlaying()
      player.reportLoading()
      player.reportError()
      player.reportReconnecting()

      expect(player.state.status).toBe('paused')
    })

    it('should resume when a new request follows a pause', () => {
      player.request(nina)
      player.pause()
      player.request(nina)

      expect(player.state.status).toBe('loading')
    })

    it('should not pause when the player is stopped', () => {
      player.pause()

      expect(player.state.status).toBe('stopped')
    })

    it('should keep the message when the listening was already abandoned', () => {
      for (const report of ['reportError', 'reportOffline', 'reportInterrupted'] as const) {
        player.request(nina)
        player[report]()
        const status = player.state.status
        player.pause()

        expect(player.state.status).toBe(status)
      }
    })
  })

  describe('reconnection', () => {
    it('should report reconnecting apart from loading and error when the stream is restored', () => {
      player.request(nina)
      player.confirmPlaying()
      player.reportReconnecting()

      expect(player.state.status).toBe('reconnecting')
      expect(player.state.radio).toEqual(nina)
    })

    it('should stay reconnecting when an attempt buffers', () => {
      player.request(nina)
      player.confirmPlaying()
      player.reportReconnecting()
      player.reportLoading()

      // La tentative qui charge fait partie de la reconnexion : montrer un
      // premier chargement effacerait la distinction.
      expect(player.state.status).toBe('reconnecting')
    })

    it('should go back to playing when an attempt succeeds', () => {
      player.request(nina)
      player.reportReconnecting()
      player.confirmPlaying()

      expect(player.state.status).toBe('playing')
    })

    it('should report interrupted, keeping the radio, when only the listener can resume', () => {
      player.request(nina)
      player.reportReconnecting()
      player.reportInterrupted()

      expect(player.state.status).toBe('interrupted')
      expect(player.state.radio).toEqual(nina)
    })
  })

  describe('whether the radio has played', () => {
    it('should not count as played until the stream actually plays', () => {
      player.request(nina)
      player.reportReconnecting()
      expect(player.state.played).toBe(false)

      player.confirmPlaying()
      expect(player.state.played).toBe(true)
    })

    it('should still count as played when the same radio is resumed or relaunched', () => {
      player.request(nina)
      player.confirmPlaying()
      player.pause()
      player.request(nina)

      expect(player.state.played).toBe(true)
    })

    it('should no longer count as played when another radio is chosen or after a stop', () => {
      player.request(nina)
      player.confirmPlaying()
      player.request(other)
      expect(player.state.played).toBe(false)

      player.confirmPlaying()
      player.stop()
      player.request(other)
      expect(player.state.played).toBe(false)
    })
  })

  describe('only one stream at a time', () => {
    it('should replace the current radio when another is requested', () => {
      player.request(nina)
      player.confirmPlaying()
      expect(player.state.radio).toEqual(nina)

      player.request(other)

      // L'état ne porte qu'une radio : la première n'est plus jouable, donc plus
      // audible. L'unicité est structurelle, pas une convention.
      expect(player.state.radio).toEqual(other)
      expect(player.state.status).toBe('loading')
    })

    it('should go back to loading when the same radio is relaunched', () => {
      player.request(nina)
      player.confirmPlaying()
      player.request(nina)

      expect(player.state.status).toBe('loading')
    })

    it('should leave the error state when another radio is started', () => {
      player.request(nina)
      player.reportError()
      player.request(other)

      expect(player.state.status).toBe('loading')
      expect(player.state.radio).toEqual(other)
    })
  })

  describe('events lagging behind a stop', () => {
    it('should ignore a playback confirmation when it arrives after a stop', () => {
      player.request(nina)
      player.stop()
      player.confirmPlaying()

      expect(player.state.status).toBe('stopped')
      expect(player.state.radio).toBeNull()
    })

    it('should ignore an error when it arrives after a stop', () => {
      player.request(nina)
      player.stop()
      player.reportError()

      expect(player.state.status).toBe('stopped')
    })

    it('should ignore an offline report when it arrives after a stop', () => {
      player.request(nina)
      player.stop()
      player.reportOffline()

      expect(player.state.status).toBe('stopped')
    })

    it('should ignore a reconnection or an interruption when it arrives after a stop', () => {
      player.request(nina)
      player.stop()
      player.reportReconnecting()
      player.reportInterrupted()

      expect(player.state.status).toBe('stopped')
    })

    it('should ignore a loading report when it arrives after a stop', () => {
      player.request(nina)
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
      it(`should keep the ${status} message when the element reports anything afterwards`, () => {
        player.request(nina)
        fail(player)
        // Comme quand le système reprend un élément relâché : seul l'auditeur
        // sort d'une panne, en lançant une radio.
        player.reportLoading()
        player.confirmPlaying()
        player.reportReconnecting()

        expect(player.state.status).toBe(status)
        expect(player.state.radio).toEqual(nina)
      })
    }
  })

  it('should never be playing when freshly created', () => {
    // Exigence « pas de lecture automatique » : un lecteur neuf, y compris
    // reconstruit depuis un état gardé, ne joue jamais.
    expect(createPlayer().state.status).toBe('stopped')
  })

  it('should count as listening only when a listening is in progress', () => {
    expect(['loading', 'playing', 'reconnecting'].every((s) => isListening(s as never))).toBe(true)
    for (const status of ['stopped', 'paused', 'error', 'offline', 'interrupted'] as const) {
      expect(isListening(status), status).toBe(false)
    }
  })
})
