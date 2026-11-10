# 📻 Nina.fm - Website

![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&color=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&color=black)
[![Coverage](https://codecov.io/gh/nina-fm/nina.fm-website/graph/badge.svg?token=AO0UHDQ9FY)](https://codecov.io/gh/nina-fm/nina.fm-website)
[![Deploy](https://github.com/nina-fm/nina.fm-website/actions/workflows/deploy.yml/badge.svg)](https://github.com/nina-fm/nina.fm-website/actions/workflows/deploy.yml)

Site web public de Nina.fm. Diffuse la webradio en temps réel via SSE avec un player thémé (Peak / Vinyl).

## Stack

- **[Astro](https://astro.build/)** statique, servi par nginx — aucun processus Node en prod
- **[Solid](https://www.solidjs.com/)** — îlots interactifs (lecteur, thèmes, préférences)
- **[Tailwind CSS 4](https://tailwindcss.com/)** — styling
- **SSE** — métadonnées en temps réel depuis `nina.fm-api`
- **PWA** — service worker Workbox, mise à jour à l'ouverture de l'app installée

## Démarrage rapide

```bash
pnpm install
cp .env.example .env
pnpm dev
# → http://localhost:4321
```

## Scripts

```bash
pnpm dev          # Développement avec hot-reload
pnpm build        # Build statique dans dist/
pnpm preview      # Aperçu du build

pnpm lint && pnpm type-check && pnpm test
pnpm format
pnpm perf:budget  # Poids du JavaScript, après un build
pnpm changeset
```

## Variables d'environnement

Publiques, figées au build : voir `.env.example`. Seul un build `PUBLIC_SITE_ENV=production`
est indexable.

## Déploiement

À chaque push sur `main` : la prod, https://www.nina.fm (`deploy.yml`, par
`deploy-static.yml`). Détails dans `CLAUDE.md`.
