# CLAUDE.md — nina.fm-website

Site public Nina.fm en Astro 7 statique + îlots Solid + Tailwind 4, servi par nginx, sans
processus Node. Il remplace à l'identique le site Nuxt (epic #75), dont le code reste dans
l'historique git. Socle repris d'ohmyradios (`~/Sites/ohmyradios`), dont `src/CLAUDE.md`
détaille l'architecture.

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
statcounter. `pnpm check:indexing <noindex|indexable>` vérifie l'attendu sur `dist/` et en
ligne. Au staging, le conteneur comme le reverse proxy posent `X-Robots-Tag` ; en prod,
aucun des deux (`deploy/nginx.production.conf`).

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

Écran verrouillé, un iPhone suspend une page muette en 13 à 16 s : une écoute perdue
reste sonore, par un silence Web Audio lancé page cachée seulement
(`keep-awake.client.ts`), et reprend seule au retour du réseau. `playing` ne prouve
pas que le son sort : le chien de garde vérifie que `currentTime` avance. Un appel,
lui, retire le lecteur de l'écran verrouillé jusqu'au déverrouillage, sans parade
(website#92).

## App installée

À chaque ouverture, l'app installée vérifie s'il existe une nouvelle version, sous
l'écran de lancement (`install/launch.ts`, `Launch.astro`), et se recharge dessus
seulement si aucune écoute n'est en jeu (`install/register.client.ts`, repris
d'ohmyradios). L'écran ne reste que le temps nécessaire : coquille montée, vérification
finie. Ses étapes (`data-update` : `checking`, `installing`, `ready`) se montrent en CSS ;
l'avancement de l'installation, la page le lit dans le cache du service worker
(`install/precache-progress.ts`) : le `sw.js` de Workbox n'en dit rien.

## Dépendances

- `pnpm.overrides` épingle `@emnapi/runtime` en 1.11 : la 2.0 bêta, tirée par la liaison
  wasm de rolldown, fait planter `astro check` au chargement de `@astrojs/check`.

## Déploiements

À chaque push sur `main`, `deploy-staging.yml` et `deploy.yml` passent par le même
`deploy-static.yml` : build sur le runner (`validate.yml`), copie dans `releases/` sur le
serveur, bascule du lien `current`, servi par `nginx:1.30-alpine`
(`deploy/docker-compose.<env>.yml`, `deploy/nginx.<env>.conf`). Pages et `sw.js` en
`no-cache` ; chaque release reprend les fichiers `_astro/` des builds des 30 derniers jours,
pour une page ancienne encore ouverte. Retour arrière : rebasculer `current` sur la release
précédente, gardée.

- Staging : https://staging.nina.fm, `/var/nina/website-staging`, `nina-website-staging`
  sur le port 3001, fermé aux moteurs.
- Prod : https://www.nina.fm, `/var/nina/website` (site servi dans `site/`, seul monté),
  `nina-website` sur le port 3000, indexable. Seul `deploy.yml` versionne
  (changesets, tag, GitHub Release).

Chaque déploiement vérifie le conteneur sur le serveur, puis le site en ligne à travers le
reverse proxy (nina.fm-webserver) : page du commit, `no-cache`, indexation attendue.

## Plan

Le plan vit dans le Project GitHub **Website** (https://github.com/orgs/nina-fm/projects/4) ;
`NINA_PROJECT` (`.claude/settings.json`) le branche. Les conventions de pilotage sont dans le
`CLAUDE.md` du workspace.
