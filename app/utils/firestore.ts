import type { FirestoreError, Query, QuerySnapshot } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'

/**
 * `onSnapshot` que sobrevive a un `permission-denied` temprano.
 *
 * Firestore evalúa las reglas en el servidor, pero la caché local aplica las
 * escrituras al instante. Al entrar en la lista por primera vez eso abre una
 * carrera: la UI ya te ve como miembro y monta la pantalla de productos
 * milisegundos antes de que el servidor haya confirmado tu ficha de miembro,
 * así que las reglas deniegan la consulta. Y un listener denegado no se
 * recupera solo: Firestore lo da por muerto.
 *
 * Por eso lo reabrimos unas cuantas veces con espera creciente. Si el permiso
 * es realmente que no, se agotan los intentos y se registra el error.
 */
export function watchQuery(
  query: Query,
  onData: (snapshot: QuerySnapshot) => void,
  label: string,
  maxRetries = 5,
): () => void {
  let attempts = 0
  let stop: (() => void) | null = null
  let cancelled = false

  function start() {
    if (cancelled) return
    stop = onSnapshot(query, onData, (error: FirestoreError) => {
      if (error.code === 'permission-denied' && attempts < maxRetries) {
        attempts += 1
        setTimeout(start, 300 * attempts)
        return
      }
      console.error(`[firestore:${label}]`, error)
    })
  }

  start()

  return () => {
    cancelled = true
    stop?.()
  }
}
