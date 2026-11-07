// @ts-check
import solid from '@astrojs/solid-js'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import pwa from './src/features/install/integration.build.ts'
import { missingConfig } from './src/shared/site/config.ts'
import { SITE } from './src/shared/site/site.ts'

// Un build déployé sans flux ni API livrerait un site muet : il échoue ici (website#77).
const missing = missingConfig({ ...loadEnv(process.env.NODE_ENV ?? '', process.cwd(), 'PUBLIC_'), ...process.env })
if (missing.length > 0) throw new Error(`Variables manquantes pour ce build : ${missing.join(', ')}`)

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
