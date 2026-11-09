/**
 * Le titre de l'onglet, qui alterne toutes les 10 s entre le nom du site et ce qui
 * passe à l'antenne, comme dans la prod (`app/stores/app.ts`).
 */

export const TAB_TITLE_INTERVAL_MS = 10_000

/** Le titre suivant ; celui du site seul quand rien n'est à l'antenne. */
export function nextTabTitle(current: string, site: string, name?: string, authors?: string): string {
  if (!name) return site
  return current === site ? `${name} - ${authors ?? ''}` : site
}
