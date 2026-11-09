import { describe, expect, it } from 'vitest'
import { afterFailure, afterRefusal, retryDelay, systemPause } from './controls.ts'

describe('retryDelay', () => {
  it('should double from one second up to fifteen when attempts grow', () => {
    expect([0, 1, 2, 3, 4, 5].map(retryDelay)).toEqual([1_000, 2_000, 4_000, 8_000, 15_000, 15_000])
  })
})

describe('afterFailure', () => {
  const listening = {
    status: 'playing',
    pauseImposed: false,
    reconnection: 'none',
    established: true,
    online: true,
  } as const

  it('should play the silence when the system imposed the pause, for it to resume', () => {
    expect(afterFailure({ ...listening, status: 'paused', pauseImposed: true })).toBe('silence')
  })

  it('should do nothing when the listening is over, listener pause included', () => {
    expect(afterFailure({ ...listening, status: 'paused' })).toBeUndefined()
    expect(afterFailure({ ...listening, status: 'error' })).toBeUndefined()
    expect(afterFailure({ ...listening, status: 'stopped' })).toBeUndefined()
  })

  it('should retry within the window and give up when it ran out', () => {
    expect(afterFailure({ ...listening, reconnection: 'under way' })).toBe('retry')
    expect(afterFailure({ ...listening, reconnection: 'expired' })).toBe('give up')
  })

  it('should reconnect when the listening had started or the network cut it off', () => {
    expect(afterFailure(listening)).toBe('reconnect')
    const firstLoad = { ...listening, status: 'loading', established: false } as const
    expect(afterFailure({ ...firstLoad, online: false })).toBe('reconnect')
  })

  it('should report at once when the stream is unreachable on its first load, online', () => {
    expect(afterFailure({ ...listening, status: 'loading', established: false })).toBe('report')
  })
})

describe('afterRefusal', () => {
  it('should ignore the refusal when another load or a stop superseded it', () => {
    expect(afterRefusal('AbortError', true)).toBeUndefined()
  })

  it('should tell an interrupted listening from a stream never heard when autoplay is refused', () => {
    expect(afterRefusal('NotAllowedError', true)).toBe('interrupted')
    expect(afterRefusal('NotAllowedError', false)).toBe('error')
  })

  it('should count a failure of the stream when the refusal is of any other kind', () => {
    expect(afterRefusal('NotSupportedError', false)).toBe('failure')
    expect(afterRefusal('', true)).toBe('failure')
  })
})

describe('systemPause', () => {
  it('should take the pause as imposed when iOS sends it after cutting the element', () => {
    expect(systemPause({ ios: true, elementPaused: true, status: 'playing' })).toBe('imposed')
  })

  it('should toggle as a headset button does when the element was not cut', () => {
    expect(systemPause({ ios: true, elementPaused: false, status: 'paused' })).toBe('resume')
    expect(systemPause({ ios: false, elementPaused: true, status: 'paused' })).toBe('resume')
    expect(systemPause({ ios: false, elementPaused: false, status: 'playing' })).toBe('pause')
  })
})
