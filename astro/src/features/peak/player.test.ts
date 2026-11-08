import { describe, expect, it } from 'vitest'
import { listeningFlags } from '~/features/shell/listening.ts'
import { PLAYER_MESSAGES, equalizerTooltip, playerLines } from './player.ts'

const onAir = { artist: 'DJ A', title: 'Mixtape' }

describe('playerLines', () => {
  it('should ask for a click when autoplay is refused', () => {
    const lines = playerLines({ flags: listeningFlags('stopped', 'blocked'), mixtape: true, ...onAir })
    expect(lines).toEqual({ onAir: null, message: PLAYER_MESSAGES.locked, type: null, details: false })
  })

  it('should show what is on air with its type when the listening is started', () => {
    const lines = playerLines({ flags: listeningFlags('playing', 'allowed'), mixtape: true, ...onAir })
    expect(lines).toMatchObject({ onAir, type: PLAYER_MESSAGES.mixtape, details: true })
  })

  it('should wait for the information when nothing is known yet', () => {
    const lines = playerLines({ flags: listeningFlags('loading', 'allowed'), mixtape: false })
    expect(lines).toMatchObject({ onAir: null, message: PLAYER_MESSAGES.loading, type: PLAYER_MESSAGES.listening })
  })

  it('should offer the details of a mixtape only', () => {
    expect(playerLines({ flags: listeningFlags('playing', 'allowed'), mixtape: false, ...onAir }).details).toBe(false)
  })
})

describe('equalizerTooltip', () => {
  it('should offer to turn the sound back on only when it is muted', () => {
    expect(equalizerTooltip(true)).toMatch(/^Activer/)
    expect(equalizerTooltip(false)).toMatch(/^Désactiver/)
  })
})
