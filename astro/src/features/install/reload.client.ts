import { player } from '~/features/playback/player.store.ts'
import { LAUNCHED } from './launch.ts'
import { harmlessFor } from './reload.ts'
import { announce, stepOf } from './update-step.client.ts'

/**
 * Apporter une nouvelle version à la page affichée (`register.client.ts`,
 * `opening-check.client.ts`) : par un rechargement, seulement quand il ne coûte rien.
 */

/** Le temps de lire « Nina.fm est à jour » avant le rechargement (website#90). */
const READY_MS = 600

/** Recharger ne coûte rien : ni écoute en cours, ni pause (`reload.ts`). */
export function harmless(): boolean {
  return harmlessFor(player.state.status)
}

/**
 * Recharge sur la nouvelle version, sous l'écran de lancement : la marque de l'onglet
 * oubliée, le script du `<head>` le reposera (`launch.ts`). Une étape montrée à
 * l'écran laisse d'abord lire que la version est prête ; sinon, ou page cachée, le
 * rechargement est immédiat. La prise de main se voit deux fois, par
 * `controllerchange` et par l'état du nouveau worker : le second appel trouve le
 * rechargement déjà prévu.
 */
export function reload(): void {
  const step = stepOf()
  if (step === 'ready') return
  try {
    sessionStorage.removeItem(LAUNCHED)
  } catch {
    // Sans stockage, pas de marque : rien à oublier.
  }
  if (!step || document.visibilityState === 'hidden') return location.reload()
  announce('ready')
  setTimeout(() => location.reload(), READY_MS)
}
