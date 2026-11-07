import { createSignal } from 'solid-js'

/** Ce que le navigateur répond à l'autoplay : pas encore su, permis, ou bloqué (un geste lancera l'écoute). */
export type Autoplay = 'unknown' | 'allowed' | 'blocked'

const [state, setState] = createSignal<Autoplay>('unknown')

/** La réponse à l'autoplay, détectée une seule fois par l'îlot du lecteur (`audio-player.store.ts`). */
export const autoplay = {
  state,
  settle(allowed: boolean): void {
    setState(allowed ? 'allowed' : 'blocked')
  },
}
