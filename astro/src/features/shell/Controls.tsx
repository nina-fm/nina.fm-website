import { Match, Show, Switch } from 'solid-js'
import { toggleMute } from '~/features/playback/mute.store.ts'
import { toggleDarkMode, toggleRainbow, toggleTheme } from '~/features/theme/preferences.store.ts'
import { toggleFullscreen } from '~/shared/browser/fullscreen.store.ts'
import type { ButtonVariant } from '~/shared/ui/button.ts'
import ControlButton from './ControlButton.tsx'
import { useControls } from './controls.store.ts'
import Icon from '~/shared/ui/Icon.tsx'

interface Props {
  variant?: ButtonVariant
  class?: string
}

const twoLines = (title: string, action: string) => (
  <>
    <b>{title}</b>
    <br />
    {action}
  </>
)

/** La colonne de boutons du coin de la scène (`Controls.vue`), commune aux thèmes. */
export default function Controls(props: Props) {
  const view = useControls()
  return (
    <Show when={view.mounted()}>
      <div class="absolute right-1 bottom-1 z-0 flex flex-col items-center justify-end gap-1 md:right-3 md:bottom-3">
        <Show when={view.hasNight()}>
          <ControlButton
            variant={props.variant}
            class={props.class}
            align="end"
            label="Jour ou nuit"
            onClick={toggleDarkMode}
            tooltip={
              <Switch fallback={twoLines('Mode jour', 'Cliquer pour passer en mode lumière automatique')}>
                <Match when={view.darkMode() === 'auto'}>
                  {twoLines('Luminosité automatique', 'Cliquer pour passer en mode nuit')}
                </Match>
                <Match when={view.darkMode() === true}>
                  {twoLines('Mode nuit', 'Cliquer pour passer en mode jour')}
                </Match>
              </Switch>
            }
          >
            <Switch fallback={<Icon name="sun" />}>
              <Match when={view.darkMode() === 'auto'}>
                <Icon name="sun-moon" />
              </Match>
              <Match when={view.darkMode() === true}>
                <Icon name="moon" />
              </Match>
            </Switch>
          </ControlButton>
        </Show>
        <Show when={view.hasRainbow()}>
          <ControlButton
            variant={props.variant}
            class={props.class}
            align="end"
            label="Mode psychédélique"
            onClick={toggleRainbow}
            tooltip={view.rainbow() ? 'Quitter le mode psychédélique' : 'Passer en mode psychédélique'}
          >
            <Show when={view.rainbow()} fallback={<Icon name="candy" />}>
              <Icon name="candy-off" />
            </Show>
          </ControlButton>
        </Show>
        <Show when={view.next()}>
          {(next) => (
            <ControlButton
              variant={props.variant}
              class={props.class}
              align="end"
              label="Changer de thème"
              onClick={toggleTheme}
              tooltip={`Passer au thème ${next().name}`}
            >
              <Show when={next().key === 'vinyl'} fallback={<Icon name="mountain-snow" />}>
                <Icon name="disc-3" />
              </Show>
            </ControlButton>
          )}
        </Show>
        <Show when={view.playing()}>
          <ControlButton
            variant={props.variant}
            class={props.class}
            align="end"
            label={view.muted() ? 'Réactiver le son' : 'Couper le son'}
            onClick={toggleMute}
            tooltip={
              view.muted()
                ? twoLines('Son coupé', 'Cliquer pour réactiver le son')
                : twoLines('Son actif', 'Cliquer pour couper le son')
            }
          >
            <Show when={view.muted()} fallback={<Icon name="volume-2" />}>
              <Icon name="volume-off" />
            </Show>
          </ControlButton>
        </Show>
        <ControlButton
          variant={props.variant}
          class={props.class}
          align="end"
          label="Plein écran"
          onClick={toggleFullscreen}
          tooltip={view.fullscreen() ? 'Quitter le mode plein écran' : 'Passer en mode plein écran'}
        >
          <Show when={view.fullscreen()} fallback={<Icon name="maximize" />}>
            <Icon name="minimize" />
          </Show>
        </ControlButton>
      </div>
    </Show>
  )
}
