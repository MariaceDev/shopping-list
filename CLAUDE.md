# Lista de la compra

App de lista de la compra compartida para casa. Una sola app, nada de monorepo:
Nuxt 4 + Vue 3 + Firebase, desplegada como SPA estática en Firebase Hosting.

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
| `pnpm deploy`       | Build + `firebase deploy --only hosting`        |
| `pnpm deploy:rules` | Sube `firestore.rules` e índices                |

## Estructura

```
app/                  # srcDir de Nuxt 4
  app.vue             # shell
  layouts/default.vue # puerta del nombre + nav inferior
  pages/              # index (lista), comprar (modo tienda), historial, nfc
  components/         # AppAvatar, ItemRow, AddItemBar, NameGate
  composables/        # useFirebase, useListMembers, useShoppingList
  plugins/            # firebase.client.ts (Firebase y sesión), vuetify.ts (tema)
  utils/              # helpers auto-importados (time.ts)
  assets/css/main.css # todo el CSS: tokens, tipografía y ajustes a Vuetify
shared/types/         # tipos del dominio, compartidos (el "common" en pequeño)
test/                 # tests de Vitest
firestore.rules       # reglas de seguridad
```

## El diseño

**`.claude/vue/ListaCompra.vue` es el prototipo de Claude Design y manda.**
Lleva las cuatro pantallas (entrada por NFC, nombre, lista, modo tienda e
historial) con sus valores exactos. Antes de tocar la interfaz, míralo: si
algo no coincide, el que está mal es el repo, no el prototipo.

De ahí salen la tipografía (**Outfit**, pesos 500 y 600 — nada de 700/800),
los tamaños, y el detalle de que las tarjetas **no llevan sombra difusa** sino
una línea fina debajo (`0 1px 0 #e8e8e8`).

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

## Firebase

- Proyecto: **`shopping-list-mariace`** (cuenta personal, no la de Digibite).
- La config web vive en `nuxt.config.ts` → `runtimeConfig.public.firebase`.
  Es un **identificador público**, no un secreto: viaja en el bundle de
  cualquier app web. La seguridad real está en `firestore.rules`.
- **Auth anónima**: no hay registro ni contraseñas. Se entra por el tag NFC o
  por enlace y lo único que se pide es el nombre.
- Para trabajar sin tocar datos reales: `pnpm emulators` y
  `NUXT_PUBLIC_USE_EMULATORS=true pnpm dev`.
- **Hay dos Firebase CLI instaladas en esta máquina.** Con Node 22 el `PATH`
  encuentra la de `/usr/local/bin` (13.22.1, de 2024), que se descarga un
  emulador viejo y revienta al arrancar. La buena está en el bin de Node 20:
  `~/.nvm/versions/node/v20.19.0/bin/firebase` (15.6.0). Si `pnpm emulators`
  falla con "An unexpected error has occurred", es esto.

### Modelo de datos

```
lists/{listId}                       # listId por defecto: "casa"
  members/{uid}   { name, color, joinedAt }
  items/{itemId}  { name, qty, done, addedByUid, addedByName, createdAt, updatedAt }
  trips/{tripId}  { at, byUid, byName, items: [{ name, qty }] }  # solo-crear
  history/{id}    { action, itemName, qty, byUid, byName, at }   # solo-crear
```

`trips` son las **compras terminadas**: lo que enseña la pantalla de
Historial, agrupado por fecha y con el botón de repetir. Se crea una al pulsar
"Terminar compra" en el modo tienda, y los productos cogidos salen de `items`.

`history` es un registro interno de auditoría (quién tocó qué): se escribe
siempre, pero no se enseña en ninguna pantalla.

Ni `trips` ni `history` se editan ni se borran nunca: las reglas lo impiden.

## Convenciones

- **Castellano** en comentarios, textos de UI, mensajes de commit y nombres
  de dominio. En inglés solo lo que impone el framework.
- **TypeScript estricto.** Nada de `as any`; si un tipo no cuadra, arregla el
  tipo, no lo silencies.
- **Orden de los bloques en los `.vue`: `<template>`, luego `<script>`, luego
  `<style>`.** Lo impone la regla `vue/block-order` de ESLint (`pnpm lint --fix`
  lo corrige solo).
- Los tipos del dominio van en `shared/types/`, no duplicados en componentes.
- **Una sola suscripción por colección.** Los composables de Firestore cachean
  su `onSnapshot` a nivel de módulo (`effectScope(true)`), para que layout y
  páginas compartan listener en vez de abrir uno cada uno.
- Al tocar Firestore desde la UI, escribe también la línea de `history`.
- Si cambias `firestore.rules`, dilo: hay que desplegarlas aparte con
  `pnpm deploy:rules`, no van en el build.

## Reglas de trabajo

- **Nunca `git push` sin que yo lo confirme.** Hay un hook que lo fuerza.
- **Nunca `firebase deploy` sin confirmación.** Otro hook.
- Antes de dar algo por terminado, `pnpm verify` en verde.
- Trabaja sobre `master` salvo que te diga otra cosa.
