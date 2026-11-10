import {
  addDoc,
  collection,
  doc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import type { ShoppingTrip } from '#shared/types/ShoppingTrip.type'
import type { TripsActions, TripsState } from '#shared/types/store/TripsStore.type'

/** Cuántas compras terminadas se cargan en el Historial. */
const MAX_TRIPS = 50

/** Las compras de antes de apuntar precios no tienen `total`. */
function toTotal(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function toTrip(id: string, data: DocumentData): ShoppingTrip {
  const raw: DocumentData[] = Array.isArray(data.items) ? data.items : []

  return {
    id,
    at: millis(data.at),
    byUid: String(data.byUid ?? ''),
    byName: String(data.byName ?? ''),
    items: raw.map((item) => ({
      name: String(item?.name ?? ''),
      qty: Number(item?.qty ?? 1),
    })),
    total: toTotal(data.total),
  }
}

/** Las compras terminadas, de la más reciente a la más vieja. */
export const useTripsStore = defineStore('trips', () => {
  const { db, user } = useFirebase()
  const membersStore = useMembersStore()
  const listId = useListId()

  const state = reactive<TripsState>({ trips: [], loading: true })

  watchQuery(
    query(
      collection(db, 'lists', listId, 'trips'),
      orderBy('at', 'desc'),
      limit(MAX_TRIPS),
    ),
    (snapshot) => {
      state.trips = snapshot.docs.map((d) => toTrip(d.id, d.data()))
      state.loading = false
    },
    'trips',
  )

  async function setTotal(tripId: string, total: number | null): Promise<void> {
    await updateDoc(doc(db, 'lists', listId, 'trips', tripId), { total })
    await addDoc(collection(db, 'lists', listId, 'history'), {
      action: 'total-set',
      itemName: '',
      qty: 0,
      tripId,
      total,
      byUid: user.uid,
      byName: membersStore.me?.name ?? '',
      at: serverTimestamp(),
    })
  }

  const actions: TripsActions = { setTotal }

  return { ...toRefs(state), ...actions }
})
