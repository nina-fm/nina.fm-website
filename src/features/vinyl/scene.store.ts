import { type Accessor, createSignal, on, createEffect, onCleanup, onMount } from 'solid-js'
import { metadata } from '~/features/metadata/metadata.store.ts'
import type { Metadata } from '~/features/metadata/types.ts'
import { player } from '~/features/playback/player.store.ts'
import { panels } from '~/features/shell/panels.store.ts'
import { followViewport, viewport } from '~/shared/browser/viewport.store.ts'
import { useMounted } from '~/shared/ui/mounted.store.ts'
import { ARM_STEP_MS, armAngle, armTransition } from './tonearm.ts'
import { sceneScale } from './scale.ts'

/**
 * L'état de la scène Vinyl, lu une fois l'îlot monté : la prod la rendait tout entière
 * dans un `ClientOnly`.
 */
export interface VinylSceneView {
  mounted: Accessor<boolean>
  onAir: Accessor<Metadata | null>
  mixtape: Accessor<boolean>
  /** Le sticker tourne pendant l'écoute. */
  spinning: Accessor<boolean>
  armAngle: Accessor<number>
  armTransition: Accessor<number>
  /** Auditeurs comptés par l'API, l'auditeur courant compris. */
  listeners: Accessor<number>
  scale: Accessor<number>
  details: Accessor<boolean>
  content: Accessor<boolean>
  /** La pochette montre son verso. */
  turned: Accessor<boolean>
  turn: () => void
}

export function useVinylScene(): VinylSceneView {
  const mounted = useMounted()
  const [turned, setTurned] = createSignal(false)
  const [transition, setTransition] = createSignal(ARM_STEP_MS)
  onMount(() => onCleanup(followViewport()))
  createEffect(
    on(metadata.progress, (next, previous) => setTransition(armTransition(previous ?? next, next)), { defer: true }),
  )

  return {
    mounted,
    onAir: () => (mounted() ? metadata.onAir().metadata : null),
    mixtape: () => mounted() && metadata.onAir().type === 'mixtape' && !!metadata.onAir().metadata,
    spinning: () => mounted() && player.state.status === 'playing',
    armAngle: () => (mounted() ? armAngle(metadata.progress()) : 0),
    armTransition: transition,
    listeners: () => (mounted() ? metadata.listeners() : 0),
    scale: () => sceneScale(viewport.width(), viewport.height()),
    details: () => mounted() && panels.details(),
    content: () => mounted() && panels.content(),
    turned,
    turn: () => setTurned(!turned()),
  }
}
