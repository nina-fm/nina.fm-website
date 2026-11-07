import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Le site Astro a son propre lint (astro/eslint.config.js), lancé depuis astro/ (#75).
  { ignores: ['astro/**'] },
  {
    ...eslintPluginPrettierRecommended,
    rules: {
      ...eslintPluginPrettierRecommended.rules,
      'vue/multi-word-component-names': 'off',
    },
  },
)
