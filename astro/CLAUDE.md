# CLAUDE.md — astro/

Site public Nina.fm en Astro 7 statique + îlots Solid + Tailwind 4, en cours de migration
depuis le Nuxt de la racine (epic #75). Projet autonome : son `package.json`, son lockfile,
ses outils ; toutes les commandes se lancent depuis `astro/`. Socle repris d'ohmyradios
(`~/Sites/ohmyradios`), dont `src/CLAUDE.md` détaille l'architecture.

## Où va le code

- `src/features/<domaine>/` : `playback`, `metadata`, `theme` (préférences), `shell` (coquille
  commune aux thèmes), `peak`, `content`, `install`… ; `src/shared/` : ce que plusieurs
  domaines utilisent (`site`, `sse`, `browser`, `ui`), sans importer de domaine.
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

## Thème et coquille

Les préférences restent dans les cookies de la prod (`ninafm-user-theme`, `-darkMode`,
`-rainbowMode`, format `useCookie`) : `theme/preferences.ts`. Un script bloquant, premier
enfant du `<body>`, pose `data-theme` et les classes avant le premier affichage
(`theme/boot.ts`, recopie de fonctions pures : il ne lit rien hors de ses paramètres) ;
l'îlot persistant de la coquille les tient ensuite à jour. `.dark` est sur le `<body>`.
Pas de `tailwind-merge` : chaque usage d'un bouton écrit ses classes fusionnées
(`shared/ui/button.ts`). Une couleur translucide nouvelle reçoit son repli sans
`color-mix` dans `styles/global.css`.

Les deux scènes sont dans la page, chacune sous un `hidden [.theme-<clé>_&]:contents` :
le `data-theme` du `<body>` en montre une, et la bascule de thème ne recharge rien. Ce
que le thème change dans la coquille commune s'écrit en variantes `[.theme-vinyl_&]`,
juste dès le HTML du build. Un `@utility` ou un `@theme` va dans `styles/global.css` :
les feuilles des thèmes ne passent pas par Tailwind, il y serait ignoré (website#79).

Une image qui dépend du jour ou de l'écoute se choisit en CSS d'après les classes du
`<body>` (`peak/images.ts`, `peak.css`), jamais au build ni dans un îlot : seule celle
qui s'affiche se télécharge.

## Lecteur

Un seul lecteur par page : l'état de `features/playback/` est de module, partagé par les
îlots et gardé entre les pages par l'îlot persistant (`BaseLayout.astro`) ;
`install/same-build.client.ts` recharge la page quand un nouveau build changerait de module.
`play()` s'appelle dans la tâche même du geste (iOS), jamais depuis un effet.

## Dépendances

- `pnpm.overrides` épingle `@emnapi/runtime` en 1.11 : la 2.0 bêta, tirée par la liaison
  wasm de rolldown, fait planter `astro check` au chargement de `@astrojs/check`.

## Staging

`deploy-staging.yml`, sur push `main` touchant `astro/` : validation, build sur le runner,
copie dans `releases/` sur le serveur, bascule du lien `current`, servi par
`deploy/docker-compose.yml` (`nginx:1.30-alpine`, projet Compose `nina-website-staging`).
