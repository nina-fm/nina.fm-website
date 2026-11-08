import { describe, expect, it } from 'vitest'
import { RECONNECTING, noticeFor } from './notices.ts'

const free = { locked: false, recovering: false }
const recovering = { locked: false, recovering: true }

describe('noticeFor', () => {
  it('should say it reconnects when the stream is cut', () => {
    const change = noticeFor('playing', 'reconnecting', free)
    expect(change).toEqual({ show: expect.objectContaining({ id: RECONNECTING, kind: 'loading', duration: null }) })
    expect(change && 'show' in change && change.show.message).toBe('Reconnexion en cours...')
  })

  it('should say it waits for the network when the device goes offline, then when it comes back', () => {
    const lost = noticeFor('playing', 'offline', free)
    expect(lost && 'show' in lost && lost.show.message).toBe('Connexion perdue. En attente du réseau...')
    const back = noticeFor('offline', 'reconnecting', recovering)
    expect(back && 'show' in back && back.show.message).toBe('Réseau rétabli. Reconnexion...')
  })

  it('should say the stream is back only when it was cut', () => {
    expect(noticeFor('reconnecting', 'playing', recovering)).toEqual({
      show: expect.objectContaining({ kind: 'success', duration: 3_000 }),
    })
    expect(noticeFor('loading', 'playing', free)).toBeNull()
  })

  it('should offer to retry when the reconnection fails', () => {
    expect(noticeFor('reconnecting', 'error', recovering)).toEqual({
      show: expect.objectContaining({ kind: 'error', retry: true, duration: 10_000 }),
    })
    expect(noticeFor('reconnecting', 'interrupted', recovering)).toEqual({
      show: expect.objectContaining({ kind: 'error' }),
    })
  })

  it('should take the toast away when the listener stops or pauses during a reconnection', () => {
    expect(noticeFor('reconnecting', 'stopped', recovering)).toEqual({ dismiss: RECONNECTING })
    expect(noticeFor('reconnecting', 'paused', recovering)).toEqual({ dismiss: RECONNECTING })
  })

  it('should stay silent when autoplay is refused', () => {
    expect(noticeFor('playing', 'offline', { locked: true, recovering: false })).toBeNull()
  })

  it('should stay silent when a first load fails, the overlay offering the relaunch', () => {
    expect(noticeFor('loading', 'error', free)).toBeNull()
  })
})
