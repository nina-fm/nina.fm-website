import { createSignal, onMount } from 'solid-js'
import { metadata } from '~/features/metadata/metadata.store.ts'
import { NOTHING_ON_AIR, type OnAir, audienceCount } from '~/features/metadata/onAir.ts'
import { type Autoplay, autoplay } from './autoplay.store.ts'
import { useOnline } from './online.store.ts'
import { player } from './player.store.ts'
import { type PlaybackStatus, isListening } from './player.ts'

/** Ce que la page de recette affiche, chaque valeur lue à la demande. */
export interface PlaybackStateView {
  status: () => PlaybackStatus
  listening: () => boolean
  autoplay: () => Autoplay
  online: () => boolean
  type: () => OnAir['type']
  name: () => string
  djs: () => string
  cover: () => string | undefined
  progress: () => number
  listeners: () => number
  audience: () => number
}

/**
 * Tout l'état de l'écoute, pour la page brute de recette (`PlaybackState.tsx`),
 * en attendant la coquille (website#78). Lu seulement après le montage : un îlot
 * hydraté après que l'état a changé garderait sinon les valeurs du rendu statique.
 */
export function usePlaybackState(): PlaybackStateView {
  const [mounted, setMounted] = createSignal(false)
  const online = useOnline()
  onMount(() => setMounted(true))
  const onAir = () => (mounted() ? metadata.onAir() : NOTHING_ON_AIR)
  return {
    status: () => (mounted() ? player.state.status : 'stopped'),
    listening: () => mounted() && isListening(player.state.status),
    autoplay: () => (mounted() ? autoplay.state() : 'unknown'),
    online,
    type: () => onAir().type,
    name: () => onAir().metadata?.name ?? '',
    djs: () => onAir().metadata?.authors_text ?? '',
    cover: () => onAir().metadata?.cover_url,
    progress: () => (mounted() ? metadata.progress() : 0),
    listeners: () => (mounted() ? metadata.listeners() : 0),
    audience: () => audienceCount(mounted() ? metadata.listeners() : 0),
  }
}
