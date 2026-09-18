# Checklist de review — nina.fm-website

Ce que le tronc commun de `/nina:review` ne couvre pas : Nuxt en SSR, conventions
Vue 3 et Pinia, thèmes Peak / Vinyl, logique pure de `app/lib/`.
Les règles génériques (TypeScript, tests, sécurité, langue, changeset, recette)
vivent dans la commande — ne pas les recopier ici.

#### Nuxt en SSR (`app/**`)
- [ ] `window`, `document`, `navigator`, `EventSource`, `Audio` et `localStorage` ne sont touchés que sous `import.meta.client` ou dans un hook client (`onMounted`, plugin `.client.ts`)
- [ ] Le SSE passe par `SseClient` (`app/lib/sse/`), jamais par un `EventSource` ouvert à la main, et chaque client ouvert est fermé (`disconnect()` dans `onScopeDispose` ou `onUnmounted`)
- [ ] Variables d'environnement lues par `useRuntimeConfig()` : `process.env` ne sert que dans `nuxt.config.ts`
- [ ] Aucune URL d'API ou de stream en dur — elles viennent de `runtimeConfig.public`

#### Composants Vue (`app/**/*.vue`)
- [ ] `defineProps<T>()` et `defineEmits<T>()` génériques, jamais l'options API
- [ ] Valeur dérivée en `computed()`, jamais recalculée inline dans le template
- [ ] `watch()` / `watchEffect()` réservés aux effets de bord, pas au calcul d'une valeur dérivée
- [ ] Pas de `v-if` et `v-for` sur le même élément (wrapper `<template>`) ; `:key` sur chaque `v-for`
- [ ] Aucune règle métier dans un `.vue` : elle va dans `app/lib/` (avec son test) ou dans une action de store
- [ ] Primitives UI prises dans `app/components/ui/` (shadcn-vue), pas réinventées
- [ ] Icônes importées depuis `lucide-vue-next` (`import { Play } from 'lucide-vue-next'`)

#### Thèmes Peak / Vinyl (`app/themes/**`)
- [ ] Composant de `themes/peak/components/` préfixé `Peak`, de `themes/vinyl/components/` préfixé `Vinyl`
- [ ] Deux variantes d'un même composant gardent les mêmes props
- [ ] Un changement porté par un thème est vérifié sur l'autre : le reporter, ou dire dans la PR pourquoi il ne s'y applique pas

#### Stores Pinia (`app/stores/**`)
- [ ] Syntaxe setup — `defineStore('id', () => { … })`
- [ ] Nouveau store : aucun store existant de `app/stores/` ne couvrait déjà le besoin
- [ ] État muté seulement par les actions du store, jamais depuis un composant

#### Logique pure et tests (tout le repo)
- [ ] Vitest ne collecte que `app/lib/**/*.test.ts` (`vitest.config.ts`) : un test posé ailleurs ne tourne jamais — la logique testable va dans `app/lib/`
- [ ] Une fonction pure extraite d'un store ou d'un composant arrive dans `app/lib/<domaine>/` avec son test : le seuil de couverture de 80 % porte sur `app/lib/` (hors `browser/`)
