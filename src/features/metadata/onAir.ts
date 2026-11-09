import type { SystemTrack } from '~/features/playback/system-controls.ts'
import { transformMixtapeToMetadata } from './transformMixtapeToMetadata.ts'
import type { Metadata, MetadataStreamDto } from './types.ts'

/** Ce qui passe à l'antenne, d'après le dernier message du flux SSE `/metadata`. */
export interface OnAir {
  type: 'mixtape' | 'track' | null
  metadata: Metadata | null
}

export const NOTHING_ON_AIR: OnAir = { type: null, metadata: null }

/**
 * Lit un message du flux `/metadata` : une mixtape (transformée au format des
 * thèmes), un morceau seul (artiste et titre), ou rien. Un message dont le type
 * annonce un contenu absent vaut rien, comme dans le site Nuxt (`stores/metadata.ts`).
 */
export function onAirFrom(message: MetadataStreamDto): OnAir {
  if (message.type === 'mixtape' && message.mixtape) {
    return { type: 'mixtape', metadata: transformMixtapeToMetadata(message.mixtape) }
  }
  if (message.type === 'track' && message.track) {
    return {
      type: 'track',
      metadata: { id: '', authors_text: message.track.artist, name: message.track.title },
    }
  }
  return NOTHING_ON_AIR
}

/**
 * Ce que l'écran verrouillé montre de ce qui passe : le nom, les DJs (ou
 * l'artiste) et la pochette. `null` sans rien de connu : les contrôles système
 * montrent alors Nina.fm seul. Un champ vide compte comme absent.
 */
export function systemTrackOf(metadata: Metadata | null): SystemTrack | null {
  if (!metadata?.name) return null
  return {
    title: metadata.name,
    ...(metadata.authors_text ? { artist: metadata.authors_text } : {}),
    ...(metadata.cover_url ? { cover: metadata.cover_url } : {}),
  }
}

/**
 * Nombre d'auditeurs affiché : celui de l'API moins l'auditeur courant, jamais
 * sous zéro. Peak le calculait ainsi (`Audience.vue`), Vinyl montrait la valeur
 * brute ; les deux thèmes reprendront celui-ci (website#61).
 */
export function audienceCount(listeners: number): number {
  return Math.max(0, listeners - 1)
}
