import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  type Auth,
  type User,
} from 'firebase/auth'
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore'

export interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  user: User
}

/**
 * Arranca Firebase y deja una sesión anónima lista antes de que se pinte
 * nada. No hay registro ni contraseñas: a la lista se entra por el tag NFC
 * o por enlace, y lo único que se pide es el nombre.
 */
export default defineNuxtPlugin(async () => {
  const { firebase: firebaseConfig, useEmulators } = useRuntimeConfig().public

  const app = getApps()[0] ?? initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }

  const user = await new Promise<User>((resolve, reject) => {
    const stop = onAuthStateChanged(
      auth,
      (current) => {
        if (current) {
          stop()
          resolve(current)
          return
        }
        signInAnonymously(auth).catch(reject)
      },
      reject,
    )
  })

  return {
    provide: {
      firebase: { app, auth, db, user } satisfies FirebaseServices,
    },
  }
})
