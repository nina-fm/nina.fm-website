import { describe, expect, it } from 'vitest'
import { harmlessFor } from './reload.ts'

describe('harmlessFor', () => {
  it('should allow the reload when nothing is held', () => {
    for (const status of ['stopped', 'error', 'offline', 'interrupted'] as const) expect(harmlessFor(status)).toBe(true)
  })

  it('should forbid the reload when a listening is under way or paused', () => {
    for (const status of ['loading', 'playing', 'reconnecting', 'paused'] as const)
      expect(harmlessFor(status)).toBe(false)
  })
})
