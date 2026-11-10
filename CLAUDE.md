# Lista de la compra

App de lista de la compra compartida para casa. Una sola app, nada de monorepo:
Nuxt 4 + Vue 3 + TypeScript + Pinia + Vuetify + Firebase, desplegada como SPA estática en Firebase Hosting.

Es un proyecto **independiente de Digibite-Stack**: otra cuenta de Firebase,
otro repo, otras convenciones. No importes nada de allí.

## Cómo se arranca

Este proyecto necesita **Node 22+** (Nuxt 4.6 ya no soporta Node 20). Hay un
`.nvmrc`, así que basta con:

```bash
nvm use        # coge el 22 del .nvmrc
pnpm install
pnpm dev       # http://localhost:3000
```

El gestor de paquetes es **pnpm**, no npm.

## Comandos

| Comando             | Qué hace                                        |
| ------------------- | ----------------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo                          |
| `pnpm generate`     | Build estático en `.output/public`              |
| `pnpm verify`       | `lint` + `typecheck` + `test`. Pásalo al acabar |
| `pnpm test`         | Tests con Vitest                                |
| `pnpm emulators`    | Emuladores de Auth y Firestore en local         |
| `pnpm deploy:hosting` | Build + `firebase deploy --only hosting`      |
| `pnpm deploy:rules`   | Sube `firestore.rules` e índices              |

Ojo: **no existe `pnpm deploy`** a secas. Es un comando propio de pnpm (para
workspaces) y nunca llega a ejecutar el script; por eso se llama `deploy:hosting`.

## Estructura

```
app/                  # srcDir de Nuxt 4
  app.vue             # shell
  layouts/default.vue # elige: /nueva, NoList (sin lista) o ListGate (nombre + nav)
  pages/              # index (lista), comprar (modo tienda), historial, nfc, nueva
  components/         # AppAvatar, ItemRow, AddItemBar, NameGate, ProfileSheet, TripTotalSheet, ColorPicker, ListGate, NoList
  composables/        # useFirebase, useListId, useNow (reloj para «hace X min»)
  stores/             # Pinia: list, members, shoppingList, trips (auto-importados)
  plugins/            # firebase.client.ts (Firebase y sesión), list.client.ts (qué lista), vuetify.ts
  utils/              # helpers auto-importados (time.ts)
  assets/css/main.css # todo el CSS: tokens, tipografía y ajustes a Vuetify
shared/
  types/              # un fichero por entidad: ShoppingItem.type.ts, ListMember.type.ts…
    store/            # el contrato de cada store: MembersStore.type.ts…
  utils/              # funciones y constantes compartidas (members.ts, list.ts)
test/                 # tests de Vitest
firestore.rules       # reglas de seguridad
```

## El diseño

**`.claude/vue/ListaCompra.vue` es el prototipo de Claude Design y manda.**
Lleva las cuatro pantallas (entrada por NFC, nombre, lista, modo tienda e
historial) con sus valores exactos. Antes de tocar la interfaz, míralo: si
algo no coincide, el que está mal es el repo, no el prototipo.

De ahí salían la tipografía (**Outfit**, pesos 500 y 600; ver el cambio abajo),
los tamaños, y el detalle de que las tarjetas **no llevan sombra difusa** sino
una línea fina debajo (`0 1px 0 #e8e8e8`).

**Cambio respecto al prototipo, pedido a propósito:** toda la app va en
**Caveat**, manuscrita (`--font-hand`, también `--v-font-body` para Vuetify),
a juego con los iconos dibujados de la barra. Outfit ya no se carga. Caveat
se ve más pequeña, así que **todos los tamaños de `main.css` están subidos
~1,25× respecto al prototipo** (los de iconos no). Peso base 500; el `h1` va
a 46 px y 700 (el «nada de 700» era para Outfit).
Los textos secundarios (`.page-sub`, `.meta`: «Faltan 4 productos»,
«Mari · hace 1 h»…) y las etiquetas en mayúsculas (`.eyebrow`,
`.shop-eyebrow`) van en **Nunito** (`--font-sans`), a tamaño normal.

### Vuetify

La interfaz va con **Vuetify 4** (`app/plugins/vuetify.ts`), pero ajustado
para que se vea exactamente como el prototipo, no como Material:

- **Tema `casa`** con los colores del prototipo: `primary` (teal),
  `secondary` (amatista), `mint`, `accent` (lima), `track`, `muted`, `meta`,
  `faded`. De ahí salen las clases `bg-*` y `text-*`. Las capas de hover y
  pulsación están a 0 y el ripple apagado, porque el diseño no los tiene.
