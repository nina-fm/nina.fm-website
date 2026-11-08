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

  it('should serve the chosen theme, and the default one when it is unknown', () => {
    expect(run('ninafm-user-theme=vinyl')).toEqual({ theme: 'vinyl', classes: 'theme-vinyl' })
    expect(run('', { search: '?theme=vinyl' }).theme).toBe('vinyl')
    expect(run('', { search: '?theme=foo' }).theme).toBe('peak')
  })

  it('should never put the night on a theme that has none', () => {
    expect(run('ninafm-user-theme=vinyl; ninafm-user-darkMode=true', { hour: 22 }).classes).toBe('theme-vinyl')
  })

  it('should leave the page as it is when something fails', () => {
    const script = new Function('document', 'location', 'Date', bootScript())
    expect(() => script({ body: null, cookie: '' }, { search: '' }, Date)).not.toThrow()
  })
})
