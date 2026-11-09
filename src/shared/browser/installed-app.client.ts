/** Ouvert depuis l'écran d'accueil, pas dans un onglet (`navigator.standalone` : iOS). */
export function installedApp(): boolean {
  return (
    matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}
