import type { JSX } from 'solid-js'
import MenuButton from '~/features/shell/MenuButton.tsx'
import { closeContent, panels, toggleContent } from '~/features/shell/panels.store.ts'
import { VINYL_FILLED } from '~/shared/ui/button.ts'
import { useMounted } from '~/shared/ui/mounted.store.ts'

/**
 * Le panneau de contenu (`ContentPage.vue` de chaque thème), commun : il glisse depuis
 * la droite, plein écran sur mobile, sur la moitié droite au-delà. Ce qui diffère sous
 * Vinyl (marges, bouton plein) s'écrit en variantes `[.theme-vinyl_&]`. Son contenu
 * (About) est rendu au build et passé en enfant. Les panneaux ne sont lus qu'une fois
 * monté : hydraté après une ouverture, l'îlot retrouve d'abord le HTML du build.
 */
export default function ContentPanel(props: { children?: JSX.Element }) {
  const mounted = useMounted()
  const content = () => mounted() && panels.content()
  const details = () => mounted() && panels.details()
  return (
    <>
      {content() && (
        <div
          class="absolute inset-0 z-0 bg-transparent"
          onClick={(event) => (event.preventDefault(), closeContent())}
        />
      )}
      <div class="pointer-events-none absolute inset-0 z-10 flex" classList={{ 'hidden md:flex': details() }}>
        <MenuButton
          open={content()}
          variant="ghost"
          class={`pointer-events-auto ${VINYL_FILLED}`}
          onClick={toggleContent}
        />
        <div
          class="bg-background/90 pointer-events-none absolute inset-y-0 w-full overflow-y-auto transition-all duration-300 ease-in-out md:w-1/2 md:bg-transparent"
          classList={{
            'left-0 md:left-1/2': content() && !details(),
            'left-full': !content() || details(),
          }}
        >
          <div class="pointer-events-auto absolute top-20 right-0 left-0 pb-10 md:top-16 md:right-16 md:left-10 [.theme-vinyl_&]:top-14 md:[.theme-vinyl_&]:top-16 md:[.theme-vinyl_&]:right-10">
            {props.children}
          </div>
        </div>
      </div>
    </>
  )
}
