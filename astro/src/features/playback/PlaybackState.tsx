import { Show } from 'solid-js'
import { play, stop } from './controls.client.ts'
import { usePlaybackState } from './playback-state.store.ts'
import { NINA } from './stream.ts'

/**
 * Page brute de recette (website#77) : l'état du lecteur et des flux SSE, sans
 * thème. Remplacée par la coquille et Peak (website#78).
 */
export default function PlaybackState() {
  const state = usePlaybackState()
  return (
    <section class="space-y-4 p-4 font-mono text-sm" data-testid="playback-state">
      <h1 class="text-xl">Nina.fm — état de l'écoute</h1>
      <div class="flex gap-2">
        <button type="button" class="border px-3 py-1" data-testid="play" onClick={() => play(NINA)}>
          Lancer
        </button>
        <button type="button" class="border px-3 py-1" data-testid="stop" onClick={() => stop()}>
          Arrêter
        </button>
      </div>
      <dl class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
        <dt>Statut</dt>
        <dd data-testid="status">{state.status()}</dd>
        <dt>Écoute en cours</dt>
        <dd>{state.listening() ? 'oui' : 'non'}</dd>
        <dt>Autoplay</dt>
        <dd data-testid="autoplay">{state.autoplay()}</dd>
        <dt>En ligne</dt>
        <dd>{state.online() ? 'oui' : 'non'}</dd>
        <dt>À l'antenne</dt>
        <dd data-testid="on-air-type">{state.type() ?? 'rien'}</dd>
        <dt>Nom</dt>
        <dd data-testid="on-air-name">{state.name()}</dd>
        <dt>DJs</dt>
        <dd>{state.djs()}</dd>
        <dt>Progression</dt>
        <dd data-testid="progress">{state.progress()} %</dd>
        <dt>Auditeurs (API)</dt>
        <dd data-testid="listeners">{state.listeners()}</dd>
        <dt>Auditeurs affichés</dt>
        <dd data-testid="audience">{state.audience()}</dd>
      </dl>
      <Show when={state.cover()}>{(cover) => <img src={cover()} alt="" width="192" height="192" />}</Show>
    </section>
  )
}
