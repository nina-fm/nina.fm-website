import { createEffect, on } from 'solid-js'
import { autoplay } from '~/features/playback/autoplay.store.ts'
import { player } from '~/features/playback/player.store.ts'
import { dismissToast, showToast, toaster } from '~/shared/ui/toast.store.ts'
import { relaunch } from './actions.client.ts'
import { RECONNECTING, noticeFor } from './notices.ts'

/** Traduit chaque changement de statut du lecteur en toast (`notices.ts`). */
export function followNotices(): void {
  createEffect(
    on(
      () => player.state.status,
      (next, previous) => {
        if (previous === undefined) return
        const context = { locked: autoplay.state() === 'blocked', recovering: toaster.has(RECONNECTING) }
        const change = noticeFor(previous, next, context)
        if (!change) return
        if ('dismiss' in change) return dismissToast(change.dismiss)
        const { show } = change
        const action = show.retry ? { label: 'Réessayer', run: relaunch } : undefined
        showToast({ id: show.id, kind: show.kind, message: show.message, ...(action ? { action } : {}) }, show.duration)
      },
    ),
  )
}
