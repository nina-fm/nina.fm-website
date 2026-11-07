import { isProduction } from '~/shared/site/indexing.ts'

const SIZES = [48, 72, 96, 128, 192, 384, 512]

/**
 * Manifest de l'app installable, repris de la config PWA de la prod Nuxt. Hors
 * production, le nom porte « staging » : une app installée depuis le staging ne se
 * confond pas avec la vraie sur l'écran d'accueil.
 */
export function manifest(siteEnv: string | undefined) {
  const name = isProduction(siteEnv) ? 'Nina.fm' : 'Nina.fm staging'
  return {
    name,
    short_name: name,
    description: 'Nina.fm - Webradio artisanale — H24 Musical - Ø Pub',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    lang: 'fr',
    theme_color: '#222222',
    background_color: '#FFFFFF',
    icons: SIZES.flatMap((size) =>
      ['any', 'maskable'].map((purpose) => ({
        src: `/maskable_icon_x${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose,
      })),
    ),
    screenshots: [
      {
        src: '/preview.png',
        sizes: '1200x627',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Nina.fm — Vue desktop',
      },
      { src: '/preview-night.png', sizes: '1200x627', type: 'image/png', label: 'Nina.fm — Vue nuit' },
    ],
  }
}
