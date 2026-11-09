import type { GenerateSWOptions } from 'workbox-build'

/** Chargé en tête du service worker, avant toute route Workbox. */
export const STREAM_GUARD = 'sw-guard.js'

/**
 * Options du service worker, sans effet de bord pour être testées.
 *
 * Précache : pages, scripts, styles et manifest. Rien n'est mis en
 * cache à l'exécution ; le flux audio et l'API, sur d'autres origines, ne passent pas
 * par le service worker (`public/sw-guard.js`).
 */
export function serviceWorkerOptions(distDir: string): GenerateSWOptions {
  return {
    globDirectory: distDir,
    // Comme la prod Nuxt (défaut de vite-pwa) : pages, scripts, styles et manifest. Polices
    // et images restent au cache HTTP du navigateur, pour une première visite légère.
    globPatterns: ['**/*.{html,js,css,webmanifest}'],
    // Le service worker et sa garde se mettent à jour par la vérification du navigateur,
    // jamais par le précache.
    globIgnores: ['sw.js', 'workbox-*.js', STREAM_GUARD],
    swDest: `${distDir}/sw.js`,
    importScripts: [STREAM_GUARD],
    // Les fichiers de _astro/ portent un hash de contenu dans leur nom.
    dontCacheBustURLsMatching: /^_astro\//,
    runtimeCaching: [],
    skipWaiting: true,
    clientsClaim: true,
    sourcemap: false,
  }
}
