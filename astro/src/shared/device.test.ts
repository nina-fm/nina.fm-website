import { describe, expect, it } from 'vitest'
import { isIos } from './device.ts'

describe('isIos', () => {
  it('knows an iPhone, and an iPad presenting itself as a Mac', () => {
    expect(isIos('Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X)', 5)).toBe(true)
    expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe(true)
  })

  it('leaves out a Mac and an Android', () => {
    expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0)).toBe(false)
    expect(isIos('Mozilla/5.0 (Linux; Android 15)', 5)).toBe(false)
  })
})
