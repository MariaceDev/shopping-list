import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import {
  DEFAULT_LIST_ID,
  type HistoryAction,
  type ShoppingItem,
  type ShoppingTrip,
} from '#shared/types/shopping'

function toItem(id: string, data: DocumentData): ShoppingItem {
  return {
    id,
    name: String(data.name ?? ''),
    qty: Number(data.qty ?? 1),
    done: Boolean(data.done),
    addedByUid: String(data.addedByUid ?? ''),
    addedByName: String(data.addedByName ?? ''),
    createdAt: millis(data.createdAt),
    updatedAt: millis(data.updatedAt),
  }
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
  }
}

function createList(listId: string) {
  const { db, user } = useFirebase()
  const { me } = useListMembers(listId)

  const items = ref<ShoppingItem[]>([])
  const loading = ref(true)

  const itemsRef = collection(db, 'lists', listId, 'items')

  effectScope(true).run(() => {
    watchQuery(
      query(itemsRef, orderBy('createdAt', 'desc')),
      (snapshot) => {
        items.value = snapshot.docs.map((d) => toItem(d.id, d.data()))
        loading.value = false
      },
      'items',
    )
  })

  /** Lo que ya está en el carro durante el modo tienda. */
  const inCart = computed(() => items.value.filter((i) => i.done))

  /**
   * `history` es un registro interno de auditoría: se escribe siempre, pero
   * no se enseña en ninguna pantalla. Lo que ve la gente es `trips`.
   */
  async function record(action: HistoryAction, itemName: string, qty: number) {
    await addDoc(collection(db, 'lists', listId, 'history'), {
      action,
      itemName,
      qty,
      byUid: user.uid,
      byName: me.value?.name ?? '',
      at: serverTimestamp(),
    })
  }

  /** Añadir un producto. Si ya está en la lista, suma unidades en vez de duplicar. */
  async function addItem(name: string, qty = 1) {
    const clean = name.trim()
    if (!clean) return

    const existing = items.value.find(
      (i) => i.name.toLowerCase() === clean.toLowerCase(),
    )
    if (existing) {
      await setQty(existing.id, existing.qty + qty)
      return
    }

    await addDoc(itemsRef, {
      name: clean,
      qty,
      done: false,
      addedByUid: user.uid,
      addedByName: me.value?.name ?? '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await record('added', clean, qty)
  }

  /** Cambiar las unidades. Bajar de 1 borra el producto. */
  async function setQty(itemId: string, qty: number) {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return

    if (qty < 1) {
      await removeItem(itemId)
      return
    }

    await updateDoc(doc(itemsRef, itemId), { qty, updatedAt: serverTimestamp() })
    await record('qty-changed', item.name, qty)
  }

  /** Meter o sacar del carro durante el modo tienda. */
  async function toggleDone(itemId: string) {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return

    await updateDoc(doc(itemsRef, itemId), {
      done: !item.done,
      updatedAt: serverTimestamp(),
    })
    if (!item.done) await record('bought', item.name, item.qty)
  }

  /**
   * Cerrar la compra: lo que está en el carro se guarda como una compra
   * terminada y desaparece de la lista. Lo que no se cogió se queda.
   */
  async function finishTrip() {
    const taken = inCart.value
    if (!taken.length) return

    await addDoc(collection(db, 'lists', listId, 'trips'), {
      at: serverTimestamp(),
      byUid: user.uid,
      byName: me.value?.name ?? '',
      items: taken.map((i) => ({ name: i.name, qty: i.qty })),
    })

    for (const item of taken) {
      await deleteDoc(doc(itemsRef, item.id))
    }
  }

  /** "Repetir esta compra": devuelve a la lista todo lo de una compra pasada. */
  async function repeatTrip(trip: ShoppingTrip) {
    for (const item of trip.items) {
      await addItem(item.name, item.qty)
    }
  }

  async function removeItem(itemId: string) {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return

    await deleteDoc(doc(itemsRef, itemId))
    await record('removed', item.name, item.qty)
  }

  return {
    items,
    inCart,
    loading,
    addItem,
    setQty,
    toggleDone,
    removeItem,
    finishTrip,
    repeatTrip,
  }
}

const listCache = new Map<string, ReturnType<typeof createList>>()

/** Los productos de la lista, en tiempo real, y las acciones para tocarlos. */
export function useShoppingList(listId: string = DEFAULT_LIST_ID) {
  let api = listCache.get(listId)
  if (!api) {
    api = createList(listId)
    listCache.set(listId, api)
  }
  return api
}

function createTrips(listId: string, max: number) {
  const { db } = useFirebase()

  const trips = ref<ShoppingTrip[]>([])
  const loading = ref(true)

  effectScope(true).run(() => {
    watchQuery(
      query(
        collection(db, 'lists', listId, 'trips'),
        orderBy('at', 'desc'),
        limit(max),
      ),
      (snapshot) => {
        trips.value = snapshot.docs.map((d) => toTrip(d.id, d.data()))
        loading.value = false
      },
      'trips',
    )
  })

  return { trips, loading }
}

const tripsCache = new Map<string, ReturnType<typeof createTrips>>()

/** Las compras terminadas, de la más reciente a la más vieja. */
export function useTrips(listId: string = DEFAULT_LIST_ID, max = 50) {
  let api = tripsCache.get(listId)
  if (!api) {
    api = createTrips(listId, max)
    tripsCache.set(listId, api)
  }
  return api
}
