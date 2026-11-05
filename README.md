# Lista de la compra

Lista de la compra compartida para casa: varios móviles, los mismos productos,
en tiempo real. Se entra acercando el móvil a un tag NFC pegado en la nevera —
sin registro, solo el nombre.

**Nuxt 4 · Vue 3 · Firebase** (Auth anónima + Firestore), desplegada como SPA
estática en Firebase Hosting.

## Arrancar

Hace falta **Node 22+** y **pnpm**.

```bash
nvm use
pnpm install
pnpm dev
```

## Antes de usarlo por primera vez

En la [consola de Firebase](https://console.firebase.google.com/project/shopping-list-mariace)
hay que activar dos cosas a mano:

1. **Firestore** → *Crear base de datos* (modo producción, región `eur3`).
2. **Authentication** → *Sign-in method* → activar **Anónimo**.

Y después subir las reglas de seguridad:

```bash
pnpm deploy:rules
```

## Comandos

```bash
pnpm dev            # desarrollo
pnpm verify         # lint + typecheck + tests
pnpm emulators      # Auth y Firestore en local
pnpm deploy         # publicar en Firebase Hosting
pnpm deploy:rules   # publicar firestore.rules
```
