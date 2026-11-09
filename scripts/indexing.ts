/**
 * Indexation attendue d'un site : un staging ne doit jamais être indexable (website#76),
 * la prod doit l'être (website#80). Règles pures, pour être testées ; `check-indexing.ts`
 * les applique au build (`dist/`) et au site en ligne.
 */

export type Expected = 'noindex' | 'indexable'

export function isExpected(value: string | undefined): value is Expected {
  return value === 'noindex' || value === 'indexable'
}

const ROBOTS_META = /<meta\s+name="robots"\s+content="([^"]*)"/i
const STATCOUNTER = /statcounter/i
const closes = (value: string): boolean => /\bnoindex\b/i.test(value) || /\bnofollow\b/i.test(value)
const closesAll = (value: string): boolean => /\bnoindex\b/i.test(value) && /\bnofollow\b/i.test(value)

/** Ce qui écarte une page de l'attendu, ou `null`. Statcounter ne compte que la prod. */
export function pageProblem(html: string, expected: Expected): string | null {
  const content = html.match(ROBOTS_META)?.[1]
  if (expected === 'indexable') {
    if (content !== undefined && closes(content)) return `meta robots « ${content} »`
    if (!STATCOUNTER.test(html)) return 'statcounter absent en production'
    return null
  }
  if (!content) return 'aucune meta robots'
  if (!closesAll(content)) return `meta robots « ${content} »`
  if (STATCOUNTER.test(html)) return 'statcounter chargé hors production'
  return null
}

/** Ce qui écarte un robots.txt de l'attendu, ou `null`. */
export function robotsProblem(robots: string, expected: Expected): string | null {
  const lines = robots.split('\n').map((line) => line.trim().toLowerCase())
  const closed = lines.includes('disallow: /')
  if (expected === 'indexable') return closed ? 'robots.txt contient « Disallow: / »' : null
  if (!closed) return 'robots.txt sans « Disallow: / »'
  if (lines.some((line) => line.startsWith('allow:'))) return 'robots.txt contient un « Allow »'
  return null
}

/** Ce qui écarte l'en-tête X-Robots-Tag d'une réponse de l'attendu, ou `null`. */
export function headerProblem(value: string | null, expected: Expected): string | null {
  if (expected === 'indexable') return value && closes(value) ? `X-Robots-Tag « ${value} »` : null
  if (!value) return 'aucun en-tête X-Robots-Tag'
  if (!closesAll(value)) return `X-Robots-Tag « ${value} »`
  return null
}
