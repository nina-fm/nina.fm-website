import { Show } from 'solid-js'
import type { Metadata } from '~/features/metadata/types.ts'
import { closeDetails } from '~/features/shell/panels.store.ts'
import Progress from '~/shared/ui/Progress.tsx'
import TrackList from './TrackList.tsx'

interface Props {
  open: boolean
  onAir: Metadata | null
  progress: number
}

/**
 * Les détails de la mixtape (`MixtapeDetails.vue`), qui glissent depuis la gauche :
 * pochette et progression, DJs, tracklist, ou à défaut sa version texte, retours à la
 * ligne compris (la prod écrivait `white-space-pre-line`, classe inexistante).
 */
export default function MixtapeDetails(props: Props) {
  const tracks = () => props.onAir?.tracks ?? []
  return (
    <>
      <Show when={props.open}>
        <div
          class="absolute inset-0 z-0 bg-transparent"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            closeDetails()
          }}
        />
      </Show>
      <div
        class={`peak-details bg-background absolute inset-y-0 z-0 w-full md:w-1/2 ${props.open ? 'left-0 md:left-0' : '-left-full md:-left-1/2'}`}
      >
        <div class="absolute inset-0 top-14 overflow-x-hidden overflow-y-auto">
          <div class="font-condensed after:from-background absolute top-0 right-2 bottom-5 left-2 flex flex-col gap-3 text-sm after:sticky after:inset-x-0 after:bottom-0 after:z-10 after:min-h-16 after:bg-gradient-to-t after:to-transparent after:content-[''] md:right-10 md:left-5">
            <Show when={props.onAir?.cover_url}>
              {(cover) => (
                <div class="flex flex-col gap-2">
                  <img src={cover()} alt="" />
                  <Progress value={props.progress} class="h-0.5" />
                </div>
              )}
            </Show>
            <div class="space-x-1 text-right">
              <span>
                Une mixtape{' '}
                <Show when={props.onAir?.year}>{(year) => <span class="inline-flex">de {year()}</span>}</Show> signée
              </span>
              <span class="font-bold">{props.onAir?.authors_text}</span>
            </div>
            <div data-type="tracklist" class="pb-14">
              <Show
                when={tracks().length > 0}
                fallback={<div class="whitespace-pre-line">{props.onAir?.tracks_text}</div>}
              >
                <TrackList tracks={tracks()} />
              </Show>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