- **Maquetación con las utilidades de Vuetify** en la plantilla (`d-flex`,
  `ga-3`, `px-6`, `text-truncate`…). Su escala va de 4 en 4 px; lo que se sale
  de ella (14, 18, 10 px…) va en `main.css`.
- **Los componentes no llevan `<style>`.** Todo el CSS está en
  `app/assets/css/main.css`, por secciones: tipografía del prototipo, ajustes
  de los componentes de Vuetify y una sección por pantalla.
- Vuetify mete su CSS en *cascade layers*, así que lo de `main.css` (sin layer)
  le gana siempre, sin `!important`. Los resets de elementos (`p`, `h1`…) van
  dentro de `@layer vuetify-core.reset`: sin layer anularían utilidades como
  `mt-2`.
- Radios propios para el prop `rounded`: `rounded="btn"` (14 px, el de los
  botones por defecto) y `rounded="card"` (18 px, el de las tarjetas por
  defecto).
- **Iconos con Material Design Icons** (`@mdi/font`), por su nombre:
  `icon="mdi-close"` en `v-btn` o `<v-icon icon="mdi-close" />`. Nada de
  glifos de texto (`+`, `✓`, `≡`) haciendo de icono. Un `v-icon` mide 1,5
  veces el tamaño de letra de su padre: pásale `:size` o fíjalo en `main.css`.
  **Excepción: la barra de abajo** usa dibujos a mano (`public/icons/*.png`,
  negro sobre transparente) como `mask-image`, para que tomen el color de la
  pestaña (`.tab-icon` en `main.css`).
- Las clases de tipografía de Vuetify (`text-h4`, `text-headline-*`…) **no se
  usan**: no coinciden con la escala del prototipo. Tamaños y pesos van en
  `main.css`.

Trampas que ya se han pisado al migrar, por si cambias algo:

- `v-btn` pone peso 500 y `line-height: normal`. Los botones de icono (`−`,
  `+`) van a 400 y todos heredan el 1.4 del cuerpo.
- No uses el prop `block` de `v-btn` dentro de un contenedor `flex-column`:
  mete `flex-grow: 1` y el botón crece en alto. Usa `class="w-100"`.
- Dentro de `v-app` las páginas son hijas de un flex en columna: con
  `mx-auto` necesitan `w-100` o encogen al ancho de su contenido.

## PWA

Se instala en el móvil como app con **`@vite-pwa/nuxt`** (config en
`nuxt.config.ts` → `pwa`). El service worker solo existe en el build
(`pnpm generate`), no en `pnpm dev`; se actualiza solo (`autoUpdate`).

- El icono sale de **`public/icon.png`** (1024 px): apple-touch-icon y los PNG
  del manifiesto se generan en cada build (`pwa-assets.config.ts`). Para
  cambiarlo, cambia solo ese PNG.
- El **favicon va aparte**: `public/favicon.png` (64 px, el dibujo «list» en blanco sobre
  transparente), enlazado en `nuxt.config.ts`. El generador no crea
  `favicon.ico` (`favicons: []`) para no pisarlo.
- `app/pwa-assets.d.ts` da los tipos del módulo virtual de iconos; sin él,
  `pnpm typecheck` falla en `.nuxt/pwa-icons-plugin.ts`.
- `firebase.json` sirve `sw.js` y el manifiesto con `no-cache`, para que una
  versión nueva llegue al momento.

## Firebase

- Proyecto: **`shopping-list-mariace`** (cuenta personal, no la de Digibite).
- La config web vive en `nuxt.config.ts` → `runtimeConfig.public.firebase`.
  Es un **identificador público**, no un secreto: viaja en el bundle de
  cualquier app web. La seguridad real está en `firestore.rules`.
- **Auth anónima**: no hay registro ni contraseñas. Se entra por el tag NFC o
  por enlace y lo único que se pide es el nombre.
- Para trabajar sin tocar datos reales: `pnpm emulators` y
  `NUXT_PUBLIC_USE_EMULATORS=true pnpm dev`.
- **La Firebase CLI va en `devDependencies`** (`firebase-tools`): los scripts
  de `package.json` usan esa y no la del sistema. En esta máquina hay dos
  globales (la de `/usr/local/bin`, 13.22.1, revienta con los emuladores), así
  que fuera de los scripts usa `pnpm exec firebase …`, nunca `firebase` a pelo.
- **Hosting**: el sitio es `shopping-list-mariace` →
  https://shopping-list-mariace.web.app. Sirve `.output/public` con rewrite de
  todo a `index.html` (SPA). Los ficheros de `/_nuxt/` llevan hash en el nombre
  y se cachean un año (`immutable`).

