// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // El prototipo de Claude Design vive aquí como referencia del diseño.
    // Es código ajeno que no se compila: se lee, no se mantiene.
    ignores: ['.claude/**'],
  },
  {
    // Orden de los bloques en los .vue: template, luego script, luego style.
    files: ['**/*.vue'],
    rules: {
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    },
  },
)
