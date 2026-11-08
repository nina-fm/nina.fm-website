import type { JSX } from 'solid-js'
import MenuButton from '~/features/shell/MenuButton.tsx'
import { closeContent, panels, toggleContent } from '~/features/shell/panels.store.ts'

/**
 * Le panneau de contenu de Peak (`themes/peak/components/ContentPage.vue`) : il glisse
 * depuis la droite, plein écran sur mobile, sur la moitié droite au-delà. Son contenu
 * (About) est rendu au build et passé en enfant.
 */
export default function ContentPanel(props: { children?: JSX.Element }) {
  return (
    <>
      {panels.content() && (
        <div
          class="absolute inset-0 z-0 bg-transparent"
          onClick={(event) => (event.preventDefault(), closeContent())}
        />
      )}
      <div class="pointer-events-none absolute inset-0 z-10 flex" classList={{ 'hidden md:flex': panels.details() }}>
        <MenuButton open={panels.content()} variant="ghost" class="pointer-events-auto" onClick={toggleContent} />
        <div
          class="bg-background/90 pointer-events-none absolute inset-y-0 w-full overflow-y-auto transition-all duration-300 ease-in-out md:w-1/2 md:bg-transparent"
          classList={{
            'left-0 md:left-1/2': panels.content() && !panels.details(),
            'left-full': !panels.content() || panels.details(),
          }}
        >
          <div class="pointer-events-auto absolute top-20 right-0 left-0 pb-10 md:top-16 md:right-16 md:left-10">
            {props.children}
          </div>
        </div>
      </div>
    </>
  )
}
