import { describe, expect, it } from 'vitest'
import { GIVE_UP_MS, MARKS, launchScript } from './launch.ts'

interface Setup {
  installed?: boolean
  standalone?: boolean
  stored?: string[]
  online?: boolean
  controlled?: boolean
  storage?: boolean
}

type Listener = (event: unknown) => void

/** Exécute le script de la page seul, avec une fausse fenêtre : ce que fait le navigateur. */
function run({
  installed = true,
  standalone = false,
  stored: marks = [],
  online = true,
  controlled = true,
  storage = true,
}: Setup = {}) {
  const dataset: Record<string, string> = {}
  const stored = new Map<string, string>(marks.map((mark) => [mark, '1']))
  const timers: { then: () => void; milliseconds: number }[] = []
  const listeners: Record<string, Listener[]> = {}
  let reloads = 0
  const refused = () => {
    throw new Error('refusé')
  }
  const sessionStorage = storage
    ? {
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) => stored.set(key, value),
        removeItem: (key: string) => stored.delete(key),
      }
    : { getItem: refused }
  const script = new Function(
    'document',
    'matchMedia',
    'navigator',
    'sessionStorage',
    'setTimeout',
    'addEventListener',
    'location',
    launchScript(),
  )
  script(
    { documentElement: { dataset } },
    () => ({ matches: installed }),
    { standalone, onLine: online, serviceWorker: controlled ? { controller: {} } : undefined },
    sessionStorage,
    (then: () => void, milliseconds: number) => timers.push({ then, milliseconds }),
    (type: string, listener: Listener) => (listeners[type] ??= []).push(listener),
    { reload: () => reloads++ },
  )
  const fire = (type: string, event: unknown) => listeners[type]?.forEach((listener) => listener(event))
  return { dataset, stored, timers, fire, reloads: () => reloads }
}

const SCRIPT_ERROR = { target: { tagName: 'SCRIPT', src: 'https://staging.nina.fm/_astro/Shell.abc.js' } }

describe('launch script', () => {
  it('should launch the installed app and hold it for the update check', () => {
    const { dataset, stored } = run()
    expect(dataset).toEqual({ launch: '', update: 'pending' })
    expect(stored.get(MARKS.launched)).toBe('1')
  })

  it('should launch the app installed on an iPhone, told by navigator.standalone', () => {
    expect(run({ installed: false, standalone: true }).dataset.launch).toBe('')
  })

  it('should not launch when the site is opened in a browser tab', () => {
    expect(run({ installed: false }).dataset).toEqual({})
  })

  it('should launch only once per tab', () => {
    expect(run({ stored: [MARKS.launched] }).dataset).toEqual({})
  })

  it('should not hold for a check when offline or without a service worker yet', () => {
    expect(run({ online: false }).dataset).toEqual({ launch: '' })
    expect(run({ controlled: false }).dataset).toEqual({ launch: '' })
  })

  it('should reload once under the launch screen when a script of the site fails to load', () => {
    const page = run()
    page.fire('error', SCRIPT_ERROR)
    expect(page.reloads()).toBe(1)
    expect(page.stored.has(MARKS.launched)).toBe(false)
    expect(page.stored.get(MARKS.retried)).toBe('1')
  })

  it('should reload once when an island fails to import its module', () => {
    const page = run()
    page.fire('unhandledrejection', { reason: new TypeError('Importing a module script failed.') })
    expect(page.reloads()).toBe(1)
  })

  it('should ignore failures of other resources and of other origins', () => {
    const page = run()
    page.fire('error', { target: { tagName: 'IMG', src: 'https://staging.nina.fm/_astro/mask.png' } })
    page.fire('error', { target: { tagName: 'SCRIPT', src: 'https://www.statcounter.com/counter/counter.js' } })
    page.fire('unhandledrejection', { reason: new Error('SSE fermé') })
    expect(page.reloads()).toBe(0)
  })

  it('should not reload once the shell has taken over, nothing playing or not', () => {
    const page = run()
    page.dataset.launch = 'mounted'
    page.fire('error', SCRIPT_ERROR)
    expect(page.reloads()).toBe(0)
  })

  it('should reload when the shell never takes over, then give the page back after the retry', () => {
    const first = run()
    expect(first.timers.map((timer) => timer.milliseconds)).toEqual([GIVE_UP_MS])
    first.timers[0]?.then()
    expect(first.reloads()).toBe(1)

    const retried = run({ stored: [MARKS.retried] })
    retried.fire('error', SCRIPT_ERROR)
    retried.timers[0]?.then()
    expect(retried.reloads()).toBe(0)
    expect(retried.dataset).toEqual({})
  })

  it('should leave a launch the shell took over to the shell', () => {
    const { dataset, timers } = run()
    dataset.launch = 'mounted'
    dataset.update = 'installing'
    timers[0]?.then()
    expect(dataset).toEqual({ launch: 'mounted', update: 'installing' })
  })

  it('should leave the page as it is when storage is refused', () => {
    expect(() => run({ storage: false })).not.toThrow()
    expect(run({ storage: false }).dataset).toEqual({})
  })
})
