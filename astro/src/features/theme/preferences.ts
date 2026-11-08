/**
 * Les préférences de l'auditeur, dans les cookies de la prod Nuxt (`app/stores/theme.ts`) :
 * mêmes noms, même format, pour qu'un navigateur les garde à la bascule (website#80).
 *
 * `readCookie`, `readPreferences`, `isDarkActive` et `bodyClasses` sont aussi recopiés
 * tels quels dans le script qui pose le thème avant le premier affichage (`HELPERS` de
 * `boot.ts`) : ils ne lisent rien hors de leurs paramètres et des autres fonctions
 * recopiées. `boot.test.ts` le vérifie en exécutant le script seul.
 */

export const COOKIES = {
  theme: 'ninafm-user-theme',
  darkMode: 'ninafm-user-darkMode',
  rainbow: 'ninafm-user-rainbowMode',
} as const

export type CookieNames = typeof COOKIES

/** Nuit forcée (`true`), jour forcé (`false`), ou selon l'heure. */
export type DarkMode = boolean | 'auto'

export interface Preferences {
  /** Thème choisi, s'il est connu ; servi ou non (`themes.ts`). */
  theme: string | null
  darkMode: DarkMode
  rainbow: boolean
}

/**
 * Valeur d'un cookie comme `useCookie` (Nuxt) l'écrit : une chaîne telle quelle, tout
 * autre valeur en JSON, encodée pour l'URL. `null` s'il manque ou ne se lit pas.
 */
export function readCookie(cookies: string, name: string): unknown {
  for (const part of cookies.split(';')) {
    const index = part.indexOf('=')
    if (index < 0 || part.slice(0, index).trim() !== name) continue
    let raw: string
    try {
      raw = decodeURIComponent(part.slice(index + 1).trim())
    } catch {
      return null
    }
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
  return null
}

/** Le format de `useCookie` à l'écriture : une chaîne telle quelle, le reste en JSON. */
export function cookieValue(value: string | boolean): string {
  return encodeURIComponent(typeof value === 'string' ? value : JSON.stringify(value))
}

/**
 * Les préférences des cookies, `?theme=` l'emportant sur le cookie. Un thème inconnu,
 * en paramètre ou en cookie, ne compte pas (`?theme=foo` cassait la prod) ; une valeur
 * illisible vaut le défaut de la prod.
 */
export function readPreferences(
  cookies: string,
  search: string,
  names: CookieNames,
  known: readonly string[],
): Preferences {
  const valid = (value: unknown) => (typeof value === 'string' && known.includes(value) ? value : null)
  const darkMode = readCookie(cookies, names.darkMode)
  return {
    theme: valid(new URLSearchParams(search).get('theme')) ?? valid(readCookie(cookies, names.theme)),
    darkMode: darkMode === true || darkMode === false ? darkMode : 'auto',
    rainbow: readCookie(cookies, names.rainbow) === true,
  }
}

/**
 * La scène est-elle de nuit : forcée, ou la nuit en `auto`. Jamais pour un thème
 * sans version nuit.
 */
export function isDarkActive(darkMode: DarkMode, night: boolean, themeHasNight: boolean): boolean {
  return themeHasNight && ((night && darkMode !== false) || darkMode === true)
}

export interface BodyState {
  theme: string
  dark: boolean
  rainbow: boolean
  muted: boolean
  loading: boolean
  locked: boolean
  playing: boolean
  details: boolean
  content: boolean
}

/**
 * Les classes du `<body>`, dans l'ordre de la prod (`app/stores/app.ts`) : le thème
 * toujours, chaque autre seulement quand elle vaut.
 */
export function bodyClasses(state: BodyState): string {
  const flags = ['dark', 'rainbow', 'muted', 'loading', 'locked', 'playing', 'details', 'content'] as const
  return [`theme-${state.theme}`, ...flags.filter((flag) => state[flag])].join(' ')
}
