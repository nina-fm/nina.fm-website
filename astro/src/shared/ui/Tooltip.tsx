import type { JSX } from 'solid-js'

interface Props {
  content: JSX.Element
  children: JSX.Element
  /** `end` : aligné sur le bord droit du déclencheur, pour ceux du bord de l'écran. */
  align?: 'center' | 'end'
  /** Taille du texte, `text-xs` par défaut. */
  size?: string
}

/**
 * L'info-bulle de la prod (reka-ui, `TooltipContent` avec flèche), en CSS seul : au
 * survol d'un pointeur, après 700 ms comme reka, au-dessus du déclencheur à 4 px plus
 * la flèche. Le tactile ne l'ouvre pas, pas plus que reka.
 */
export default function Tooltip(props: Props) {
  const end = () => props.align === 'end'
  return (
    <span class="group/tooltip relative inline-flex">
      {props.children}
      <span
        role="tooltip"
        class="bg-popover text-popover-foreground pointer-events-none absolute bottom-full z-50 mb-[9px] translate-y-2 scale-95 rounded-md px-3 py-1.5 whitespace-nowrap opacity-0 transition-[opacity,scale,translate] duration-150 group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 group-hover/tooltip:delay-700"
        classList={{
          'right-0 origin-bottom-right': end(),
          'left-1/2 -translate-x-1/2 origin-bottom': !end(),
          [props.size ?? 'text-xs']: true,
        }}
      >
        {props.content}
        <svg
          class="fill-popover absolute top-full"
          classList={{ 'right-[13px]': end(), 'left-1/2 -translate-x-1/2': !end() }}
          width="10"
          height="5"
          viewBox="0 0 30 10"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points="0,0 30,0 15,10" />
        </svg>
      </span>
    </span>
  )
}
