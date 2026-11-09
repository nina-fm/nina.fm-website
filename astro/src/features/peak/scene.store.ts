import { type Accessor, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { metadata } from '~/features/metadata/metadata.store.ts'
import { audienceCount } from '~/features/metadata/onAir.ts'
import type { Metadata } from '~/features/metadata/types.ts'
import { autoplay } from '~/features/playback/autoplay.store.ts'
import { mute } from '~/features/playback/mute.store.ts'
import { player } from '~/features/playback/player.store.ts'
import { listeningFlags } from '~/features/shell/listening.ts'
import { panels } from '~/features/shell/panels.store.ts'
import { useMounted } from '~/shared/ui/mounted.store.ts'
import { retryImagesWhenOnline } from './images.client.ts'
import { type PlayerLines, equalizerTooltip, playerLines } from './player.ts'
import { type Star, nextStars } from './stars.ts'

/**
 * L'état de la scène Peak, lu une fois l'îlot monté : comme les `ClientOnly` de la prod,
 * rien de ce qui dépend du lecteur, des métadonnées ou de l'auditeur n'est dans le HTML
 * du build.
 */
export interface SceneView {
  mounted: Accessor<boolean>
  lines: Accessor<PlayerLines>
  equalizerTooltip: Accessor<string>
  details: Accessor<boolean>
  content: Accessor<boolean>
  onAir: Accessor<Metadata | null>
  progress: Accessor<number>
  stars: Accessor<readonly Star[]>
  /** Les autres auditeurs : une étoile chacun. */
  audience: Accessor<number>
  /** Tous les auditeurs, l'auditeur courant compris : l'info-bulle des étoiles. */
  listeners: Accessor<number>
  /** Le logo se trace au chargement, jusqu'au premier survol. */
  logoInit: Accessor<boolean>
  settleLogo: () => void
}

export function useScene(): SceneView {
  const mounted = useMounted()
  const onAir = () => (mounted() ? metadata.onAir().metadata : null)
  const audience = () => (mounted() ? audienceCount(metadata.listeners()) : 0)
  const [stars, setStars] = createSignal<readonly Star[]>([])
  const [logoInit, setLogoInit] = createSignal(true)
  onMount(() => onCleanup(retryImagesWhenOnline()))
  createEffect(() => {
    const count = audience()
    setStars((previous) => nextStars(previous, count, Math.random))
  })

  return {
    mounted,
    lines: () =>
      playerLines({
        flags: listeningFlags(player.state.status, autoplay.state()),
        mixtape: metadata.onAir().type === 'mixtape',
        artist: onAir()?.authors_text,
        title: onAir()?.name,
      }),
    equalizerTooltip: () => equalizerTooltip(mute.muted()),
    details: () => mounted() && panels.details(),
    content: () => mounted() && panels.content(),
    onAir,
    progress: () => (mounted() ? metadata.progress() : 0),
    stars,
    audience,
    listeners: () => (mounted() ? metadata.listeners() : 0),
    logoInit,
    settleLogo: () => setLogoInit(false),
  }
}
