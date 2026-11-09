import { createEffect, createSignal, on } from 'solid-js'
import { metadata } from '~/features/metadata/metadata.store.ts'

/**
 * Les deux panneaux de la scène, exclusifs : les détails de la mixtape et le contenu
 * (About). Communs aux thèmes, chacun les dessine à sa façon (`peakTheme.ts`,
 * `vinylTheme.ts` dans la prod).
 */

const [details, setDetails] = createSignal(false)
const [content, setContent] = createSignal(false)

export const panels = { details, content }

export function openDetails(): void {
  setContent(false)
  setDetails(true)
}

export function closeDetails(): void {
  setDetails(false)
}

export function toggleDetails(): void {
  if (details()) closeDetails()
  else openDetails()
}

export function openContent(): void {
  setDetails(false)
  setContent(true)
}

export function closeContent(): void {
  setContent(false)
}

export function toggleContent(): void {
  if (content()) closeContent()
  else openContent()
}

/** Ferme les détails quand la mixtape laisse la place à un morceau ou à rien, comme la prod. */
export function closeDetailsOffMixtape(): void {
  createEffect(
    on(
      () => metadata.onAir().type === 'mixtape',
      (mixtape) => {
        if (!mixtape) closeDetails()
      },
      { defer: true },
    ),
  )
}
