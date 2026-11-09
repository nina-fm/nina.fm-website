import { describe, expect, it } from 'vitest'
import { nextStars, randomStar } from './stars.ts'

/** Un hasard rejoué : chaque appel rend la valeur suivante de la liste. */
const sequence = (...values: number[]) => {
  let index = 0
  return () => values[index++ % values.length] ?? 0
}

describe('randomStar', () => {
  it('should stay within the sizes and the top of the sky of the prod', () => {
    for (const value of [0, 0.5, 0.999]) {
      const star = randomStar(0, () => value)
      expect(star.size).toBeGreaterThanOrEqual(3)
      expect(star.size).toBeLessThanOrEqual(6)
      expect(star.left).toBeGreaterThanOrEqual(5)
      expect(star.left).toBeLessThanOrEqual(95)
      expect(star.top).toBeGreaterThanOrEqual(5)
      expect(star.top).toBeLessThanOrEqual(35)
    }
  })

  it('should make bigger stars brighter', () => {
    expect(randomStar(0, () => 0).opacity).toBe(0.625)
    expect(randomStar(0, () => 0.999).opacity).toBe(1)
  })
})

describe('nextStars', () => {
  it('should keep the stars already in the sky when the count changes', () => {
    const first = nextStars([], 2, sequence(0.1, 0.2, 0.3))
    const more = nextStars(first, 3, sequence(0.9))
    expect(more.slice(0, 2)).toEqual(first)
    expect(more[2]?.id).toBe(2)

    expect(nextStars(more, 1, sequence(0.5))).toEqual([first[0]])
  })

  it('should give new stars ids unique among the stars in the sky', () => {
    const shrunk = nextStars(nextStars([], 3, sequence(0.5)), 1, sequence(0.5))
    expect(nextStars(shrunk, 2, sequence(0.5)).map((star) => star.id)).toEqual([0, 1])
  })
})
