import { checkHeld } from './update-step.client.ts'

/**
 * Met fin au lancement (`launch.ts`) dès que la page est prête : la coquille montée,
 * et aucune vérification de version en cours. Pas de durée minimale : l'écran ne reste
 * que le temps nécessaire, puis se fond (`launch.css`). Appelée au montage de la
 * coquille ; sans lancement décidé, ne fait rien.
 */
export function landLaunch(): void {
  const root = document.documentElement
  if (!('launch' in root.dataset)) return
  // Pris en main : le garde-fou du script du `<head>` ne le retire plus.
  root.dataset.launch = 'mounted'
  const land = () => {
    if (checkHeld()) return false
    delete root.dataset.launch
    return true
  }
  if (land()) return
  const watch = new MutationObserver(() => land() && watch.disconnect())
  watch.observe(root, { attributes: true, attributeFilter: ['data-update'] })
}
