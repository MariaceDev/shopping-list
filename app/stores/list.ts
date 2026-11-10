import { doc, onSnapshot } from 'firebase/firestore'
import type { ListState } from '#shared/types/store/ListStore.type'
import { DEFAULT_LIST_NAME } from '#shared/utils/list'

/**
 * La ficha de la lista abierta (de momento, solo su nombre). A diferencia de
 * los demás stores, se puede usar antes de ser miembro: las reglas dejan
 * leer la lista a cualquiera con sesión, y NameGate enseña su nombre.
 */
export const useListStore = defineStore('list', () => {
  const { db } = useFirebase()

  const state = reactive<ListState>({ name: DEFAULT_LIST_NAME, loading: true })

  onSnapshot(
    doc(db, 'lists', useListId()),
    (snapshot) => {
      const name = snapshot.get('name')
      state.name = typeof name === 'string' && name.trim() ? name : DEFAULT_LIST_NAME
      state.loading = false
    },
    (error) => {
      console.error('[firestore:list]', error)
      state.loading = false
    },
  )

  return { ...toRefs(state) }
})
