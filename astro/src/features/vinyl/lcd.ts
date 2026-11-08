/** Le compteur LCD des auditeurs de Vinyl (`LcdCounter.vue`). */

export const LCD_DIGITS = 3

/**
 * Les chiffres affichés : le total des auditeurs, l'auditeur courant compris, et les
 * zéros éteints qui complètent l'afficheur. Peak, lui, ne compte que les autres
 * (`audienceCount`) : une étoile par autre auditeur (website#61).
 */
export function lcdDigits(count: number): { padding: string; value: string } {
  const value = String(count)
  return { padding: '0'.repeat(Math.max(0, LCD_DIGITS - value.length)), value }
}

/** L'info-bulle du compteur : les autres auditeurs, sans l'auditeur courant. */
export function lcdTooltip(count: number): string {
  const others = count - 1
  return `Vous partagez l'écoute de Nina.fm avec ${others} autre${others > 1 ? 's' : ''} !`
}
