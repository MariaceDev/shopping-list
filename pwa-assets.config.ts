import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

/**
 * Iconos de la PWA. Se generan solos en cada build a partir de
 * `public/icon.png` (favicon, apple-touch-icon y los PNG del manifiesto).
 * Si cambias el icono, cambia solo ese PNG (cuadrado, 1024 px).
 */

/** El fondo blanco del dibujo: rellena los márgenes sin que se note. */
const ICON_BACKGROUND = '#ffffff'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    // El dibujo ya trae su margen: el favicon y los PNG van tal cual.
    // El favicon no sale de aquí: es public/favicon.png (blanco sobre
    // transparente), enlazado en nuxt.config.ts.
    transparent: { ...minimal2023Preset.transparent, padding: 0, favicons: [] },
    // Android recorta el icono en círculo (cabe el 80 % central): con un 12 %
    // de margen más, las esquinas del carrito quedan dentro.
    maskable: { ...minimal2023Preset.maskable, padding: 0.12, resizeOptions: { background: ICON_BACKGROUND } },
    // iOS redondea las esquinas pero no recorta: va tal cual.
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: ICON_BACKGROUND } },
  },
  images: ['public/icon.png'],
})
