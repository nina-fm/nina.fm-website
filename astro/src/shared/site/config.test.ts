import { describe, expect, it } from 'vitest'
import { missingConfig, readConfig, sseUrls } from './config.ts'

const COMPLETE = {
  PUBLIC_SITE_ENV: 'staging',
  PUBLIC_AUDIO_STREAM_URL: 'https://flux.nina.fm/nina.mp3',
  PUBLIC_API_URL: 'https://api.nina.fm',
  PUBLIC_API_STREAM_ENDPOINT: '/stream',
}

describe('missingConfig', () => {
  it('should require nothing when the build is local', () => {
    expect(missingConfig({})).toEqual([])
  })

  it('should name every missing variable when the build is deployed', () => {
    expect(missingConfig({ PUBLIC_SITE_ENV: 'production', PUBLIC_API_URL: 'https://api.nina.fm' })).toEqual([
      'PUBLIC_AUDIO_STREAM_URL',
      'PUBLIC_API_STREAM_ENDPOINT',
    ])
  })

  it('should treat an empty variable as missing', () => {
    expect(missingConfig({ ...COMPLETE, PUBLIC_API_URL: '' })).toEqual(['PUBLIC_API_URL'])
  })

  it('should accept a complete deployed build', () => {
    expect(missingConfig(COMPLETE)).toEqual([])
  })
})

describe('sseUrls', () => {
  it('should build both SSE endpoints when the API is configured', () => {
    expect(sseUrls(readConfig(COMPLETE))).toEqual({
      metadata: 'https://api.nina.fm/stream/metadata',
      activity: 'https://api.nina.fm/stream/activity',
    })
  })

  it('should return null when the API is not configured', () => {
    expect(sseUrls(readConfig({ PUBLIC_API_URL: 'https://api.nina.fm' }))).toBeNull()
  })
})
