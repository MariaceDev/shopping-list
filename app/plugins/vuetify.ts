import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

/**
 * Vuetify con el tema del prototipo de Claude Design.
 *
 * Los colores son los de los tokens de `main.css`. Lo que Vuetify no deja
 * configurar desde aquí (radios, tamaños de letra, la línea fina de las
 * tarjetas…) se pisa en `main.css`: Vuetify mete todo su CSS en cascade
 * layers, así que cualquier regla sin layer le gana.
 *
 * Los iconos son de Material Design Icons (@mdi/font) y se escriben por su
 * nombre: `icon="mdi-close"` en v-btn, o `<v-icon icon="mdi-close" />`.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'casa',
      themes: {
        casa: {
          dark: false,
          colors: {
            'background': '#fafafa',
            'on-background': '#3c1642',
            'surface': '#ffffff',
            'on-surface': '#3c1642',
            // Teal: el botón principal y el modo tienda.
            'primary': '#086375',
            'on-primary': '#ffffff',
            // Amatista: el texto y los botones oscuros.
            'secondary': '#3c1642',
            'on-secondary': '#fafafa',
            // Verde de la pestaña activa.
            'mint': '#b2ff9e',
            'on-mint': '#3c1642',
            // Verde lima de la barra de progreso. No se llama "lime" para no
            // chocar con la clase bg-lime de la paleta de Material.
            'accent': '#affc41',
            'track': '#f0f0f0',
            'on-track': '#3c1642',
            'muted': '#6a5a72',
            'meta': '#867790',
            'faded': '#9e95a3',
            'error': '#b3261e',
          },
          variables: {
            // La línea fina de los bordes (border-t, border-md…).
            'border-color': '#e8e8e8',
            'border-opacity': 1,
            // El texto va a color pleno, no al 87% de Material.
            'high-emphasis-opacity': 1,
            'medium-emphasis-opacity': 1,
            // El diseño no tiene capas de hover ni de pulsación.
            'hover-opacity': 0,
            'focus-opacity': 0,
            'pressed-opacity': 0,
            'activated-opacity': 0,
          },
        },
      },
    },
    defaults: {
      global: { ripple: false },
      // rounded="btn" y rounded="card" son radios propios: van en main.css.
      VBtn: { variant: 'flat', rounded: 'btn' },
      VCard: { flat: true, rounded: 'card' },
      VTextField: { variant: 'solo', flat: true, hideDetails: true, singleLine: true },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
