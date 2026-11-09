import { afterEach, describe, expect, it, vi } from 'vitest'

const COVER = 'https://api.nina.example/files/images/covers/a1-mix.jpeg'
const THUMBNAIL = 'https://api.nina.example/files/images/covers/thumb/a1-mix.jpeg'

/** L'API : le poids de chaque image servie, `null` pour une image absente. */
async function api(sizes: Record<string, number | null>) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const size = sizes[url]
      if (size === undefined) return Promise.reject(new TypeError('Failed to fetch'))
      return Promise.resolve({ ok: size !== null, headers: new Headers({ 'content-length': String(size ?? 29) }) })
    }),
  )
  vi.resetModules()
  return import('./cover.client.ts')
}

describe('the cover shown on the lock screen', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('should show the thumbnail when the original is too heavy for the iPhone', async () => {
    // « Eternelle » : 785 ko, absente de l'écran verrouillé (website#92).
    const { coverFor, lightenCover } = await api({ [COVER]: 803_122, [THUMBNAIL]: 7_720 })
    expect(await lightenCover(COVER)).toBe(true)
    expect(coverFor(COVER)).toBe(THUMBNAIL)
  })

  it('should keep the original when it is light enough', async () => {
    const { coverFor, lightenCover } = await api({ [COVER]: 120_000, [THUMBNAIL]: 7_720 })
    expect(await lightenCover(COVER)).toBe(false)
    expect(coverFor(COVER)).toBe(COVER)
  })

  it('should keep the original when the thumbnail is missing', async () => {
    const { coverFor, lightenCover } = await api({ [COVER]: 803_122, [THUMBNAIL]: null })
    expect(await lightenCover(COVER)).toBe(false)
    expect(coverFor(COVER)).toBe(COVER)
  })

  it('should keep the original when the API cannot be reached', async () => {
    const { coverFor, lightenCover } = await api({})
    expect(await lightenCover(COVER)).toBe(false)
    expect(coverFor(COVER)).toBe(COVER)
  })

  it('should ask the API only once per cover', async () => {
    const { lightenCover } = await api({ [COVER]: 803_122, [THUMBNAIL]: 7_720 })
    await lightenCover(COVER)
    expect(await lightenCover(COVER)).toBe(false)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
