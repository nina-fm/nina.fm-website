import { player } from '~/features/playback/player.store.ts'
import { LAUNCHED } from './launch.ts'
import { harmlessFor } from './reload.ts'

/**
 * Apporter une nouvelle version à la page affichée (`register.client.ts`,
 * `opening-check.client.ts`) : par un rechargement, seulement quand il ne coûte rien.
 */

/** Recharger ne coûte rien : ni écoute en cours, ni pause (`reload.ts`). */
export function harmless(): boolean {
  return harmlessFor(player.state.status)
}

/**
 * Recharge sur la nouvelle version, sous l'écran de lancement : la marque de l'onglet
 * oubliée, le script du `<head>` le reposera (`launch.ts`). La prise de main se voit
 * deux fois, par `controllerchange` et par l'état du nouveau worker : l'un ou l'autre
 * recharge, et un second rechargement au même instant est la même navigation.
 */
export function reload(): void {
  try {
    sessionStorage.removeItem(LAUNCHED)
  } catch {
    // Sans stockage, pas de marque : rien à oublier.
  }
  location.reload()
}
