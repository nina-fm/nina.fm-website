/**
 * Configuration publique, figée au build depuis les variables `PUBLIC_*`
 * (les `NUXT_PUBLIC_*` du site Nuxt). Lue une seule fois, ici.
 */
export interface PublicConfig {
  siteEnv: string | undefined
  audioStreamUrl: string | undefined
  apiUrl: string | undefined
  apiStreamEndpoint: string | undefined
}

export function readConfig(env: Record<string, string | undefined>): PublicConfig {
  return {
    siteEnv: env.PUBLIC_SITE_ENV,
    audioStreamUrl: env.PUBLIC_AUDIO_STREAM_URL,
    apiUrl: env.PUBLIC_API_URL,
    apiStreamEndpoint: env.PUBLIC_API_STREAM_ENDPOINT,
  }
}

/** Variables sans lesquelles le site n'a ni son ni métadonnées. */
const REQUIRED = ['PUBLIC_AUDIO_STREAM_URL', 'PUBLIC_API_URL', 'PUBLIC_API_STREAM_ENDPOINT'] as const

/**
 * Variables requises absentes d'un build déployé (`PUBLIC_SITE_ENV` posé : staging,
 * production). Un tel build échoue (`astro.config.mjs`) plutôt que de livrer un site
 * muet qui appellerait `undefined/stream/metadata`. En local, sans `PUBLIC_SITE_ENV`,
 * rien n'est exigé.
 */
export function missingConfig(env: Record<string, string | undefined>): string[] {
  if (!env.PUBLIC_SITE_ENV) return []
  return REQUIRED.filter((name) => !env[name])
}

/** Les deux flux SSE de l'API (`/metadata`, `/activity`), `null` sans API configurée. */
export function sseUrls(config: PublicConfig): { metadata: string; activity: string } | null {
  if (!config.apiUrl || !config.apiStreamEndpoint) return null
  const base = `${config.apiUrl}${config.apiStreamEndpoint}`
  return { metadata: `${base}/metadata`, activity: `${base}/activity` }
}

export const config: PublicConfig = readConfig(import.meta.env)
