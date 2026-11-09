import { type JSX, Show } from 'solid-js'
import Tooltip from '~/shared/ui/Tooltip.tsx'
import { type ButtonVariant, controlButtonClass } from '~/shared/ui/button.ts'

interface Props {
  children: JSX.Element
  onClick: () => void
  /** Nom du bouton pour les lecteurs d'écran. */
  label: string
  tooltip?: JSX.Element
  variant?: ButtonVariant
  class?: string
  align?: 'center' | 'end'
}

/** Le bouton rond à icône de la coquille, avec son info-bulle (`ControlButton.vue`). */
export default function ControlButton(props: Props) {
  const button = () => (
    <button
      type="button"
      tabindex="-1"
      aria-label={props.label}
      class={`${controlButtonClass(props.variant ?? 'ghost')} ${props.class ?? ''}`}
      onClick={() => props.onClick()}
    >
      {props.children}
    </button>
  )
  return (
    <Show when={props.tooltip} fallback={button()}>
      {(tooltip) => (
        <Tooltip content={tooltip()} align={props.align ?? 'center'}>
          {button()}
        </Tooltip>
      )}
    </Show>
  )
}
