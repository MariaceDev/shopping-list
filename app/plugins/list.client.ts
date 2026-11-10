import { doc, getDoc } from 'firebase/firestore'
import {
  DEFAULT_LIST_ID,
  LIST_PARAM,
  LIST_STORAGE_KEY,
  pickListId,
} from '#shared/utils/list'

/**
 * Decide qué lista se abre, antes de que se monte nada. Va después de
 * firebase.client.ts (los plugins se cargan por orden alfabético).
 *
 * 1. La del enlace (`/?lista=<id>`).
 * 2. Si no, la última que se abrió en este dispositivo.
 * 3. Si no, «casa» solo si ya eras miembro: así nadie que entre sin enlace
 *    acaba por error en la lista de otra casa.
 *
 * Deja `$listId` a null si no hay ninguna: el layout pide entonces el enlace.
 * Cambiar de lista es abrir otro enlace, que recarga la app entera; por eso
 * los stores pueden leer el id una vez y no volver a mirarlo.
 */
export default defineNuxtPlugin(async () => {
  const { db, user } = useFirebase()

  const fromUrl = new URLSearchParams(window.location.search).get(LIST_PARAM)
  let listId = pickListId(fromUrl, readStored())

  if (!listId) {
    const legacy = await getDoc(doc(db, 'lists', DEFAULT_LIST_ID, 'members', user.uid))
      .catch(() => null)
    if (legacy?.exists()) listId = DEFAULT_LIST_ID
  }

  if (listId) saveStored(listId)

  return { provide: { listId } }
})

function readStored(): string | null {
  try {
    return localStorage.getItem(LIST_STORAGE_KEY)
  } catch {
    return null
  }
}

function saveStored(listId: string): void {
  try {
    localStorage.setItem(LIST_STORAGE_KEY, listId)
  } catch {
    // Sin almacenamiento (modo privado): se pedirá el enlace la próxima vez.
  }
}
