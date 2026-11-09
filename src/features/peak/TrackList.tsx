import { For } from 'solid-js'
import { isInterlude } from '~/features/metadata/isInterlude.ts'
import type { Track } from '~/features/metadata/types.ts'

/** La tracklist numérotée (`TrackList.vue`), interludes en retrait. */
export default function TrackList(props: { tracks: readonly Track[] }) {
  return (
    <ul class="flex flex-col">
      <For each={props.tracks}>
        {(track, index) => (
          <li class="flex gap-4">
            <span class="w-3 text-right">{index() + 1}</span>
            <span classList={{ 'italic text-foreground/50': isInterlude(track) }}>
              <span class={isInterlude(track) ? 'text-foreground/70 font-normal' : 'font-bold'}>{track.artist}</span>
              {' – '}
              <span>{track.title}</span>
            </span>
          </li>
        )}
      </For>
    </ul>
  )
}
