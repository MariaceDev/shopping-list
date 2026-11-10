import {
  collection,
  doc,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'
import type { ListMember } from '#shared/types/ListMember.type'
import type {
  MembersActions,
  MembersGetters,
  MembersState,
} from '#shared/types/store/MembersStore.type'
import { MEMBER_COLORS, colorForIndex, isNameTaken } from '#shared/utils/members'

function toMember(id: string, data: DocumentData): ListMember {
  return {
    uid: id,
    name: String(data.name ?? ''),
    color: String(data.color ?? colorForIndex(0)),
    joinedAt: millis(data.joinedAt),
  }
}


export const useMembersStore = defineStore('members', () => {
  const { db, user } = useFirebase()
  const listId = useListId()

  const state = reactive<MembersState>({ members: [], loading: true })

  watchQuery(
    query(collection(db, 'lists', listId, 'members')),
    (snapshot) => {
      state.members = snapshot.docs
        .map((d) => toMember(d.id, d.data()))
        // Una ficha sin nombre no es un miembro de verdad (p. ej. si se
        // vacían sus campos desde la consola): ni avatar con «?» ni cuenta
        // como «tú», así que su dueño vuelve a ver la pantalla del nombre.
        .filter((m) => m.name.trim() !== '')
        .sort((a, b) => a.joinedAt - b.joinedAt)
      state.loading = false
    },
    'members',
  )

  const me = computed<MembersGetters['me']>(
    () => state.members.find((m) => m.uid === user.uid) ?? null,
  )


  /** Limpia el nombre y comprueba que vale: ni vacío ni repetido. */
  function checkName(name: string): string {
    const clean = name.trim().replace(/\s+/g, ' ')
    if (!clean) throw new Error('El nombre no puede estar vacío')
    if (isNameTaken(clean, state.members, user.uid)) {
      throw new Error(`Ya hay alguien llamado ${clean} en la lista`)
    }
    return clean
  }

  function checkColor(color: string): void {
    if (!MEMBER_COLORS.some((memberColor) => memberColor === color)) {
      throw new Error('Elige un color de la paleta')
    }
  }

  async function join(name: string, color: string): Promise<void> {
    const clean = checkName(name)
    checkColor(color)

    // Primero la ficha de miembro y luego la lista: si la lista ya existe,
    // escribirla es un update, y las reglas solo dejan a los miembros.
    await setDoc(
      doc(db, 'lists', listId, 'members', user.uid),
      {
        name: clean,
        color,
        joinedAt: me.value?.joinedAt ?? serverTimestamp(),
      },
      { merge: true },
    )

    // Solo la fecha: el nombre lo pone quien crea la lista y no se pisa.
    await setDoc(doc(db, 'lists', listId), { updatedAt: serverTimestamp() }, { merge: true })
  }

  async function updateProfile(name: string, color: string): Promise<void> {
    const clean = checkName(name)
    checkColor(color)

    await setDoc(
      doc(db, 'lists', listId, 'members', user.uid),
      { name: clean, color },
      { merge: true },
    )
  }

  const actions: MembersActions = { join, updateProfile }

  return { ...toRefs(state), me, ...actions }
})
