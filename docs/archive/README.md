# Archive — guides de migration

Guides du passage de PM2 à Docker (novembre 2025), gardés pour l'historique : la
migration est faite, et ils décrivent des fichiers qui n'existent plus
(`ecosystem.config.cjs`, `docker-compose.prod.yml`, `cd.yml`, `.env.prod`).

- `MIGRATION-DOCKER.md` — première dockerisation, build sur le serveur.
- `DEPLOYMENT.md` — passage au build en CI et à l'image GHCR.

Le déploiement courant se lit dans `.github/workflows/deploy.yml` (secrets, variables,
dossier `/var/nina/website` sur le serveur) et `docker-compose.yml`. La configuration
nginx de `www.nina.fm` vit dans nina.fm-webserver
(`nina.fm-infra-workspace/nina.fm-webserver/nginx/conf.d/www.nina.fm.conf`).
