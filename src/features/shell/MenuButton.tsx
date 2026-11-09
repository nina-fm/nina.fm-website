import { Show } from 'solid-js'
import type { ButtonVariant } from '~/shared/ui/button.ts'
import ControlButton from './ControlButton.tsx'
import Icon from '~/shared/ui/Icon.tsx'

interface Props {
  open: boolean
  onClick: () => void
  variant?: ButtonVariant
  class?: string
}

/** Le bouton du panneau de contenu, en haut à droite : télescope, ou croix ouvert (`MenuButton.vue`). */
export default function MenuButton(props: Props) {
  return (
    <ControlButton
      variant={props.variant ?? 'default'}
      label={props.open ? 'Fermer' : 'À propos de Nina.fm'}
      class={`absolute top-1 right-1 z-10 md:top-2 md:right-2 ${props.class ?? ''}`}
      onClick={props.onClick}
    >
      <Show when={props.open} fallback={<Icon name="telescope" />}>
        <Icon name="x" />
      </Show>
    </ControlButton>
  )
}
