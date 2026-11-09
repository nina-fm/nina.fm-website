/**
 * Garde d'indexation : échoue si une page, le robots.txt ou, en ligne, l'en-tête
 * X-Robots-Tag s'écarte de l'attendu. Un staging ne doit jamais être indexable
 * (website#76), la prod doit l'être (website#80). `validate.yml` la lance sur le build,
 * `deploy-static.yml` sur le site déployé.
 *
 * Usage : pnpm check:indexing <noindex|indexable>              (sur dist/, après pnpm build)
 *         pnpm check:indexing <noindex|indexable> <origine>    (sur le site en ligne)
 */

import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type Expected, headerProblem, isExpected, pageProblem, robotsProblem } from './indexing.ts'

const DIST = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist')

async function checkDist(expected: Expected): Promise<string[]> {
  const entries = await readdir(DIST, { withFileTypes: true, recursive: true })
  const pages = entries.filter((e) => e.isFile() && e.name.endsWith('.html')).map((e) => join(e.parentPath, e.name))
  if (pages.length === 0) return [`aucune page dans ${DIST} : lancer pnpm build d'abord`]
  const problems: string[] = []
  for (const file of pages) {
    const problem = pageProblem(await readFile(file, 'utf8'), expected)
    if (problem) problems.push(`${relative(DIST, file)} : ${problem}`)
  }
  const robots = await readFile(join(DIST, 'robots.txt'), 'utf8').catch(() => null)
  if (robots === null) problems.push('robots.txt absent')
  else {
    const problem = robotsProblem(robots, expected)
    if (problem) problems.push(problem)
  }
  return problems
}

async function checkOnline(origin: string, expected: Expected): Promise<string[]> {
  const problems: string[] = []
  // Les location de nginx.conf qui posent leurs en-têtes doivent répéter celui-ci.
  for (const path of ['/', '/robots.txt', '/manifest.webmanifest', '/sw.js']) {
    const response = await fetch(new URL(path, origin), { redirect: 'manual' })
    const header = headerProblem(response.headers.get('x-robots-tag'), expected)
    if (header) problems.push(`${path} : ${header}`)
    if (!response.ok) problems.push(`${path} : HTTP ${response.status}`)
    else if (path === '/') {
      const page = pageProblem(await response.text(), expected)
      if (page) problems.push(`${path} : ${page}`)
    } else if (path === '/robots.txt') {
      const robots = robotsProblem(await response.text(), expected)
      if (robots) problems.push(robots)
    }
  }
  return problems
}

const [expected, origin] = process.argv.slice(2)
if (!isExpected(expected)) {
  console.error('Usage : check-indexing.ts <noindex|indexable> [origine]')
  process.exit(2)
}
const problems = origin ? await checkOnline(origin, expected) : await checkDist(expected)
const target = origin ?? 'dist/'

if (problems.length > 0) {
  const verdict = expected === 'noindex' ? 'est indexable — un staging ne doit jamais l’être' : 'n’est pas indexable'
  console.error(`✖ ${target} ${verdict} :\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}
console.log(
  `✓ ${target} ${expected === 'noindex' ? 'fermé aux moteurs de recherche' : 'ouvert aux moteurs de recherche'}.`,
)
