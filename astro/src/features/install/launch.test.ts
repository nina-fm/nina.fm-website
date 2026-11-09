import { describe, expect, it } from 'vitest'
import { GIVE_UP_MS, LAUNCHED, launchScript } from './launch.ts'

interface Setup {
  installed?: boolean
  standalone?: boolean
  launched?: boolean
  online?: boolean
  controlled?: boolean
  storage?: boolean
}

/** Exécute le script de la page seul, avec une fausse fenêtre : ce que fait le navigateur. */
function run({
  installed = true,
  standalone = false,
  launched = false,
  online = true,
  controlled = true,
  storage = true,
}: Setup = {}) {
  const dataset: Record<string, string> = {}
  const stored = new Map<string, string>(launched ? [[LAUNCHED, '1']] : [])
  const timers: { then: () => void; milliseconds: number }[] = []
  const sessionStorage = storage
    ? {
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) => stored.set(key, value),
      }
    : {
        getItem: () => {
          throw new Error('refusé')
        },
      }
  const script = new Function('document', 'matchMedia', 'navigator', 'sessionStorage', 'setTimeout', launchScript())
  script(
    { documentElement: { dataset } },
    () => ({ matches: installed }),
    { standalone, onLine: online, serviceWorker: controlled ? { controller: {} } : undefined },
    sessionStorage,
    (then: () => void, milliseconds: number) => timers.push({ then, milliseconds }),
  )
  return { dataset, stored, timers }
}

describe('launch script', () => {
  it('should launch the installed app and hold it for the update check', () => {
    const { dataset, stored } = run()
    expect(dataset).toEqual({ launch: '', update: 'pending' })
    expect(stored.get(LAUNCHED)).toBe('1')
  })

  it('should launch the app installed on an iPhone, told by navigator.standalone', () => {
    expect(run({ installed: false, standalone: true }).dataset.launch).toBe('')
  })

  it('should not launch when the site is opened in a browser tab', () => {
    expect(run({ installed: false }).dataset).toEqual({})
  })

  it('should launch only once per tab', () => {
    expect(run({ launched: true }).dataset).toEqual({})
  })

  it('should not hold for a check when offline or without a service worker yet', () => {
    expect(run({ online: false }).dataset).toEqual({ launch: '' })
    expect(run({ controlled: false }).dataset).toEqual({ launch: '' })
  })

  it('should give the page back when the shell never takes over', () => {
    const { dataset, timers } = run()
    expect(timers.map((timer) => timer.milliseconds)).toEqual([GIVE_UP_MS])
    timers[0]?.then()
    expect(dataset).toEqual({})
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
