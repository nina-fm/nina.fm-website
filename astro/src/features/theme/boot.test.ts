import { describe, expect, it } from 'vitest'
import { bootScript } from './boot.ts'

/** Exécute le script de la page seul, sans rien du module : ce que fait le navigateur. */
function run(cookies: string, { search = '', hour = 12 } = {}) {
  const body = { dataset: {} as Record<string, string>, className: 'theme-peak' }
  const RealDate = Date
  const FixedDate = class extends RealDate {
    override getHours(): number {
      return hour
    }
  }
  const script = new Function('document', 'location', 'Date', bootScript())
  script({ body, cookie: cookies }, { search }, FixedDate)
  return { theme: body.dataset.theme, classes: body.className }
}

describe('boot script', () => {
  it('should run on its own, without the module it comes from', () => {
    expect(run('')).toEqual({ theme: 'peak', classes: 'theme-peak' })
  })

  it('should put the night on before the first paint when it is forced or due', () => {
    expect(run('ninafm-user-darkMode=true').classes).toBe('theme-peak dark')
    expect(run('', { hour: 22 }).classes).toBe('theme-peak dark')
    expect(run('ninafm-user-darkMode=false', { hour: 22 }).classes).toBe('theme-peak')
  })

  it('should put the rainbow on when it is chosen', () => {
    expect(run('ninafm-user-rainbowMode=true').classes).toBe('theme-peak rainbow')
  })

  it('should serve the default theme when the chosen one is unknown or not served yet', () => {
    expect(run('', { search: '?theme=foo' }).theme).toBe('peak')
    expect(run('ninafm-user-theme=vinyl').theme).toBe('peak')
  })

  it('should leave the page as it is when something fails', () => {
    const script = new Function('document', 'location', 'Date', bootScript())
    expect(() => script({ body: null, cookie: '' }, { search: '' }, Date)).not.toThrow()
  })
})
