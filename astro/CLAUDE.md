# CLAUDE.md — astro/

Site public Nina.fm en Astro 7 statique + îlots Solid + Tailwind 4, en cours de migration
depuis le Nuxt de la racine (epic #75). Projet autonome : son `package.json`, son lockfile,
ses outils ; toutes les commandes se lancent depuis `astro/`. Socle repris d'ohmyradios
(`~/Sites/ohmyradios`), dont `src/CLAUDE.md` détaille l'architecture.

## Où va le code

- `src/features/<domaine>/` : `playback`, `metadata`, `theme`, `install`… ; `src/shared/` :
  ce que plusieurs domaines utilisent (`site`, `sse`, `browser`), sans importer de domaine.
- Imports entre dossiers par `~/` (`src/`), dans un dossier par `./`, extension `.ts` écrite.
- Tests unitaires à côté du module (`*.test.ts`), environnement Node, sans DOM.

## Le rôle d'un fichier est dans son nom

`eslint.config.js` le fait respecter :

- `nom.ts` : pur. Ni Solid, ni global du navigateur, ni `astro:` / `node:`.
- `nom.store.ts` : état réactif et hooks (Solid, navigateur).
- `nom.client.ts` : effets sans état propre (SSE, audio, service worker). Pas de Solid.
- `nom.build.ts` : build seulement (`astro:*`, `node:*`).
- `Nom.tsx` : composant, rendu seul ; pas de `createSignal`, `createEffect`, `onMount`…

## Jamais un staging indexable

Seul un build `PUBLIC_SITE_ENV=production` est indexable (`src/shared/site/indexing.ts`) :
tout autre build pose `noindex, nofollow` sur chaque page, ferme `robots.txt` et coupe
statcounter. `pnpm check:noindex` le vérifie sur `dist/` et en ligne (`deploy-staging.yml`),
et le conteneur comme le reverse proxy posent `X-Robots-Tag`.

## Dépendances

- `pnpm.overrides` épingle `@emnapi/runtime` en 1.11 : la 2.0 bêta, tirée par la liaison
  wasm de rolldown, fait planter `astro check` au chargement de `@astrojs/check`.

## Staging

`deploy-staging.yml`, sur push `main` touchant `astro/` : validation, build sur le runner,
copie dans `releases/` sur le serveur, bascule du lien `current`, servi par
`deploy/docker-compose.yml` (`nginx:1.30-alpine`, projet Compose `nina-website-staging`).
