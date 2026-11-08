import { createSignal } from 'solid-js'
import { cycleDarkMode } from './cycling.ts'
import { daylight } from './daylight.store.ts'
import { COOKIES, type Preferences, cookieValue, isDarkActive, readCookie, readPreferences } from './preferences.ts'
import { THEME_KEYS, type Theme, nextTheme, themeOf } from './themes.ts'

/**
 * Les préférences de l'auditeur, lues dans ses cookies au montage de la coquille et
 * réécrites à chaque changement, comme le `useCookie` de la prod : cookie de session,
 * sur tout le site. Avant le montage, les défauts de la prod : seul le script de
 * démarrage (`boot.ts`) habille la page d'ici là.
 */

const [stored, setStored] = createSignal<Preferences>({ theme: null, darkMode: 'auto', rainbow: false })

const theme = (): Theme => themeOf(stored().theme)

export const preferences = {
  theme,
  darkMode: () => stored().darkMode,
  rainbow: () => stored().rainbow,
  /** La scène est de nuit, pour un thème qui en a une. */
  dark: () => isDarkActive(stored().darkMode, daylight.night(), !!theme().options.darkMode),
  next: () => nextTheme(theme()),
}

function write(name: string, value: string | boolean): void {
  document.cookie = `${name}=${cookieValue(value)}; path=/`
}

/**
 * Lit les cookies. Un `?theme=` valide s'y écrit, comme dans la prod : le thème
 * demandé par un lien reste celui de l'auditeur.
 */
export function loadPreferences(): void {
  const read = readPreferences(document.cookie, location.search, COOKIES, THEME_KEYS)
  if (read.theme !== null && read.theme !== readCookie(document.cookie, COOKIES.theme)) write(COOKIES.theme, read.theme)
  setStored(read)
}

export function toggleDarkMode(): void {
  const darkMode = cycleDarkMode(stored().darkMode)
  write(COOKIES.darkMode, darkMode)
  setStored({ ...stored(), darkMode })
}

export function toggleRainbow(): void {
  const rainbow = !stored().rainbow
  write(COOKIES.rainbow, rainbow)
  setStored({ ...stored(), rainbow })
}

/**
 * Passe au thème suivant. Chaque thème a sa page, rendue au build : on la recharge
 * sous le nouveau thème plutôt que d'embarquer les deux scènes.
 */
export function toggleTheme(): void {
  const next = preferences.next()
  if (!next) return
  write(COOKIES.theme, next.key)
  location.reload()
}
