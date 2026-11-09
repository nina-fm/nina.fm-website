/**
 * Garde le lecteur persistant et les pages autour sur le même build (repris
 * d'ohmyradios).
 *
 * L'îlot du lecteur survit aux navigations côté client, et avec lui les instances
 * de modules qu'il a chargées. Une page d'un build plus récent (servie par le
 * réseau après un déploiement, ou par un service worker qui vient de prendre la
 * main) référence des modules au hash nouveau : ses îlots auraient un second état
 * du lecteur, lié à aucun élément audio, et leurs boutons ne feraient rien.
 *
 * Les hash se propagent par les imports : l'URL du module de l'îlot change dès que
 * l'une de ses dépendances change. Quand elle diffère, le routeur abandonne et
 * charge le document entier. Le son se coupe une fois, plutôt que de laisser un
 * lecteur qui ne répond plus.
 */

const PERSISTED_PLAYER = 'astro-island[data-astro-transition-persist="player"]'

function playerModule(doc: Document): string | null {
  return doc.querySelector(PERSISTED_PLAYER)?.getAttribute('component-url') ?? null
}

/** Enregistre la garde. Une fois par document. */
export function reloadOnNewBuild(): void {
  document.addEventListener('astro:before-preparation', (event) => {
    const load = event.loader
    event.loader = async () => {
      await load()
      if (event.defaultPrevented) return
      if (playerModule(event.newDocument) !== playerModule(document)) event.preventDefault()
    }
  })
}
