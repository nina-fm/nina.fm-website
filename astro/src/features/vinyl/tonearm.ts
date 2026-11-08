/**
 * Le bras de lecture de Vinyl (`ToneArm.vue`) : il avance sur le disque avec la
 * progression de la mixtape, de 0° au bord à 25° près du sticker.
 */

export const ARM_ANGLE_END = 25

/** L'intervalle de `/activity`, qui donne la progression : le bras glisse d'une mesure à l'autre. */
export const ARM_STEP_MS = 3000

/** Le retour au bord quand une mixtape en remplace une autre. */
export const ARM_RETURN_MS = 1000

/** L'angle du bras pour une progression en pourcentage. */
export function armAngle(progress: number): number {
  return (ARM_ANGLE_END * progress) / 100
}

/**
 * La durée de la transition vers la nouvelle position : un pas d'`/activity` en
 * avançant, un retour plus vif quand la progression baisse. La prod lisait une
 * `streamRefreshTime` absente de sa config (transition en `undefinedms`, le bras
 * sautait), et son retour ne se déclenchait jamais (website#79).
 */
export function armTransition(previous: number, next: number): number {
  return next < previous ? ARM_RETURN_MS : ARM_STEP_MS
}
