import { afterEach, describe, expect, it, vi } from 'vitest'

/** Une vidéo dont `play()` répond `outcome`, et le compte des essais. */
function stubBrowser(outcome: 'allowed' | 'refused') {
  const probes = { count: 0 }
  vi.stubGlobal('window', {})
  vi.stubGlobal('document', {
    createElement: () => {
      probes.count += 1
      return {
        play: () => (outcome === 'allowed' ? Promise.resolve() : Promise.reject(new Error('NotAllowedError'))),
        pause: () => undefined,
        remove: () => undefined,
      }
    },
  })
  return probes
}

async function freshModule() {
  vi.resetModules()
  return import('./detectAutoplay.client.ts')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('detectAutoplay', () => {
  it('should detect once when called twice and autoplay is allowed', async () => {
    const probes = stubBrowser('allowed')
    const { detectAutoplay } = await freshModule()

    expect(await detectAutoplay()).toBe(true)
    expect(await detectAutoplay()).toBe(true)
    expect(probes.count).toBe(1)
  })

  it('should detect once when called twice and autoplay is refused', async () => {
    const probes = stubBrowser('refused')
    const { detectAutoplay } = await freshModule()

    expect(await detectAutoplay()).toBe(false)
    expect(await detectAutoplay()).toBe(false)
    expect(probes.count).toBe(1)
  })
})
