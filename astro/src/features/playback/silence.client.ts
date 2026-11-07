import { silentWav } from './silence.ts'

let url: string | null = null

/** URL objet du silence, créée une fois : l'enregistrement ne change jamais. */
export function silenceUrl(): string {
  url ??= URL.createObjectURL(new Blob([silentWav()], { type: 'audio/wav' }))
  return url
}

/** Une source est le silence. Ne le crée jamais. */
export function isSilence(source: string | null): boolean {
  return url !== null && source === url
}
