import { For } from 'solid-js'
import Tooltip from '~/shared/ui/Tooltip.tsx'
import type { Star } from './stars.ts'

/**
 * La constellation des auditeurs (`Audience.vue`) : une étoile par autre auditeur, et
 * l'info-bulle qui les compte tous, l'auditeur courant compris. La prod y affichait les
 * autres seulement (website#61).
 */
export default function Audience(props: { stars: readonly Star[]; listeners: number }) {
  return (
    <div class="absolute top-0 right-0 bottom-0 left-0 h-full w-full">
      <For each={props.stars}>
        {(star) => (
          <div class="absolute top-0 left-0" style={{ left: `${star.left}%`, top: `${star.top}%` }}>
            <Tooltip
              size="text-2xs"
              content={
                <>
                  <strong>Une constellation d'auditeurs !</strong>
                  <br />
                  Actuellement {props.listeners} personnes écoutent Nina.fm.
                </>
              }
            >
              <div class="p-3 transition-transform duration-200 ease-in-out hover:scale-[2]">
                <div
                  class="peak-star h-0 w-0 rounded-full bg-white"
                  style={{ width: `${star.size}px`, height: `${star.size}px`, opacity: star.opacity }}
                />
              </div>
            </Tooltip>
          </div>
        )}
      </For>
    </div>
  )
}
