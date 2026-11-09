# Checklist de planification — nina.fm-website

Étapes propres au repo, déroulées par `/nina:task` après l'exploration du code.

### Où va le code

Placer chaque morceau de code que la tâche ajoute ou change, d'après `CLAUDE.md` :

- une règle pure va dans `src/features/<domaine>/nom.ts` (ou `src/shared/` si
  plusieurs domaines s'en servent), avec son test co-localisé ;
- l'état réactif va dans un `nom.store.ts`, un effet navigateur dans un
  `nom.client.ts`, le rendu dans un `Nom.tsx` sans hook ;
- ce qui touche au navigateur ne s'exécute qu'après le montage d'un îlot
  (`onMount`), jamais au prérendu ;
- ce qui dépend du thème se prévoit pour Peak **et** Vinyl, ou dit pourquoi un seul
  thème est concerné.

Section du plan : `#### Où va le code`, tableau `| Code | Destination |`.
