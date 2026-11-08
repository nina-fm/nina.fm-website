/**
 * La scène de Vinyl est dessinée sur un canevas de 900 px (disque de 1000 px, bras de
 * 900) et mise à l'échelle sur le plus petit côté de la fenêtre (`pages/index.vue`).
 */
export const VINYL_CANVAS = 900

export function sceneScale(width: number, height: number): number {
  return Math.min(width, height) / VINYL_CANVAS
}
