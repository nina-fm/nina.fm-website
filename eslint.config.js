import { defineConfig, globalIgnores } from 'eslint/config'
import astro from 'eslint-plugin-astro'
import solid from 'eslint-plugin-solid'
import tseslint from 'typescript-eslint'

// Lint d'architecture repris d'ohmyradios : le rôle d'un fichier se lit dans son nom
// (src/CLAUDE.md), et ce lint le fait respecter.

// Ce qu'un fichier pur ne touche pas : le navigateur, et le temps, que seuls les effets planifient.
const BROWSER = [
  'window',
  'document',
  'navigator',
  'location',
  'history',
  'matchMedia',
  'getComputedStyle',
  'fetch',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'queueMicrotask',
  'addEventListener',
  'removeEventListener',
  'innerWidth',
  'innerHeight',
  'scrollX',
  'scrollY',
  'scrollTo',
  'customElements',
  'performance',
  'globalThis',
  'self',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'EventSource',
  'Audio',
]
const browserGlobal = (name) => ({
  name,
  message: 'Un fichier pur ne touche aucune API du navigateur : le déplacer dans un .client.ts ou un .store.ts.',
})

const SOLID = { regex: '^solid-js', message: 'Solid vit dans un .store.ts ou un composant.' }
const ASTRO = { regex: '^astro:', message: 'Les modules astro: sont réservés aux .build.ts.' }
const NODE = { regex: '^node:', message: 'Les modules node: sont réservés aux .build.ts.' }
const BUILD = { regex: '\\.build\\.ts$', message: "Un .build.ts n'atteint jamais le client." }
const IMPURE = { regex: '\\.(store|client)\\.ts$', message: "Un fichier pur n'importe que des fichiers purs." }
const COMPONENT = {
  regex: '\\.(tsx|astro|css)$',
  message: 'Seul un composant importe un composant : sortir la logique.',
}
const FEATURES = {
  regex: '(^~/features/|/features/)',
  message: "src/shared/ sert tous les domaines et n'en importe aucun.",
}

// Dans un composant, Solid ne fait que dessiner : état, effets et dérivés vivent dans des
// hooks, dans un .store.ts de son domaine.
const HOOKS = [
  'batch',
  'createComputed',
  'createEffect',
  'createMemo',
  'createReaction',
  'createRenderEffect',
  'createResource',
  'createRoot',
  'createSignal',
  'on',
  'onCleanup',
  'onMount',
  'untrack',
]
const RENDER_ONLY = [
  {
    name: 'solid-js',
    importNames: HOOKS,
    message: 'Un composant ne fait que dessiner : état et effets dans un hook, dans un .store.ts.',
  },
  { name: 'solid-js/store', message: 'Un store vit dans un .store.ts.' },
]

const CODE = 'src/{features,shared}/**'
const ROLES = [
  {
    name: 'pure',
    files: [`${CODE}/*.ts`],
    ignores: ['**/*.{store,client,build,test,fixture}.ts'],
    patterns: [SOLID, ASTRO, NODE, BUILD, IMPURE, COMPONENT],
    globals: BROWSER.map(browserGlobal),
  },
  { name: 'store', files: [`${CODE}/*.store.ts`], patterns: [ASTRO, NODE, BUILD, COMPONENT] },
  { name: 'client', files: [`${CODE}/*.client.ts`], patterns: [SOLID, ASTRO, NODE, BUILD, COMPONENT] },
  { name: 'component', files: ['src/**/*.tsx'], patterns: [ASTRO, NODE, BUILD], paths: RENDER_ONLY },
]

const typesAllowed = (restriction) => ({ ...restriction, allowTypeImports: true })
const roleBlocks = ROLES.flatMap(({ name, files, ignores = [], patterns, paths = [], globals = [] }) =>
  ['src/shared/**', null].map((shared) => ({
    name: `role/${name}${shared ? '/shared' : ''}`,
    files: shared ? files.map((glob) => glob.replace(/^src\/(\{[^}]+\}\/)?\*\*/, 'src/shared/**')) : files,
    ignores: shared ? ignores : [...ignores, 'src/shared/**'],
    rules: {
      // Les types disparaissent au build : seul ce qui s'exécute est restreint.
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: paths.map(typesAllowed),
          patterns: (shared ? [...patterns, FEATURES] : patterns).map(typesAllowed),
        },
      ],
      'no-restricted-globals': ['error', ...globals],
    },
  })),
)

// Fichiers courts, fonctions courtes ; un composant, qui ne fait que dessiner, reste court aussi.
const SIZE = { skipBlankLines: true, skipComments: true }
const SIZED = { files: [`${CODE}/*.{ts,tsx}`], ignores: ['**/*.{test,fixture}.ts'] }

export default defineConfig([
  globalIgnores(['dist/', '.astro/', 'node_modules/', 'coverage/']),
  tseslint.configs.recommended,
  astro.configs['flat/recommended'],
  { files: ['**/*.{ts,tsx}'], extends: [solid.configs['flat/typescript']] },
  {
    rules: {
      // Un identifiant préfixé d'un souligné est volontairement inutilisé.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  ...roleBlocks,
  { ...SIZED, rules: { 'max-lines': ['error', { max: 150, ...SIZE }] } },
  { ...SIZED, files: [`${CODE}/*.ts`], rules: { 'max-lines-per-function': ['error', { max: 40, ...SIZE }] } },
  { ...SIZED, files: [`${CODE}/*.tsx`], rules: { 'max-lines-per-function': ['error', { max: 100, ...SIZE }] } },
])
