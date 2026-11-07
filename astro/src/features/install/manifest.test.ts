import { describe, expect, it } from 'vitest'
import { manifest } from './manifest.ts'

describe('manifest', () => {
  it('should keep the production name when the build is production', () => {
    expect(manifest('production').name).toBe('Nina.fm')
  })

  it('should mark the app as staging when the build is not production', () => {
    expect(manifest('staging').name).toBe('Nina.fm staging')
    expect(manifest(undefined).short_name).toBe('Nina.fm staging')
  })

  it('should declare every icon size for both purposes', () => {
    const icons = manifest('production').icons
    expect(icons).toHaveLength(14)
    expect(icons.filter((icon) => icon.purpose === 'maskable')).toHaveLength(7)
  })
})
