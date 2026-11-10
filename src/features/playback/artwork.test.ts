import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  COVER_ARTWORK_SIZES,
  DEFAULT_ARTWORK_FILENAME,
  DEFAULT_ARTWORK_SIZES,
  getArtwork,
  thumbnailOf,
} from './artwork.ts'

const ORIGIN = 'https://nina.fm'

/** Le logo Nina.fm, une entrée par taille réelle d'icône. */
const LOGO = DEFAULT_ARTWORK_SIZES.map((size) => ({
  src: `${ORIGIN}/maskable_icon_x${size}.png`,
  sizes: `${size}x${size}`,
  type: 'image/png',
}))

describe('getArtwork', () => {
  it('should return the Nina.fm logo in every real size when filepath is undefined', () => {
    expect(getArtwork(undefined, ORIGIN)).toEqual(LOGO)
  })

  it('should return the Nina.fm logo when filepath is empty or not a string', () => {
    expect(getArtwork('', ORIGIN)).toEqual(LOGO)
    expect(getArtwork(null, ORIGIN)).toEqual(LOGO)
  })

  it('should return the Nina.fm logo when given the default artwork of a radio', () => {
    expect(getArtwork(DEFAULT_ARTWORK_FILENAME, ORIGIN)).toEqual(LOGO)
  })

  it('should point only to icons that exist in public/', () => {
    for (const size of DEFAULT_ARTWORK_SIZES) expect(existsSync(`public/maskable_icon_x${size}.png`)).toBe(true)
  })

  it('should return multi-size artwork when cover URL is valid', () => {
    const coverUrl = 'https://api.nina.fm/covers/mix.jpg'
    const result = getArtwork(coverUrl, ORIGIN)
    expect(result).toHaveLength(COVER_ARTWORK_SIZES.length)
    result.forEach((entry) => expect(entry.src).toBe(coverUrl))
  })

  it('should have distinct sizes for all multi-size entries', () => {
    const result = getArtwork('https://api.nina.fm/covers/mix.jpg', ORIGIN)
    const sizes = result.map((e) => e.sizes)
    expect(new Set(sizes).size).toBe(sizes.length)
  })

  it('should infer image/jpeg mime type when extension is .jpg', () => {
    const result = getArtwork('https://api.nina.fm/covers/mix.jpg', ORIGIN)
    result.forEach((entry) => expect(entry.type).toBe('image/jpeg'))
  })

  it('should infer image/png mime type when extension is .png', () => {
    const result = getArtwork('https://api.nina.fm/covers/mix.png', ORIGIN)
    result.forEach((entry) => expect(entry.type).toBe('image/png'))
  })

  it('should fallback to image/png when extension is unknown', () => {
    const result = getArtwork('https://api.nina.fm/covers/mix', ORIGIN)
    result.forEach((entry) => expect(entry.type).toBe('image/png'))
  })

  it('should resolve a relative URL to an absolute URL using origin', () => {
    const result = getArtwork('/api/cover/covers/mix.jpg', ORIGIN)
    expect(result).toHaveLength(COVER_ARTWORK_SIZES.length)
    result.forEach((entry) => expect(entry.src).toBe('https://nina.fm/api/cover/covers/mix.jpg'))
  })
})

describe('getArtwork type', () => {
  it('should read the extension before the query string', () => {
    const result = getArtwork('https://api.nina.fm/covers/mix.webp?v=2', ORIGIN)
    result.forEach((entry) => expect(entry.type).toBe('image/webp'))
  })

  it('should read an upper-case extension', () => {
    const result = getArtwork('https://api.nina.fm/covers/MIX.JPEG', ORIGIN)
    result.forEach((entry) => expect(entry.type).toBe('image/jpeg'))
  })
})

describe('thumbnailOf', () => {
  it('should point to the thumbnail the API stores next to an image', () => {
    expect(thumbnailOf('https://api.nina.fm/files/images/covers/a1-mix.jpeg')).toBe(
      'https://api.nina.fm/files/images/covers/thumb/a1-mix.jpeg',
    )
  })

  it('should find nothing when the URL is not an API image, or already a thumbnail', () => {
    expect(thumbnailOf('https://nina.fm/maskable_icon_x512.png')).toBeNull()
    expect(thumbnailOf('https://api.nina.fm/files/images/covers/thumb/a1-mix.jpeg')).toBeNull()
  })
})
