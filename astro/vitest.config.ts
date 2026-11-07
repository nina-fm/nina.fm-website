import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // L'alias `~/` du tsconfig.json, que Vitest ne lit pas.
    alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // Tests unitaires à côté de leur module ; environnement Node, le DOM ne se teste pas ici.
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
})
