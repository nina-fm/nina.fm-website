# CLAUDE.md — nina.fm-website

Site public Nina.fm. Nuxt 4 + Vue 3 + SSR. Webradio SSE, interface Peak/Vinyl thémée, Pinia.

## Stores — vérifier avant d'en créer un nouveau

Ils vivent dans `app/stores/` et, pour l'état propre à un thème, dans `app/themes/<thème>/stores/` : les deux dossiers de `pinia.storesDirs` (`nuxt.config.ts`).

## Conventions

- Pattern : Composant → `useXxxStore()` → `$fetch`/SSE
- Stores Pinia : setup syntax — `defineStore('id', () => {...})`, suivi de `export const useXxxStoreRefs = () => storeToRefs(useXxxStore())` ; un composant lit l'état par `useXxxStoreRefs()` et appelle les actions par `useXxxStore()`
- `computed()` pour les getters dérivés — jamais recalculé inline
- Jamais muter le state depuis les composants — passer par les actions
- `defineProps<T>()` / `defineEmits<T>()` — jamais options API
- Jamais `v-if` et `v-for` sur le même élément — wrapper `<template>`
- Icônes : `import { Play } from 'lucide-vue-next'`

## Thèmes Peak / Vinyl

`themes/peak/components/` → préfixe `Peak`, `themes/vinyl/components/` → préfixe `Vinyl`. Mêmes props, rendu différent. Thème actif : `useThemeStore()`.

## SSR Safety

APIs browser toujours sous `import.meta.client` ou dans un hook client (`onMounted`, `onNuxtReady`, plugin `.client.ts`) : `window`, `document`, `navigator`, `EventSource`, `Audio`, `localStorage`. SSE toujours côté client, par `SseClient` (`app/lib/sse/`), ouvert dans `onNuxtReady` et fermé par `disconnect()` dans `onScopeDispose` (store) ou `onUnmounted` (composant). Env vars : `useRuntimeConfig()` uniquement.

## Plan

Le plan vit dans le Project GitHub **Website** (https://github.com/orgs/nina-fm/projects/4),
pas dans `docs/` ; `NINA_PROJECT` (`.claude/settings.json`) le branche. Les conventions
de pilotage sont dans le `CLAUDE.md` du workspace.
