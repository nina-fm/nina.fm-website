# Checklist de review — nina.fm-website

Ce que le tronc commun de `/nina:review` ne couvre pas : rôles des fichiers du site
Astro, lecteur, thèmes Peak / Vinyl, budget de performance, indexation et déploiement.
Les règles génériques (TypeScript, tests, sécurité, langue, changeset, recette)
vivent dans la commande — ne pas les recopier ici.

#### Code du site (`src/**`)

- [ ] Le rôle du fichier tient à son nom (`CLAUDE.md`) : `.ts` pur, `.store.ts` état Solid, `.client.ts` effet navigateur sans Solid, `.tsx` rendu sans hook ; une règle pure sortie d'un store va dans un `.ts` avec son test
- [ ] Les tests vivent à côté du module (`vitest.config.ts` collecte `src/**/*.test.ts` et `scripts/**/*.test.ts`), et une donnée de test partagée dans un `.fixture.ts`
- [ ] `play()` s'appelle dans la tâche même du geste (iOS), jamais depuis un effet ni après un `await`
- [ ] Un îlot ne lit l'état de module (`player`, `metadata`) qu'après `onMount` : hydraté après un changement, il garderait sinon les valeurs du rendu statique
- [ ] Un changement porté par un thème est vérifié sur l'autre : le reporter, ou dire dans la PR pourquoi il ne s'y applique pas
- [ ] Le JavaScript ajouté tient dans le budget (`pnpm perf:budget`) ; un budget relevé l'est sciemment, daté, dans `scripts/performance-budget.ts`

#### Indexation et déploiement (`deploy/**`, `.github/workflows/**`, `src/shared/site/**`)

- [ ] La prod reste ouverte aux moteurs : aucun `X-Robots-Tag` dans `nginx.production.conf` ; tout build autre que la prod reste fermé (`src/shared/site/indexing.ts`)
- [ ] Pages et `sw.js` en `no-cache`, rien sur `/_astro/` : le cache long est au reverse proxy
