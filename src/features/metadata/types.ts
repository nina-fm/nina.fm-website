/**
 * Formats des métadonnées : ce que l'API Nina envoie par SSE, et ce que le site affiche.
 * Repris des types ambiants de `app/types/metadata.d.ts` (Nuxt), rendus importables.
 */

/** Morceau tel que l'API le renvoie, déjà découpé. */
export interface ParsedTrack {
  position: number
  artist: string
  title: string
  startAt: string | null
}

/** Mixtape envoyée par le flux SSE `/metadata` (messages sans nom d'événement). */
export interface MixtapeMetadataDto {
  id: string
  name: string
  slug: string
  year: number
  coverUrl: string | null
  tracks: ParsedTrack[]
  djs: string[]
  tags: string[]
  comment: string | null
}

export interface TrackMetadataDto {
  artist: string
  title: string
}

export interface MetadataStreamDto {
  type: 'mixtape' | 'track' | null
  mixtape?: MixtapeMetadataDto | null
  track?: TrackMetadataDto | null
}

export interface ActivityStreamDto {
  progress: number
  listeners: number
}

export interface TrackBase {
  artist: string | null
  title: string | null
  [key: string]: unknown
}

export interface Track extends TrackBase {
  id?: number
  position: number
  start_at: string | null
}

export interface Author {
  id: string
  name: string
  slug: string
  position?: number
}

export interface Tag {
  id: string
  name: string
  slug: string
  color?: string
}

/** Format affiché par les thèmes, gardé tel quel pour la migration à l'identique. */
export interface Metadata {
  id: string
  name: string
  year?: number
  authors?: Author[]
  authors_text?: string
  tracks?: Track[]
  tracks_text?: string
  cover_url?: string
  tags?: Tag[]
}
