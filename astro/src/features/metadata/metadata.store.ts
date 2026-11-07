import { createSignal } from 'solid-js'
import { showTrackOnSystem } from '~/features/playback/system-controls.client.ts'
import { config, sseUrls } from '~/shared/site/config.ts'
import { SseClient } from '~/shared/sse/SseClient.client.ts'
import { NOTHING_ON_AIR, type OnAir, onAirFrom, systemTrackOf } from './onAir.ts'
import type { ActivityStreamDto, MetadataStreamDto } from './types.ts'

/**
 * Ce qui passe à l'antenne, tenu à jour par les deux flux SSE de l'API, distincts
 * et sans événement nommé : `/metadata` à chaque changement de mixtape,
 * `/activity` toutes les 3 s (progression en %, auditeurs). État de module unique,
 * comme le lecteur : ouvert par l'îlot persistant, il survit aux navigations.
 */

const [onAir, setOnAir] = createSignal<OnAir>(NOTHING_ON_AIR)
const [progress, setProgress] = createSignal(0)
const [listeners, setListeners] = createSignal(0)

export const metadata = {
  onAir,
  /** Progression de la mixtape en cours, en pourcentage. */
  progress,
  /** Auditeurs comptés par l'API, l'auditeur courant compris (`audienceCount`). */
  listeners,
}

/**
 * Ouvre les deux flux, et confie chaque changement à l'écran verrouillé. Sans API
 * configurée (développement sans `.env`), rien ne s'ouvre. Renvoie de quoi fermer.
 */
export function followOnAir(): () => void {
  const urls = sseUrls(config)
  if (!urls) return () => undefined

  const onMetadata = new SseClient<MetadataStreamDto>(urls.metadata, (message) => {
    const next = onAirFrom(message)
    setOnAir(next)
    showTrackOnSystem(systemTrackOf(next.metadata))
  })
  const onActivity = new SseClient<ActivityStreamDto>(urls.activity, (message) => {
    setProgress(message.progress)
    setListeners(message.listeners)
  })
  onMetadata.connect()
  onActivity.connect()
  return () => {
    onMetadata.disconnect()
    onActivity.disconnect()
  }
}
