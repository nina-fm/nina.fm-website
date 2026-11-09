import { For, Show } from 'solid-js'
import { isInterlude } from '~/features/metadata/isInterlude.ts'
import type { Metadata } from '~/features/metadata/types.ts'

/** Le recto de la pochette (`CoverDetails.vue`) : titre, tracklist, signature. */
export default function CoverDetails(props: { onAir: Metadata }) {
  const tracks = () => props.onAir.tracks ?? []
  const single = () => tracks().length === 1
  return (
    <div class="flex size-full flex-col items-center justify-center gap-16">
      <div class="font-condensed text-primary mt-5 mb-10 text-6xl leading-5 font-black">{props.onAir.name}</div>
      <div class="text-center text-xs" classList={{ 'columns-2': tracks().length > 10 }}>
        <For each={tracks()}>
          {(track) => (
            <div class={isInterlude(track) ? 'text-foreground/50 italic' : 'text-primary'}>
              <span class={isInterlude(track) ? 'text-foreground/70 font-normal' : 'text-foreground font-bold'}>
                {track.artist}
              </span>
              <span class="mx-2">•</span>
              {track.title}
            </div>
          )}
        </For>
      </div>
      <Show when={props.onAir.authors_text}>
        {(artist) => (
          <div class="flex flex-col items-center gap-0">
            <span class="text-xs">
              {single() ? 'Un morceau' : 'Une mixtape'}{' '}
              <Show when={props.onAir.year && !single()}>
                <span class="inline-flex">de {props.onAir.year}</span>{' '}
              </Show>
              {single() ? 'de' : 'signée'}
            </span>
            <span class="font-cursive text-primary text-3xl">{artist()}</span>
          </div>
        )}
      </Show>
    </div>
  )
}
