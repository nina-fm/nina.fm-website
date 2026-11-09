import { DAY_END_HOUR, DAY_START_HOUR, isDayTime } from './daylight.ts'
import { COOKIES, type CookieNames, bodyClasses, isDarkActive, readCookie, readPreferences } from './preferences.ts'
import { DEFAULT_THEME, THEME_KEYS, bootThemes } from './themes.ts'

/**
 * Le thème posé avant le premier affichage : le site est statique, le `<body>` du
 * HTML ne connaît ni les cookies ni l'heure. Un script bloquant, premier enfant du
 * `<body>` (`BaseLayout.astro`), pose `data-theme` et les classes que l'îlot de la
 * coquille tiendra ensuite à jour. Sans lui, une préférence nuit ou Vinyl
 * afficherait Peak de jour le temps de l'hydratation.
 */

export interface BootInput {
  names: CookieNames
  /** Thèmes qu'une préférence peut nommer (`THEME_KEYS`). */
  known: readonly string[]
  /** Thèmes servis : ont-ils une version nuit. */
  served: Record<string, boolean>
  fallback: string
  dayStart: number
  dayEnd: number
}

export interface BootPage {
  body: HTMLElement
  cookies: string
  search: string
  hour: number
}

const HELPERS = { readCookie, readPreferences, isDarkActive, bodyClasses, isDayTime }

export type BootHelpers = typeof HELPERS

/**
 * Pose le thème servi et ses classes. Recopiée dans la page : ne lit que ses
 * paramètres, les fonctions lui sont passées.
 */
export function boot(input: BootInput, page: BootPage, helpers: BootHelpers): void {
  const preferences = helpers.readPreferences(page.cookies, page.search, input.names, input.known)
  const wanted = preferences.theme
  // `Object.hasOwn` manque à iOS 15.0 à 15.3.
  const served = wanted !== null && Object.prototype.hasOwnProperty.call(input.served, wanted)
  const theme = served ? wanted : input.fallback
  const night = !helpers.isDayTime(page.hour, input.dayStart, input.dayEnd)
  page.body.dataset.theme = theme
  page.body.className = helpers.bodyClasses({
    theme,
    dark: helpers.isDarkActive(preferences.darkMode, night, input.served[theme] === true),
    rainbow: preferences.rainbow,
    muted: false,
    loading: false,
    locked: false,
    playing: false,
    details: false,
    content: false,
  })
}

export const BOOT_INPUT: BootInput = {
  names: COOKIES,
  known: THEME_KEYS,
  served: bootThemes(),
  fallback: DEFAULT_THEME,
  dayStart: DAY_START_HOUR,
  dayEnd: DAY_END_HOUR,
}

/**
 * Le script de la page. Chaque fonction y est déclarée sous son nom au build, celui
 * que les autres appellent, même renommée par le bundler.
 */
export function bootScript(): string {
  const declarations = Object.values(HELPERS).map((helper) => `var ${helper.name} = ${String(helper)};`)
  const helpers = `{ ${Object.entries(HELPERS)
    .map(([key, helper]) => `${key}: ${helper.name}`)
    .join(', ')} }`
  const page = '{ body: document.body, cookies: document.cookie, search: location.search, hour: new Date().getHours() }'
  // Une erreur ici laisse la page au thème par défaut, jamais sans page.
  const call = `(${String(boot)})(${JSON.stringify(BOOT_INPUT)}, ${page}, ${helpers});`
  return `(function () {\ntry {\n${declarations.join('\n')}\n${call}\n} catch (_error) {}\n})()`
}
