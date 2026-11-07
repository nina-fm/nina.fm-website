import { NAME } from '~/shared/site/site.ts'
import { getArtwork } from './artwork.ts'
import type { PlayingRadio } from './player.ts'

/**
 * Ce que l'antenne diffuse, tel que les contrôles système le montrent : la
 * mixtape, ou le morceau seul. Donné par les métadonnées SSE
 * (`metadata/metadata.store.ts`), que les contrôles système n'importent jamais.
 */
export interface SystemTrack {
  title: string
  /** Les DJs de la mixtape, ou l'artiste du morceau. */
  artist?: string
  /** Pochette, absolue ou relative au site. */
  cover?: string
}

/**
 * Ce que montrent les contrôles système : le nom du site seul, ou ce que
 * l'antenne diffuse, avec sa pochette en plusieurs tailles (`getArtwork`). Album
 * et artiste par défaut valent « Nina.fm », comme sur le site Nuxt.
 */
export function systemMetadata(radio: PlayingRadio, origin: string, track?: SystemTrack | null): MediaMetadataInit {
  return {
    title: track?.title ?? radio.name,
    artist: track?.artist ?? NAME,
    album: NAME,
    artwork: getArtwork(track?.cover ?? radio.imageUrl, origin),
  }
}

/**
 * Délai après le début du son au bout duquel les boutons sont redonnés au système.
 * L'écran verrouillé de l'iPhone ne prend que ceux déclarés une fois le son lancé
 * (mesuré par ohmyradios, 2026-11-05).
 */
export const RECLAIM_AFTER_MS = 1_000

/** Deux diffusions identiques pour l'écran verrouillé : il n'est alors pas réécrit. */
export const sameTrack = (a?: SystemTrack | null, b?: SystemTrack | null): boolean =>
  (a?.title ?? null) === (b?.title ?? null) &&
  (a?.artist ?? null) === (b?.artist ?? null) &&
  (a?.cover ?? null) === (b?.cover ?? null)
