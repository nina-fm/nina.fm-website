import type { APIRoute } from 'astro'
import { manifest } from '~/features/install/manifest.ts'
import { config } from '~/shared/site/config.ts'

export const GET: APIRoute = () =>
  new Response(JSON.stringify(manifest(config.siteEnv)), {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
