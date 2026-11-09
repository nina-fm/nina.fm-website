import { player } from '~/features/playback/player.store.ts'
import { LAUNCHED } from './launch.ts'
import { harmlessFor } from './reload.ts'
import { announce, installingFor, stepOf } from './update-step.client.ts'

/**
 * Apporter une nouvelle version à la page affichée (`register.client.ts`,
 * `opening-check.client.ts`) : par un rechargement, seulement quand il ne coûte rien.
 */

/**
 * Le temps de lire chaque étape d'une mise à jour qui se montre : sur un bon réseau,
 * l'installation prend moins d'une seconde, et 0,6 s de « Nina.fm est à jour » ne se
 * lisaient pas (recette de website#90). Seulement quand une étape se montre : une
 * ouverture sans mise à jour n'attend rien de plus.
 */
const INSTALLING_MIN_MS = 1200
const READY_MS = 1200

/** Le rechargement est prévu : la seconde prise de main vue n'en prévoit pas un autre. */
let reloading = false

/** Recharger ne coûte rien : ni écoute en cours, ni pause (`reload.ts`). */
export function harmless(): boolean {
  return harmlessFor(player.state.status)
}

/**
 * Recharge sur la nouvelle version, sous l'écran de lancement : la marque de l'onglet
 * oubliée, le script du `<head>` le reposera (`launch.ts`). Une étape montrée à
 * l'écran laisse d'abord lire l'installation, puis que la version est prête ; sinon,
 * ou page cachée, le rechargement est immédiat. La prise de main se voit deux fois,
 * par `controllerchange` et par l'état du nouveau worker : un seul rechargement.
 */
export function reload(): void {
  if (reloading) return
  reloading = true
  try {
    sessionStorage.removeItem(LAUNCHED)
  } catch {
    // Sans stockage, pas de marque : rien à oublier.
  }
  const step = stepOf()
  if (!step || document.visibilityState === 'hidden') return location.reload()
  const rest = step === 'installing' ? Math.max(0, INSTALLING_MIN_MS - installingFor()) : 0
  setTimeout(() => {
    announce('ready')
    setTimeout(() => location.reload(), READY_MS)
  }, rest)
}
