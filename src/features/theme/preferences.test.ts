import { describe, expect, it } from 'vitest'
import { COOKIES, bodyClasses, cookieValue, isDarkActive, readCookie, readPreferences } from './preferences.ts'
import { THEME_KEYS } from './themes.ts'

const read = (cookies: string, search = '') => readPreferences(cookies, search, COOKIES, THEME_KEYS)

/** Les cookies tels que la prod les pose (relevé du 2026-11-08). */
const PROD = 'ninafm-user-theme=peak; ninafm-user-darkMode=auto; ninafm-user-rainbowMode=false'

describe('readCookie', () => {
  it('should read a string as is and anything else as JSON, like useCookie', () => {
    expect(readCookie(PROD, 'ninafm-user-theme')).toBe('peak')
    expect(readCookie('a=true', 'a')).toBe(true)
    expect(readCookie('a=false', 'a')).toBe(false)
    expect(readCookie('a=%22auto%22', 'a')).toBe('auto')
  })

  it('should return null when the cookie is missing or unreadable', () => {
    expect(readCookie(PROD, 'absent')).toBeNull()
    expect(readCookie('a=%E0%A4%A', 'a')).toBeNull()
  })

  it('should match the whole name only', () => {
    expect(readCookie('xa=1; a=2', 'a')).toBe(2)
  })
})

describe('cookieValue', () => {
  it('should write what readCookie reads back, in the useCookie format', () => {
    expect(cookieValue('vinyl')).toBe('vinyl')
    expect(cookieValue(true)).toBe('true')
    for (const value of ['auto', true, false, 'peak']) {
      expect(readCookie(`a=${cookieValue(value)}`, 'a')).toBe(value)
    }
  })
})

describe('readPreferences', () => {
  it('should read the cookies of an existing browser as they are', () => {
    expect(read(PROD)).toEqual({ theme: 'peak', darkMode: 'auto', rainbow: false })
    expect(read('ninafm-user-theme=vinyl; ninafm-user-darkMode=true; ninafm-user-rainbowMode=true')).toEqual({
      theme: 'vinyl',
      darkMode: true,
      rainbow: true,
    })
  })

  it('should fall back to the defaults of the prod when there is no cookie', () => {
    expect(read('')).toEqual({ theme: null, darkMode: 'auto', rainbow: false })
  })

  it('should let ?theme= override the cookie when it names a known theme', () => {
    expect(read(PROD, '?theme=vinyl').theme).toBe('vinyl')
  })

  it('should ignore an unknown theme, as a parameter or a cookie', () => {
    expect(read(PROD, '?theme=foo').theme).toBe('peak')
    expect(read('ninafm-user-theme=foo').theme).toBeNull()
  })

  it('should fall back to auto when the dark mode cookie is unreadable', () => {
    expect(read('ninafm-user-darkMode=nuit').darkMode).toBe('auto')
  })
})

describe('isDarkActive', () => {
  it('should follow the hour in auto, and be forced otherwise', () => {
    expect(isDarkActive('auto', true, true)).toBe(true)
    expect(isDarkActive('auto', false, true)).toBe(false)
    expect(isDarkActive(true, false, true)).toBe(true)
    expect(isDarkActive(false, true, true)).toBe(false)
  })

  it('should never be dark when the theme has no night', () => {
    expect(isDarkActive(true, true, false)).toBe(false)
  })
})

describe('bodyClasses', () => {
  const idle = {
    theme: 'peak',
    dark: false,
    rainbow: false,
    muted: false,
    loading: false,
    locked: false,
    playing: false,
    details: false,
    content: false,
  }

  it('should always name the theme', () => {
    expect(bodyClasses(idle)).toBe('theme-peak')
  })

  it('should list the other classes in the order of the prod when they apply', () => {
    const all = { ...idle, dark: true, rainbow: true, muted: true, loading: true, locked: true, playing: true }
    expect(bodyClasses({ ...all, details: true, content: true })).toBe(
      'theme-peak dark rainbow muted loading locked playing details content',
    )
  })
})
