/**
 * Budget de performance, mesuré sur le site construit (repris d'ohmyradios).
 *
 * Ce qui régresse en silence, c'est le JavaScript envoyé à l'auditeur : on le mesure
 * exactement, en gzip, plutôt que par Lighthouse, lent et instable en CI.
 *
 * Usage : pnpm perf:budget  (après pnpm build)
 */

import { gzipSync } from 'node:zlib'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

/**
 * Budgets en octets gzippés. `js` : le JavaScript d'une page (scripts et îlots de
 * `dist/_astro/`, avec ce qu'ils importent), pour la page la plus lourde ; le service
 * worker, émis à la racine, n'en fait pas partie. `page` : le HTML d'une page.
 *
 * Posés le 2026-11-07 sur la page provisoire du socle (website#76) : aucun fichier JS
 * (Astro inline le script du service worker), 0,7 ko de HTML.
 *
 * `js` relevé le 2026-11-07 avec le lecteur (website#77) : 19,3 ko, dont le runtime
 * Solid 7,4, le routeur client 5,7 (qui garde le son entre les pages), le lecteur et
 * les flux SSE 4,0, les deux îlots 2,3 ; `mime` retiré au passage (−11 ko). Marge
 * d'environ 1 ko. La coquille (#78) le relèvera de nouveau, sciemment, et datera ici.
 */
const BUDGET = {
  js: 20 * 1024,
  page: 5 * 1024,
}

const gzipped = (buffer: Buffer) => gzipSync(buffer, { level: 9 }).length
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} ko`

async function filesUnder(directory: string, extension: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => join(entry.parentPath, entry.name))
}

const ASTRO = join(DIST, '_astro')

/** What a chunk imports, statically or not: `./name.js` beside it. */
const IMPORT = /(?:from\s*|import\s*\(?\s*)["'`]\.\/([\w.-]+\.js)["'`]/g

const chunkSizes = new Map<string, number>()
const chunkImports = new Map<string, string[]>()
for (const file of await filesUnder(ASTRO, '.js').catch(() => [])) {
  const source = await readFile(file)
  const name = relative(ASTRO, file)
  chunkSizes.set(name, gzipped(source))
  chunkImports.set(
    name,
    [...source.toString().matchAll(IMPORT)].map((match) => match[1]!),
  )
}

/** The chunks a page loads: its scripts and islands, and what they import. */
function pageScripts(html: string): Set<string> {
  const seeds = [...html.matchAll(/(?:src|component-url|renderer-url)="\/_astro\/([\w.-]+\.js)"/g)]
  const loaded = new Set<string>()
  const visit = (name: string) => {
    if (loaded.has(name)) return
    // A script this measure cannot find would go uncounted.
    if (!chunkSizes.has(name)) throw new Error(`${name}, chargé par une page, est absent de _astro/`)
    loaded.add(name)
    for (const imported of chunkImports.get(name) ?? []) visit(imported)
  }
  for (const [, name] of seeds) visit(name!)
  return loaded
}

const htmlFiles = await filesUnder(DIST, '.html')
const pages = await Promise.all(
  htmlFiles.map(async (file) => {
    const html = await readFile(file)
    const scripts = [...pageScripts(html.toString())]
    return {
      path: relative(DIST, file),
      size: gzipped(html),
      js: scripts.reduce((sum, name) => sum + chunkSizes.get(name)!, 0),
      scripts: scripts.length,
    }
  }),
)
pages.sort((a, b) => b.size - a.size)
const heaviest = pages[0]
const heaviestJs = pages.reduce((most, page) => (page.js > most.js ? page : most), pages[0]!)

const failures: string[] = []

console.log('Budget de performance, tailles gzippées :\n')
console.log(
  `  JavaScript de ${heaviestJs.path} (${heaviestJs.scripts} fichiers)  ${kb(heaviestJs.js)} / ${kb(BUDGET.js)}`,
)
if (heaviestJs.js > BUDGET.js) {
  failures.push(`JavaScript de ${heaviestJs.path} : ${kb(heaviestJs.js)} dépasse le budget de ${kb(BUDGET.js)}`)
}

for (const page of pages) {
  const marker = page === heaviest ? '*' : ' '
  console.log(`  ${marker} ${page.path.padEnd(24)} ${kb(page.size)} / ${kb(BUDGET.page)}`)
  if (page.size > BUDGET.page) {
    failures.push(`${page.path} : ${kb(page.size)} dépasse le budget de ${kb(BUDGET.page)}`)
  }
}

if (failures.length > 0) {
  console.error('\n✖ Budget dépassé :\n')
  for (const failure of failures) console.error(`  ${failure}`)
  console.error(
    "\nSoit la régression est réelle et il faut l'écarter, soit le budget est devenu\n" +
      'faux et il faut le relever sciemment dans scripts/performance-budget.ts.',
  )
  process.exit(1)
}

console.log('\n✓ Budget tenu.')
