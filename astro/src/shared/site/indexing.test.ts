import { describe, expect, it } from 'vitest'
import { NOINDEX, isProduction, robotsMeta, robotsTxt } from './indexing.ts'

describe('indexing', () => {
  it('should be indexable when the build is production', () => {
    expect(isProduction('production')).toBe(true)
    expect(robotsMeta('production')).toBeNull()
    expect(robotsTxt('production')).toBe('User-agent: *\nAllow: /\n')
  })

  it.each([['staging'], [''], [undefined], ['Production'], [' production'], ['prod']])(
    'should close the site when the build env is %j',
    (env) => {
      expect(isProduction(env)).toBe(false)
      expect(robotsMeta(env)).toBe(NOINDEX)
      expect(robotsTxt(env)).toContain('Disallow: /')
      expect(robotsTxt(env)).not.toContain('Allow: /\n')
    },
  )
})
