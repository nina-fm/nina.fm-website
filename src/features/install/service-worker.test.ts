import { readFile } from 'node:fs/promises'
import { describe, expect, it, vi } from 'vitest'
import { STREAM_GUARD, serviceWorkerOptions } from './service-worker.build.ts'

const SITE_ORIGIN = 'https://staging.nina.fm'

type FetchListener = (event: { request: { url: string }; stopImmediatePropagation(): void }) => void

/** Exécute la garde comme le ferait le service worker, et rend son écouteur fetch. */
async function loadGuard(): Promise<FetchListener> {
  const source = await readFile(new URL(`../../../public/${STREAM_GUARD}`, import.meta.url), 'utf8')
  let listener: FetchListener | undefined
  const fakeSelf = {
    location: { origin: SITE_ORIGIN },
    addEventListener: (type: string, fn: FetchListener) => {
      if (type === 'fetch') listener = fn
    },
  }
  new Function('self', source)(fakeSelf)
  if (!listener) throw new Error("la garde n'enregistre aucun écouteur fetch")
  return listener
}

async function guardBypasses(url: string): Promise<boolean> {
  const listener = await loadGuard()
  const stop = vi.fn()
  listener({ request: { url }, stopImmediatePropagation: stop })
  return stop.mock.calls.length > 0
}

describe('service worker', () => {
  const options = serviceWorkerOptions('dist')

  it('should load the stream guard before any Workbox route', () => {
    expect(options.importScripts).toContain(STREAM_GUARD)
  })

  it('should let the audio stream and the API bypass the service worker', async () => {
    expect(await guardBypasses('https://flux.nina.fm/nina.mp3')).toBe(true)
    expect(await guardBypasses('https://api.nina.fm/stream/metadata')).toBe(true)
  })

  it('should let the site own files reach the precache', async () => {
    expect(await guardBypasses(`${SITE_ORIGIN}/`)).toBe(false)
    expect(await guardBypasses(`${SITE_ORIGIN}/_astro/index.js`)).toBe(false)
  })

  it('should cache nothing at runtime', () => {
    expect(options.runtimeCaching).toEqual([])
  })
})
