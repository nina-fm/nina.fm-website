import { describe, expect, it } from 'vitest'
import { nextTabTitle } from './tab-title.ts'

const SITE = 'Nina.fm - H24 Musical - Ø Pub'

describe('nextTabTitle', () => {
  it('should alternate between the site and what is on air', () => {
    const onAir = nextTabTitle(SITE, SITE, 'Mixtape', 'DJ A & DJ B')
    expect(onAir).toBe('Mixtape - DJ A & DJ B')
    expect(nextTabTitle(onAir, SITE, 'Mixtape', 'DJ A & DJ B')).toBe(SITE)
  })

  it('should show the site alone when nothing is on air', () => {
    expect(nextTabTitle('Mixtape - DJ', SITE, '')).toBe(SITE)
    expect(nextTabTitle(SITE, SITE)).toBe(SITE)
  })
})
