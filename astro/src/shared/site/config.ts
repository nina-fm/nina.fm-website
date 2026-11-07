/**
 * Configuration publique, figée au build depuis les variables `PUBLIC_*`
 * (équivalent des `NUXT_PUBLIC_*` de la prod Nuxt). Lue une seule fois, ici.
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

export const config: PublicConfig = readConfig(import.meta.env)
