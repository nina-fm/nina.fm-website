/**
 * La constellation de Peak (`themes/peak/components/Audience.vue`) : une étoile par
 * auditeur compté (`audienceCount`), semée au hasard dans le haut du ciel. Les étoiles
 * déjà là gardent leur place quand le compte change.
 */

export interface Star {
  id: number
  /** En pixels. */
  size: number
  /** En pourcentage de la scène. */
  left: number
  top: number
  opacity: number
}

const SIZES = { min: 3, max: 6 }
const LEFT = { min: 5, max: 95 }
const TOP = { min: 5, max: 35 }

/** Entier tiré entre `min` et `max` compris, `random` rendant un réel de [0, 1[. */
const between = (random: () => number, min: number, max: number) => Math.floor(random() * (max + 1 - min) + min)

/** Une étoile ; les plus grosses sont les plus lumineuses, comme dans la prod. */
export function randomStar(id: number, random: () => number): Star {
  const size = between(random, SIZES.min, SIZES.max)
  const range = SIZES.max - SIZES.min + 1
  const step = (size - range + 2) * (100 / range)
  return {
    id,
    size,
    left: between(random, LEFT.min, LEFT.max),
    top: between(random, TOP.min, TOP.max),
    opacity: (step + 50 * ((100 - step) / 100)) / 100,
  }
}

/** Les étoiles pour `count` auditeurs : les premières gardées, les manquantes semées. */
export function nextStars(previous: readonly Star[], count: number, random: () => number): Star[] {
  let id = previous.reduce((max, star) => Math.max(max, star.id + 1), 0)
  return Array.from({ length: count }, (_, index) => previous[index] ?? randomStar(id++, random))
}
