/**
 * Garde de non-indexation d'un staging (website#76) : échoue si une page, le robots.txt
 * ou, en ligne, l'en-tête X-Robots-Tag laisse les moteurs indexer le site. Le workflow
 * deploy-staging.yml la lance avant la copie sur le serveur, puis sur le site déployé.
 *
 * Usage : pnpm check:noindex              (sur dist/, après pnpm build)
 *         pnpm check:noindex <origine>    (sur le site en ligne)
 */

import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { headerProblem, pageProblem, robotsProblem } from './noindex.ts'

const DIST = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist')

async function checkDist(): Promise<string[]> {
  const entries = await readdir(DIST, { withFileTypes: true, recursive: true })
  const pages = entries.filter((e) => e.isFile() && e.name.endsWith('.html')).map((e) => join(e.parentPath, e.name))
  if (pages.length === 0) return [`aucune page dans ${DIST} : lancer pnpm build d'abord`]
  const problems: string[] = []
  for (const file of pages) {
    const problem = pageProblem(await readFile(file, 'utf8'))
    if (problem) problems.push(`${relative(DIST, file)} : ${problem}`)
  }
  const robots = robotsProblem(await readFile(join(DIST, 'robots.txt'), 'utf8').catch(() => ''))
  if (robots) problems.push(robots)
  return problems
}

async function checkOnline(origin: string): Promise<string[]> {
  const problems: string[] = []
  // Les location de nginx.conf qui posent leurs en-têtes doivent répéter celui-ci.
  for (const path of ['/', '/robots.txt', '/manifest.webmanifest', '/sw.js']) {
    const response = await fetch(new URL(path, origin), { redirect: 'manual' })
    const header = headerProblem(response.headers.get('x-robots-tag'))
    if (header) problems.push(`${path} : ${header}`)
    if (!response.ok) problems.push(`${path} : HTTP ${response.status}`)
    else if (path === '/') {
      const page = pageProblem(await response.text())
      if (page) problems.push(`${path} : ${page}`)
    } else if (path === '/robots.txt') {
      const robots = robotsProblem(await response.text())
      if (robots) problems.push(robots)
    }
  }
  return problems
}

const origin = process.argv[2]
const problems = origin ? await checkOnline(origin) : await checkDist()
const target = origin ?? 'dist/'

if (problems.length > 0) {
  console.error(`✖ ${target} est indexable — un staging ne doit jamais l'être :\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}
console.log(`✓ ${target} fermé aux moteurs de recherche.`)
