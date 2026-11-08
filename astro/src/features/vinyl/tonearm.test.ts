import { describe, expect, it } from 'vitest'
import { ARM_RETURN_MS, ARM_STEP_MS, armAngle, armTransition } from './tonearm.ts'

describe('armAngle', () => {
  it('should go from the edge of the disk to the sticker with the progress', () => {
    expect(armAngle(0)).toBe(0)
    expect(armAngle(50)).toBe(12.5)
    expect(armAngle(100)).toBe(25)
  })
})

describe('armTransition', () => {
  it('should glide over one activity step when the progress goes on', () => {
    expect(armTransition(10, 11)).toBe(ARM_STEP_MS)
    expect(armTransition(10, 10)).toBe(ARM_STEP_MS)
  })

  it('should come back faster when a new mixtape starts', () => {
    expect(armTransition(98, 0)).toBe(ARM_RETURN_MS)
  })
})