### Modelo de datos

```
lists/{listId}  { name, createdAt, updatedAt }  # «casa» es la primera
  members/{uid}   { name, color, joinedAt }
  items/{itemId}  { name, qty, done, addedByUid, addedByName, createdAt, updatedAt }
  trips/{tripId}  { at, byUid, byName, items: [{ name, qty }], total }  # solo se edita `total`
  history/{id}    { action, itemName, qty, byUid, byName, at }   # solo-crear
```

**Hay varias listas** (una por casa). Cada una se abre con su enlace,
`/?lista=<id>`, y cada dispositivo recuerda la última en `localStorage`
(`list.client.ts`). Sin enlace ni lista guardada, solo entra en «casa» quien
ya era miembro; el resto ve `NoList` y pega el enlace. Las listas nuevas se
crean en `/nueva` con un id aleatorio de 12 caracteres: **el enlace es la
invitación**, quien lo tiene puede entrar. Cambiar de lista recarga la app,
así que los stores leen `useListId()` una vez y no lo vuelven a mirar.

`trips` son las **compras terminadas**: lo que enseña la pantalla de
Historial, agrupado por fecha y con el botón de repetir. Se crea una al pulsar
"Terminar compra" en el modo tienda, y los productos cogidos salen de `items`.

`history` es un registro interno de auditoría (quién tocó qué): se escribe
siempre, pero no se enseña en ninguna pantalla.

Lo que costó una compra (`total`, en euros, o `null`) **no se pide al
terminarla**: se apunta o se cambia después desde el Historial
(`TripTotalSheet`). Es lo único editable de una `trip`; el resto, y todo
`history`, no se edita ni se borra nunca: las reglas lo impiden.

## Convenciones

- **Castellano** en comentarios, textos de UI, mensajes de commit y nombres
  de dominio. En inglés solo lo que impone el framework.
- **TypeScript estricto.** Nada de `as any`; si un tipo no cuadra, arregla el
  tipo, no lo silencies.
- **Orden de los bloques en los `.vue`: `<template>`, luego `<script>`, luego
  `<style>`.** Lo impone la regla `vue/block-order` de ESLint (`pnpm lint --fix`
  lo corrige solo).
- **Tipos en `shared/types/`, uno por fichero y con el sufijo `.type.ts`**
  (`ShoppingItem.type.ts`). Nada de tipos duplicados en componentes o stores.
  Solo tipos: las funciones y constantes van en `shared/utils/`.
  Se declaran con **`export type X = { … };`, nunca con `interface`**, y con
  `;` al final de cada campo y tras la llave de cierre.
- **Cada store tiene su contrato en `shared/types/store/`**:
  `XxxState`, `XxxGetters`, `XxxActions` y `XxxStore` (la unión de todo). El
  store lo implementa así, y TypeScript avisa si no cuadra:
  `reactive<XxxState>(…)` para el estado, `computed<XxxGetters['…']>` para
  los getters y `const actions: XxxActions = { … }` para las acciones.
  Devuelve `{ ...toRefs(state), …getters, ...actions }`.
- **El estado vive en stores de Pinia** (`app/stores/`), estilo setup
  (`defineStore('id', () => { … })`) para que TypeScript infiera los tipos.
  Cada store abre **una sola suscripción** a su colección de Firestore la
  primera vez que se usa, y la comparten layout y páginas.
- En los componentes: estado y getters con `storeToRefs`, acciones
  directamente del store:
  `const { items } = storeToRefs(store)` y `const { addItem } = store`.
  Si desestructuras el estado sin `storeToRefs`, pierde la reactividad.
- `useShoppingListStore` y `useTripsStore` **solo cuando ya eres miembro**:
  antes, Firestore deniega la suscripción y el listener se queda muerto. Por
  eso `ListGate` solo usa `useMembersStore`. Ningún store se usa fuera de
  `ListGate` (en `NoList` o `/nueva` no hay lista abierta).
- Al tocar Firestore desde la UI, escribe también la línea de `history`.
- Si cambias `firestore.rules`, dilo: hay que desplegarlas aparte con
  `pnpm deploy:rules`, no van en el build.

## Reglas de trabajo

- **Nunca `git push` sin que yo lo confirme.** Hay un hook que lo fuerza.
- **Nunca `firebase deploy` sin confirmación.** Otro hook.
- Antes de dar algo por terminado, `pnpm verify` en verde.
- Trabaja sobre `master` salvo que te diga otra cosa.
