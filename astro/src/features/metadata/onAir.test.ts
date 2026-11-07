import { describe, expect, it } from 'vitest'
import { NOTHING_ON_AIR, audienceCount, onAirFrom, systemTrackOf } from './onAir.ts'
import type { MixtapeMetadataDto } from './types.ts'

function createMockMixtape(overrides: Partial<MixtapeMetadataDto> = {}): MixtapeMetadataDto {
  return {
    id: 'm1',
    name: 'Sous les tropiques',
    slug: 'sous-les-tropiques',
    year: 2024,
    coverUrl: 'https://api.nina.fm/covers/m1.jpg',
    tracks: [],
    djs: ['Alice', 'Bob'],
    tags: [],
    comment: null,
    ...overrides,
  }
}

describe('onAirFrom', () => {
  it('should read a mixtape when the message announces one', () => {
    const onAir = onAirFrom({ type: 'mixtape', mixtape: createMockMixtape() })

    expect(onAir.type).toBe('mixtape')
    expect(onAir.metadata).toMatchObject({ id: 'm1', name: 'Sous les tropiques', authors_text: 'Alice & Bob' })
  })

  it('should read a lone track as artist and title', () => {
    const onAir = onAirFrom({ type: 'track', track: { artist: 'Nina Simone', title: 'Sinnerman' } })

    expect(onAir).toEqual({ type: 'track', metadata: { id: '', authors_text: 'Nina Simone', name: 'Sinnerman' } })
  })

  it('should read nothing when the announced content is missing', () => {
    expect(onAirFrom({ type: 'mixtape', mixtape: null })).toEqual(NOTHING_ON_AIR)
    expect(onAirFrom({ type: null })).toEqual(NOTHING_ON_AIR)
  })
})

describe('systemTrackOf', () => {
  it('should show the name, the DJs and the cover of a mixtape', () => {
    const { metadata } = onAirFrom({ type: 'mixtape', mixtape: createMockMixtape() })

    expect(systemTrackOf(metadata)).toEqual({
      title: 'Sous les tropiques',
      artist: 'Alice & Bob',
      cover: 'https://api.nina.fm/covers/m1.jpg',
    })
  })

  it('should leave out what is unknown when the mixtape has no cover nor DJ', () => {
    const { metadata } = onAirFrom({ type: 'mixtape', mixtape: createMockMixtape({ coverUrl: null, djs: [] }) })

    expect(systemTrackOf(metadata)).toEqual({ title: 'Sous les tropiques' })
  })

  it('should return null when nothing is on air', () => {
    expect(systemTrackOf(null)).toBeNull()
  })
})

describe('audienceCount', () => {
  it('should leave out the current listener', () => {
    expect(audienceCount(5)).toBe(4)
  })

  it('should never go below zero when the API counts nobody', () => {
    expect(audienceCount(1)).toBe(0)
    expect(audienceCount(0)).toBe(0)
    expect(audienceCount(-3)).toBe(0)
  })
})
