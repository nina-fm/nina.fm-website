import { onCleanup, onMount } from 'solid-js'
import { followOnAir } from '~/features/metadata/metadata.store.ts'
import { detectAutoplay } from '~/shared/browser/detectAutoplay.client.ts'
import { keepScreenOn, lockPortrait } from '~/shared/browser/screen.client.ts'
import { attachElement, detachElement, play } from './controls.client.ts'
import { autoplay } from './autoplay.store.ts'
import { NINA } from './stream.ts'

/**
 * L'îlot du lecteur, monté une fois et persistant (`BaseLayout.astro`) : il confie
 * son élément à `controls.client.ts`, ouvre les flux SSE, garde l'écran allumé et
 * en portrait, puis lance l'écoute si le navigateur permet l'autoplay, comme le
 * site Nuxt. Sinon l'écoute attend un geste (`play` depuis un bouton).
 *
 * Dans cet ordre, une fois chacun : le Nuxt chargeait le flux avant de savoir si
 * l'autoplay était permis (course entre `onBeforeMount` et `onMounted`).
 */
export function useAudioPlayer(): { parts: { audio?: HTMLAudioElement } } {
  const parts: { audio?: HTMLAudioElement } = {}
  onMount(() => {
    if (parts.audio) attachElement(parts.audio)
    const closeFeeds = followOnAir()
    const releaseScreen = keepScreenOn()
    lockPortrait()
    let mounted = true
    void detectAutoplay().then((allowed) => {
      autoplay.settle(allowed)
      if (allowed && mounted) play(NINA)
    })
    onCleanup(() => {
      mounted = false
      releaseScreen()
      closeFeeds()
      detachElement()
    })
  })
  return { parts }
}
