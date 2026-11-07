// @ts-check
import solid from '@astrojs/solid-js'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import pwa from './src/features/install/integration.build.ts'
import { SITE } from './src/shared/site/site.ts'

// Sortie entièrement statique, servie par nginx (staging, puis prod en #80).
export default defineConfig({
  output: 'static',
  site: SITE,
  integrations: [solid(), pwa()],
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
})
