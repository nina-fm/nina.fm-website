import type { AstroIntegration } from 'astro'
import { fileURLToPath } from 'node:url'
import { generateSW } from 'workbox-build'
import { serviceWorkerOptions } from './service-worker.build.ts'

/**
 * Génère le service worker une fois le site écrit par Astro (repris d'ohmyradios).
 * `@vite-pwa/astro` ne gère pas Astro 7 ; tourner sur `astro:build:done` permet de
 * précacher les pages HTML, ce qu'un plugin Vite ferait trop tôt.
 */
export default function pwa(): AstroIntegration {
  return {
    name: 'ninafm:pwa',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const { count, size, warnings } = await generateSW(serviceWorkerOptions(fileURLToPath(dir)))
        for (const warning of warnings) logger.warn(warning)
        logger.info(`service worker : ${count} fichiers précachés (${(size / 1024).toFixed(1)} ko)`)
      },
    },
  }
}
