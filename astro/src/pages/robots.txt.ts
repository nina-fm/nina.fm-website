import type { APIRoute } from 'astro'
import { config } from '~/shared/site/config.ts'
import { robotsTxt } from '~/shared/site/indexing.ts'

export const GET: APIRoute = () => new Response(robotsTxt(config.siteEnv))
