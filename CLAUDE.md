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
  pages/              # index (lista), historial, nfc
  components/         # AppAvatar, ItemRow, AddItemBar, NameGate
  composables/        # useFirebase, useListMembers, useShoppingList
  plugins/            # firebase.client.ts — arranca Firebase y la sesión
  utils/              # helpers auto-importados (time.ts)
  assets/css/main.css # variables de color y estilos base
shared/types/         # tipos del dominio, compartidos (el "common" en pequeño)
test/                 # tests de Vitest
firestore.rules       # reglas de seguridad
```

## Firebase

- Proyecto: **`shopping-list-mariace`** (cuenta personal, no la de Digibite).
- La config web vive en `nuxt.config.ts` → `runtimeConfig.public.firebase`.
  Es un **identificador público**, no un secreto: viaja en el bundle de
  cualquier app web. La seguridad real está en `firestore.rules`.
- **Auth anónima**: no hay registro ni contraseñas. Se entra por el tag NFC o
  por enlace y lo único que se pide es el nombre.
- Para trabajar sin tocar datos reales: `pnpm emulators` y
  `NUXT_PUBLIC_USE_EMULATORS=true pnpm dev`.

### Modelo de datos

```
lists/{listId}                       # listId por defecto: "casa"
  members/{uid}   { name, color, joinedAt }
  items/{itemId}  { name, qty, done, addedByUid, addedByName, createdAt, updatedAt }
  history/{id}    { action, itemName, qty, byUid, byName, at }   # solo-crear
```

El historial no se edita ni se borra nunca: las reglas lo impiden.

## Convenciones

- **Castellano** en comentarios, textos de UI, mensajes de commit y nombres
  de dominio. En inglés solo lo que impone el framework.
- **TypeScript estricto.** Nada de `as any`; si un tipo no cuadra, arregla el
  tipo, no lo silencies.
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
