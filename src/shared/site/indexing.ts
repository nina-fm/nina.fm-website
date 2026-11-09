/**
 * Indexation du site par les moteurs de recherche, décidée au build.
 *
 * Seul un build dont `PUBLIC_SITE_ENV` vaut exactement `production` est indexable. Tout
 * autre build (staging, préversion, local, variable absente ou mal écrite) est fermé :
 * oublier la variable donne un site non indexé, jamais un staging indexé. Un staging ne
 * doit jamais être indexable (website#76) ; `scripts/check-indexing.ts` le vérifie sur
 * chaque build de staging avant son déploiement.
 */

export const PRODUCTION = 'production'

export const NOINDEX = 'noindex, nofollow'

export function isProduction(siteEnv: string | undefined): boolean {
  return siteEnv === PRODUCTION
}

/** Contenu de la meta `robots`, ou `null` quand la page est indexable. */
export function robotsMeta(siteEnv: string | undefined): string | null {
  return isProduction(siteEnv) ? null : NOINDEX
}

/** Contenu de `robots.txt` : tout fermer hors production. */
export function robotsTxt(siteEnv: string | undefined): string {
  return isProduction(siteEnv) ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n'
}
