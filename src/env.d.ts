interface ImportMetaEnv {
  /** `production` rend le site indexable ; toute autre valeur, ou son absence, le ferme. */
  readonly PUBLIC_SITE_ENV?: string
  readonly PUBLIC_AUDIO_STREAM_URL?: string
  readonly PUBLIC_API_URL?: string
  readonly PUBLIC_API_STREAM_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
