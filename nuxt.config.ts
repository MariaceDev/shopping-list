// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-05',

  // SPA: sin servidor. Permite desplegar en Firebase Hosting con el plan
  // gratuito (Spark). Si algún día hace falta SSR, pasa esto a true y el
  // deploy necesitará Blaze (Cloud Functions).
  ssr: false,

  devtools: { enabled: true },

  modules: ['@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Lista de la compra',
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0f766e' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      // La config web de Firebase es un identificador público, no un secreto:
      // viaja en el bundle de cualquier app web. La seguridad real está en
      // firestore.rules. Se puede sobreescribir con variables NUXT_PUBLIC_*.
      firebase: {
        apiKey: 'AIzaSyCDfx5qhTCiVra1Wt-EL2H0ttQJh1diRV8',
        authDomain: 'shopping-list-mariace.firebaseapp.com',
        projectId: 'shopping-list-mariace',
        storageBucket: 'shopping-list-mariace.firebasestorage.app',
        messagingSenderId: '554984544945',
        appId: '1:554984544945:web:a76d378c721b92dee3a090',
      },
      // NUXT_PUBLIC_USE_EMULATORS=true para apuntar a los emuladores locales.
      // Nuxt convierte solo el valor de la variable de entorno a booleano.
      useEmulators: false,
    },
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },
})
