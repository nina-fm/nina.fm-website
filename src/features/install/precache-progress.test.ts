import { describe, expect, it } from 'vitest'
import { manifestKeys, progressOf } from './precache-progress.ts'

const BASE = 'https://staging.nina.fm/'

/** Un `sw.js` de Workbox, raccourci à trois entrées. */
const SOURCE =
  'define(["./workbox-ee13fbdc"],function(s){"use strict";importScripts("sw-guard.js"),self.skipWaiting(),s.clientsClaim(),' +
  's.precacheAndRoute([{url:"manifest.webmanifest",revision:"9cef9caf"},{url:"index.html",revision:"b66fefea"},' +
  '{url:"_astro/web.BZANYGaj.js",revision:null}],{})});'

const KEYS = [
  `${BASE}manifest.webmanifest?__WB_REVISION__=9cef9caf`,
  `${BASE}index.html?__WB_REVISION__=b66fefea`,
  `${BASE}_astro/web.BZANYGaj.js`,
]

describe('manifestKeys', () => {
  it('should give the cache keys of the new version, with the revision Workbox adds', () => {
    expect(manifestKeys(SOURCE, BASE)).toEqual(KEYS)
  })

  it('should give nothing when the service worker cannot be read', () => {
    expect(manifestKeys('self.addEventListener("fetch", () => {})', BASE)).toBeNull()
    expect(manifestKeys('s.precacheAndRoute([],{})', BASE)).toBeNull()
  })
})

describe('progressOf', () => {
  it('should grow from 0 to 1 as the cache receives the new files', () => {
    expect(progressOf(KEYS, new Set())).toBe(0)
    expect(progressOf(KEYS, new Set([KEYS[2]!]))).toBeCloseTo(1 / 3)
    expect(progressOf(KEYS, new Set(KEYS))).toBe(1)
  })

  it('should not count the files of the version on screen, still in the cache', () => {
    const old = [`${BASE}index.html?__WB_REVISION__=0ld`, `${BASE}_astro/web.0ld.js`]
    expect(progressOf(KEYS, new Set([...old, KEYS[0]!]))).toBeCloseTo(1 / 3)
  })
})
