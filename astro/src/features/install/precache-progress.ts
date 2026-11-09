/**
 * L'avancement de l'installation d'une nouvelle version, lu par la page elle-même
 * (website#90) : le service worker, généré par Workbox (`service-worker.build.ts`), ne
 * dit rien de son précache. La page lit donc la liste du nouveau `sw.js` et la compare
 * aux clés que le cache a déjà reçues. Un `sw.js` illisible donne `null` : la barre
 * reste indéterminée, rien ne casse.
 */

/** Une entrée du manifest tel que Workbox l'écrit : `{url:"…",revision:"…"|null}`. */
const ENTRY = /\{url:"([^"]+)",revision:(?:"([^"]+)"|null)\}/g

/**
 * Les clés du cache que la nouvelle version remplira, d'après la source de son
 * `sw.js` : l'URL absolue, et pour une entrée révisionnée le paramètre
 * `__WB_REVISION__` que Workbox y ajoute. `base` : l'origine du site, `/` final compris.
 */
export function manifestKeys(source: string, base: string): string[] | null {
  const list = /precacheAndRoute\(\[([^\]]*)\]/.exec(source)?.[1]
  if (!list) return null
  const keys = [...list.matchAll(ENTRY)].map(([, url, revision]) =>
    revision ? `${base}${url}?__WB_REVISION__=${revision}` : `${base}${url}`,
  )
  return keys.length > 0 ? keys : null
}

/**
 * La part des clés déjà dans le cache, de 0 à 1. Le cache garde aussi celles de la
 * version affichée jusqu'à la prise de main : seules celles de la nouvelle comptent.
 */
export function progressOf(keys: readonly string[], cached: ReadonlySet<string>): number {
  return keys.filter((key) => cached.has(key)).length / keys.length
}
