import { getNextInCycle } from './cycling.ts'
import { psychedelicColors } from './rainbowColors.ts'

/**
 * Les thèmes du site, repris de `app/themes/*\/index.ts` (Nuxt). Un thème habille
 * la coquille commune : sa scène, ses tokens, et les options qui disent quels
 * contrôles la coquille lui montre.
 */

/** Tous les thèmes qu'un cookie de la prod peut nommer, portés ou non. */
export const THEME_KEYS = ['peak', 'vinyl'] as const
export type ThemeKey = (typeof THEME_KEYS)[number]

export interface RainbowOptions {
  /** Mode de fusion du calque arc-en-ciel avec la scène. */
  class: string
  colors: readonly string[]
  /** Durée de chaque couleur, en millisecondes. */
  duration: number
}

export interface ThemeOptions {
  /** Le thème a une version nuit, et la coquille son bouton jour/nuit. */
  darkMode?: boolean
  rainbow?: RainbowOptions
}

export interface Theme {
  key: ThemeKey
  name: string
  options: ThemeOptions
}

export const DEFAULT_THEME: ThemeKey = 'peak'

const peak: Theme = {
  key: 'peak',
  name: 'Peak',
  options: {
    darkMode: true,
    rainbow: { class: 'mix-blend-difference', colors: psychedelicColors, duration: 10_000 },
  },
}

/**
 * Les thèmes servis, dans l'ordre du bouton de changement. Vinyl s'ajoute avec
 * website#79 : d'ici là, un navigateur qui l'a choisi voit Peak, et son cookie
 * reste tel quel.
 */
export const THEMES: readonly Theme[] = [peak]

/** Le thème servi pour une préférence, le thème par défaut si elle n'en nomme aucun. */
export function themeOf(key: string | null): Theme {
  return THEMES.find((theme) => theme.key === key) ?? peak
}

/** Le thème suivant pour le bouton de changement, `undefined` s'il n'y en a qu'un. */
export function nextTheme(current: Theme): Theme | undefined {
  return THEMES.length < 2 ? undefined : getNextInCycle([...THEMES], current)
}

/** Ce que le script de démarrage sait de chaque thème servi : a-t-il une nuit. */
export function bootThemes(): Record<string, boolean> {
  return Object.fromEntries(THEMES.map((theme) => [theme.key, !!theme.options.darkMode]))
}
