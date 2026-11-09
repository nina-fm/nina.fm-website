/**
 * L'étape de la vérification d'une nouvelle version à l'ouverture
 * (`opening-check.client.ts`), dite sur `<html>` par `data-update` : l'écran de
 * lancement l'affiche (`launch.css`), et ne se retire qu'une fois la vérification
 * finie (`launch.client.ts`). Repris d'ohmyradios.
 */

/**
 * Ce que fait la vérification, une fois montrée : elle cherche, installe, puis la
 * nouvelle version est prête et la page va se recharger dessus (`reload.client.ts`).
 */
export type UpdateStep = 'checking' | 'installing' | 'ready'

/** Une vérification en cours, montrée ou pas encore (`pending`). */
export const checkHeld = (): boolean => 'update' in document.documentElement.dataset

/** L'étape montrée, s'il y en a une. */
export function stepOf(): UpdateStep | null {
  const step = document.documentElement.dataset.update
  return step === 'checking' || step === 'installing' || step === 'ready' ? step : null
}

/** Dit l'étape sur `<html>` ; `pending` retient le lancement sans rien montrer ; `null` y met fin. */
export function announce(step: UpdateStep | 'pending' | null): void {
  const root = document.documentElement
  if (step) root.dataset.update = step
  else delete root.dataset.update
}
