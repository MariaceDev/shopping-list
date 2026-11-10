import { doc, serverTimestamp, setDoc, type Firestore } from 'firebase/firestore'
import { newListId } from '#shared/utils/list'

/**
 * Crea una lista vacía con su nombre y devuelve su id. Quien la crea no
 * entra en ella: el primero que abra el enlace pondrá su nombre y será su
 * primer miembro.
 */
export async function createList(db: Firestore, name: string): Promise<string> {
  const clean = name.trim().replace(/\s+/g, ' ')
  if (!clean) throw new Error('La lista necesita un nombre')

  const listId = newListId()
  await setDoc(doc(db, 'lists', listId), {
    name: clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return listId
}
