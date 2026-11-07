/**
 * Règles de non-indexation d'un staging (website#76) : un staging ne doit jamais être
 * indexable. Pures, pour être testées ; `check-noindex.ts` les applique au build
 * (`dist/`) et au site en ligne.
 */

const ROBOTS_META = /<meta\s+name="robots"\s+content="([^"]*)"/i

/** Ce qui manque à une page pour être fermée aux moteurs, ou `null` si elle l'est. */
export function pageProblem(html: string): string | null {
  const content = html.match(ROBOTS_META)?.[1]
  if (!content) return 'aucune meta robots'
  if (!/\bnoindex\b/.test(content) || !/\bnofollow\b/.test(content)) return `meta robots « ${content} »`
  if (/statcounter/i.test(html)) return 'statcounter chargé hors production'
  return null
}

/** Ce qui ouvre un robots.txt aux moteurs, ou `null` s'il ferme tout le site. */
export function robotsProblem(robots: string): string | null {
  const lines = robots.split('\n').map((line) => line.trim().toLowerCase())
  if (!lines.includes('disallow: /')) return 'robots.txt sans « Disallow: / »'
  if (lines.some((line) => line.startsWith('allow:'))) return 'robots.txt contient un « Allow »'
  return null
}

/** Ce qui manque à l'en-tête X-Robots-Tag d'une réponse, ou `null`. */
export function headerProblem(value: string | null): string | null {
  if (!value) return 'aucun en-tête X-Robots-Tag'
  if (!/\bnoindex\b/i.test(value) || !/\bnofollow\b/i.test(value)) return `X-Robots-Tag « ${value} »`
  return null
}
