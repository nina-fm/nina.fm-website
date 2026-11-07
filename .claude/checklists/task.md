# Checklist de planification — nina.fm-website

Étapes propres au repo, déroulées par `/nina:task` après l'exploration du code.

### Où va le code

Placer chaque morceau de code que la tâche ajoute ou change :

- une règle pure (calcul, parsing, transformation de DTO) va dans
  `app/lib/<domaine>/`, avec son test co-localisé — c'est le seul dossier que
  Vitest collecte et que la couverture mesure ;
- l'état et ses actions vont dans un store existant avant d'en envisager un
  nouveau : `app/stores/`, ou `app/themes/<thème>/stores/` pour un état propre à
  un thème ;
- le rendu va dans un composant ; s'il dépend du thème, prévoir sa variante dans
  `app/themes/peak/components/` **et** dans `app/themes/vinyl/components/`, ou dire
  pourquoi un seul thème est concerné ;
- ce qui touche au navigateur (audio, SSE, `localStorage`…) reste côté client :
  nommer la garde prévue (`import.meta.client`, hook client, plugin `.client.ts`).

Pour le site Astro (`astro/`, epic #75), les destinations suivent `astro/CLAUDE.md` :

- une règle pure va dans `astro/src/features/<domaine>/nom.ts` (ou `src/shared/`
  si plusieurs domaines s'en servent), avec son test co-localisé ;
- l'état réactif va dans un `nom.store.ts`, un effet navigateur dans un
  `nom.client.ts`, le rendu dans un `Nom.tsx` sans hook ;
- ce qui touche au navigateur ne s'exécute qu'après le montage d'un îlot
  (`onMount`), jamais au prérendu.

Section du plan : `#### Où va le code`, tableau `| Code | Destination |`.
