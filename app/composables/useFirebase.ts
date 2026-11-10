import type { FirebaseServices } from '#shared/types/Firebase.type'

/** Acceso a la instancia de Firebase que montó el plugin. */
export function useFirebase(): FirebaseServices {
  const { $firebase } = useNuxtApp()
  return $firebase as FirebaseServices
}
