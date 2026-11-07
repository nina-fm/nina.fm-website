import { describe, expect, it } from 'vitest'
import { afterFailure, afterRefusal, retryDelay, systemPause } from './controls.ts'

describe('retryDelay', () => {
  it('doubles from a second, up to fifteen', () => {
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

  it('puts the silence under a pause the system imposed, for it to resume', () => {
    expect(afterFailure({ ...listening, status: 'paused', pauseImposed: true })).toBe('silence')
  })

  it('does nothing once the listening is over, the listener paused included', () => {
    expect(afterFailure({ ...listening, status: 'paused' })).toBeUndefined()
    expect(afterFailure({ ...listening, status: 'error' })).toBeUndefined()
    expect(afterFailure({ ...listening, status: 'stopped' })).toBeUndefined()
  })

  it('retries within the window, and gives up once it ran out', () => {
    expect(afterFailure({ ...listening, reconnection: 'under way' })).toBe('retry')
    expect(afterFailure({ ...listening, reconnection: 'expired' })).toBe('give up')
  })

  it('restores a listening that had started, or that the network cut off', () => {
    expect(afterFailure(listening)).toBe('reconnect')
    const firstLoad = { ...listening, status: 'loading', established: false } as const
    expect(afterFailure({ ...firstLoad, online: false })).toBe('reconnect')
  })

  it('reports at once a radio unreachable on its first load, online', () => {
    expect(afterFailure({ ...listening, status: 'loading', established: false })).toBe('report')
  })
})

describe('afterRefusal', () => {
  it('ignores a load superseded by another, or by a stop', () => {
    expect(afterRefusal('AbortError', true)).toBeUndefined()
  })

  it('tells an interrupted listening from a radio never heard', () => {
    expect(afterRefusal('NotAllowedError', true)).toBe('interrupted')
    expect(afterRefusal('NotAllowedError', false)).toBe('error')
  })

  it('counts any other refusal as a failure of the stream', () => {
    expect(afterRefusal('NotSupportedError', false)).toBe('failure')
    expect(afterRefusal('', true)).toBe('failure')
  })
})

describe('systemPause', () => {
  it('takes the pause sent on iOS once the element was cut for the system', () => {
    expect(systemPause({ ios: true, elementPaused: true, status: 'playing' })).toBe('imposed')
  })

  it('toggles otherwise, as a headset button does', () => {
    expect(systemPause({ ios: true, elementPaused: false, status: 'paused' })).toBe('resume')
    expect(systemPause({ ios: false, elementPaused: true, status: 'paused' })).toBe('resume')
    expect(systemPause({ ios: false, elementPaused: false, status: 'playing' })).toBe('pause')
  })
})
