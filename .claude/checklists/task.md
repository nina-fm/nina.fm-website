# Checklist de planification — nina.fm-website

Étapes propres au repo, déroulées par `/nina:task` après l'exploration du code.

### Où va le code

Placer chaque morceau de code que la tâche ajoute ou change :

- une règle pure (calcul, parsing, transformation de DTO) va dans
  `app/lib/<domaine>/`, avec son test co-localisé — c'est le seul dossier que
  Vitest collecte et que la couverture mesure ;
- l'état et ses actions vont dans un store existant de `app/stores/` avant d'en
  envisager un nouveau ;
- le rendu va dans un composant ; s'il dépend du thème, prévoir sa variante dans
  `themes/peak/components/` **et** dans `themes/vinyl/components/`, ou dire
  pourquoi un seul thème est concerné ;
- ce qui touche au navigateur (audio, SSE, `localStorage`…) reste côté client :
  nommer la garde prévue (`import.meta.client`, hook client, plugin `.client.ts`).

Section du plan : `#### Où va le code`, tableau `| Code | Destination |`.
