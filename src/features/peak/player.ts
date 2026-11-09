import type { ListeningFlags } from '~/features/shell/listening.ts'

/**
 * Les deux lignes du lecteur de Peak (`themes/peak/components/Player.vue`) : ce qui
 * passe, ou un message d'attente, puis le type d'écoute, qui défile avec elle.
 */

export const PLAYER_MESSAGES = {
  locked: 'Cliquez pour lancer la lecture',
  loading: 'Recherche des infos...',
  mixtape: 'Une mixtape Nina.fm',
  listening: "À l'écoute sur Nina.fm",
} as const

export interface PlayerInput {
  flags: ListeningFlags
  mixtape: boolean
  /** Les DJs, ou l'artiste du morceau. */
  artist?: string
  title?: string
}

export interface PlayerLines {
  /** Ce qui passe, s'il est connu et que l'écoute est lancée ou va l'être. */
  onAir: { artist: string; title: string } | null
  /** Le message montré à sa place. */
  message: string
  /** La seconde ligne, qui alterne avec la première ; `null` : rien ne défile. */
  type: string | null
  /** Le bouton des détails de la mixtape. */
  details: boolean
}

export function playerLines(input: PlayerInput): PlayerLines {
  const { flags, mixtape, artist, title } = input
  // L'écoute est lancée ou va l'être : l'autoplay n'attend pas un geste.
  const started = !flags.locked || flags.loading
  return {
    onAir: started && artist && title ? { artist, title } : null,
    message: started ? PLAYER_MESSAGES.loading : PLAYER_MESSAGES.locked,
    type: started ? (mixtape ? PLAYER_MESSAGES.mixtape : PLAYER_MESSAGES.listening) : null,
    details: mixtape && (started || flags.playing),
  }
}

/**
 * L'info-bulle de l'égaliseur. La prod lisait l'objet réactif au lieu de sa valeur, et
 * proposait toujours d'« Activer » le son.
 */
export function equalizerTooltip(muted: boolean): string {
  return `${muted ? 'Activer' : 'Désactiver'} le son (vous pouvez aussi utiliser la barre d'espace)`
}
