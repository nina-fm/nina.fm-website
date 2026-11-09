import { manifestKeys, progressOf } from './precache-progress.ts'
import { checkHeld } from './update-step.client.ts'

/** Assez souvent pour une barre qui avance, assez peu pour ne rien coûter. */
const POLL_MS = 250

/** Les clés que le précache de Workbox a déjà reçues. */
async function cachedKeys(): Promise<Set<string>> {
  const name = (await caches.keys()).find((key) => key.startsWith('workbox-precache'))
  if (!name) return new Set()
  const requests = await (await caches.open(name)).keys()
  return new Set(requests.map((request) => request.url))
}

/**
 * Suit l'installation d'une nouvelle version (`precache-progress.ts`) et la dit sur
 * `<html>` : `data-progress` et `--launch-progress` (0 à 1), que la barre de l'écran
 * de lancement lit (`launch.css`). Sans eux, la barre reste indéterminée. S'arrête
 * avec la vérification qui l'a lancé (`checkHeld`) : l'ouverture finie, plus rien.
 */
export function followPrecache(): void {
  const root = document.documentElement
  const show = (progress: number) => {
    root.dataset.progress = ''
    root.style.setProperty('--launch-progress', String(progress))
    document.querySelector('.launch-bar')?.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
  }
  const clear = () => {
    delete root.dataset.progress
    root.style.removeProperty('--launch-progress')
  }

  void (async () => {
    // Le nouveau `sw.js`, jamais celui du cache HTTP : c'est sa liste qui compte.
    const source = await fetch('/sw.js', { cache: 'no-store' }).then((response) => response.text())
    const keys = manifestKeys(source, `${location.origin}/`)
    if (!keys) return
    const tick = async (): Promise<void> => {
      const progress = progressOf(keys, await cachedKeys())
      if (!checkHeld()) return clear()
      show(progress)
      setTimeout(() => void tick().catch(clear), POLL_MS)
    }
    await tick()
  })().catch(clear)
}
