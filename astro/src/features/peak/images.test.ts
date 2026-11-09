import { describe, expect, it } from 'vitest'
import { rewritten } from './images.ts'

describe('rewritten', () => {
  it('should write the same image the other way, so the browser asks for it again', () => {
    expect(rewritten('url(/_astro/background.abc.jpg)')).toBe('url("/_astro/background.abc.jpg")')
    expect(rewritten('url("/_astro/background.abc.jpg")')).toBe('url(/_astro/background.abc.jpg)')
  })

  it('should leave a value that is not an image untouched', () => {
    expect(rewritten('none')).toBe('none')
  })
})
