// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-05',

  // SPA: sin servidor. Permite desplegar en Firebase Hosting con el plan
  // gratuito (Spark). Si algún día hace falta SSR, pasa esto a true y el
  // deploy necesitará Blaze (Cloud Functions).
  ssr: false,

  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    // PWA: manifiesto + service worker para instalarla en el móvil.
    '@vite-pwa/nuxt',
    // Vuetify con auto-import: solo entra en el bundle lo que se usa.
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins?.push(vuetify({ autoImport: true }))
      })
    },
  ],

  build: {
    transpile: ['vuetify'],
  },

  vite: {
    vue: {
      template: { transformAssetUrls },
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Lista de la compra',
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#086375' },
        // iOS: abrir a pantalla completa al lanzarla desde el icono.
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Compra' },
      ],
      // Caveat, manuscrita, es la tipografía de toda la app (el prototipo
      // usaba Outfit; se cambió a propósito). Nunito, la de los textos
      // secundarios (.page-sub y .meta).
      link: [
        // Favicon: el carro en blanco sobre transparente (public/favicon.png).
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Nunito:wght@500;600&display=swap',
        },
      ],
    },
  },

  pwa: {
    // El service worker nuevo se instala solo, sin preguntar.
    registerType: 'autoUpdate',
    // Iconos generados desde public/icon.svg (ver pwa-assets.config.ts).
    pwaAssets: { config: true },
    manifest: {
      name: 'Lista de la compra',
      short_name: 'Compra',
      description: 'La lista de la compra compartida de casa',
      lang: 'es',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#086375',
      background_color: '#fafafa',
    },
    workbox: {
      // SPA: cualquier ruta sin red sirve el index.html cacheado.
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
      // El original del icono (1024 px) solo sirve para generar los demás.
      globIgnores: ['icon.png', 'icon.svg'],
      // Caveat y Nunito vienen de Google Fonts: se guardan para verse sin red.
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    client: { installPrompt: false },
    // En `pnpm dev` no hay service worker: solo en el build.
    devOptions: { enabled: false },
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
