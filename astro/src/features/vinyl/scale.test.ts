import { describe, expect, it } from 'vitest'
import { sceneScale } from './scale.ts'

describe('sceneScale', () => {
  it('should fit the canvas to the smaller side when the window is resized', () => {
    expect(sceneScale(1800, 900)).toBe(1)
    expect(sceneScale(390, 844)).toBeCloseTo(0.4333, 4)
    expect(sceneScale(1440, 450)).toBe(0.5)
  })
})
