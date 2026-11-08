import { describe, expect, it } from 'vitest'
import { bootThemes, nextTheme, themeOf } from './themes.ts'

describe('themes', () => {
  it('should switch between Peak and Vinyl, both ways', () => {
    expect(nextTheme(themeOf('peak'))?.key).toBe('vinyl')
    expect(nextTheme(themeOf('vinyl'))?.key).toBe('peak')
  })

  it('should serve Peak when no theme is chosen', () => {
    expect(themeOf(null).key).toBe('peak')
  })

  it('should tell the boot script that only Peak has a night', () => {
    expect(bootThemes()).toEqual({ peak: true, vinyl: false })
  })
})
