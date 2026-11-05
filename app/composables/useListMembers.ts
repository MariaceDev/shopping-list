import {
  collection,
  doc,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'
import {
  DEFAULT_LIST_ID,
  colorForIndex,
  type ListMember,
} from '#shared/types/shopping'

function toMember(id: string, data: DocumentData): ListMember {
  return {
    uid: id,
    name: String(data.name ?? ''),
    color: String(data.color ?? colorForIndex(0)),
    joinedAt: millis(data.joinedAt),
  }
}

/**
 * Una suscripción por lista, compartida por toda la app: el layout y las
 * páginas piden lo mismo y no queremos abrir varios listeners contra
 * Firestore. Como la app es SPA, un caché a nivel de módulo basta.
 */
const cache = new Map<string, ReturnType<typeof createMembers>>()

function createMembers(listId: string) {
  const { db, user } = useFirebase()

  const members = ref<ListMember[]>([])
  const loading = ref(true)

  // Scope desacoplado: el listener no muere al desmontarse un componente.
  effectScope(true).run(() => {
    watchQuery(
      query(collection(db, 'lists', listId, 'members')),
      (snapshot) => {
        members.value = snapshot.docs
          .map((d) => toMember(d.id, d.data()))
          .sort((a, b) => a.joinedAt - b.joinedAt)
        loading.value = false
      },
      'members',
    )
  })

  const me = computed(
    () => members.value.find((m) => m.uid === user.uid) ?? null,
  )

  /** Entrar en la lista con un nombre. También sirve para cambiarlo. */
  async function join(name: string) {
    const clean = name.trim()
    if (!clean) throw new Error('El nombre no puede estar vacío')

    // La lista se crea sola la primera vez que alguien entra.
    await setDoc(
      doc(db, 'lists', listId),
      { name: 'Lista de casa', updatedAt: serverTimestamp() },
      { merge: true },
    )

    await setDoc(
      doc(db, 'lists', listId, 'members', user.uid),
      {
        name: clean,
        color: me.value?.color ?? colorForIndex(members.value.length),
        joinedAt: me.value?.joinedAt ?? serverTimestamp(),
      },
      { merge: true },
    )
  }

  return { members, me, loading, join }
}

export function useListMembers(listId: string = DEFAULT_LIST_ID) {
  let api = cache.get(listId)
  if (!api) {
    api = createMembers(listId)
    cache.set(listId, api)
  }
  return api
}
