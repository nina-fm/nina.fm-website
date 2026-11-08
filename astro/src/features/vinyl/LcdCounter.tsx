import { Show } from 'solid-js'
import Icon from '~/shared/ui/Icon.tsx'
import Tooltip from '~/shared/ui/Tooltip.tsx'
import { lcdDigits, lcdTooltip } from './lcd.ts'

/**
 * Le compteur LCD des auditeurs (`LcdCounter.vue`), sous le bras. Ses classes sont
 * celles de la carte shadcn fusionnées avec les siennes. La prod y écrivait aussi
 * `md:portrait::-right-8`, que Tailwind ignorait : corrigé, il poussait le compteur
 * hors du cadre en portrait `md` (14 px visibles sur 820 × 1180, website#61). Il est
 * retiré, `sm:portrait:right-44` vaut au-delà comme dans la prod.
 */
export default function LcdCounter(props: { count: number }) {
  const digits = () => lcdDigits(props.count)
  return (
    <Show when={props.count > 0}>
      <div class="border-muted/20 text-card-foreground absolute right-10 bottom-16 cursor-default rounded-2xl border-2 bg-transparent shadow-sm sm:portrait:right-44 sm:portrait:-bottom-6 md:portrait:-bottom-8 sm:landscape:-right-20 sm:landscape:bottom-36 md:landscape:right-3 md:landscape:bottom-28 lg:landscape:-right-10">
        <Tooltip content={lcdTooltip(props.count)}>
          <div class="bg-background m-0 rounded-xl px-3 py-2">
            <div class="flex items-center gap-3">
              <Icon name="headphones" class="text-primary/30" />
              <div class="bg-muted rounded-md px-2 py-0">
                <div class="font-lcd text-xl tracking-wider">
                  <span class="text-foreground/20">{digits().padding}</span>
                  <span class="text-primary">{digits().value}</span>
                </div>
              </div>
            </div>
          </div>
        </Tooltip>
      </div>
    </Show>
  )
}
