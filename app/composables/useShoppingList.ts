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
  type HistoryEntry,
  type ShoppingItem,
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

function toHistoryEntry(id: string, data: DocumentData): HistoryEntry {
  return {
    id,
    action: (data.action ?? 'added') as HistoryAction,
    itemName: String(data.itemName ?? ''),
    qty: Number(data.qty ?? 0),
    byUid: String(data.byUid ?? ''),
    byName: String(data.byName ?? ''),
    at: millis(data.at),
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

  const pending = computed(() => items.value.filter((i) => !i.done))
  const bought = computed(() => items.value.filter((i) => i.done))

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

  /** Añadir un producto. Si ya está pendiente, suma unidades en vez de duplicar. */
  async function addItem(name: string, qty = 1) {
    const clean = name.trim()
    if (!clean) return

    const existing = items.value.find(
      (i) => i.name.toLowerCase() === clean.toLowerCase() && !i.done,
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

  /** Marcar o desmarcar como comprado. */
  async function toggleDone(itemId: string) {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return

    await updateDoc(doc(itemsRef, itemId), {
      done: !item.done,
      updatedAt: serverTimestamp(),
    })
    if (!item.done) await record('bought', item.name, item.qty)
  }

  /** Al terminar la compra: lo comprado sale de la lista y queda en el historial. */
  async function clearBought() {
    const done = items.value.filter((i) => i.done)
    for (const item of done) {
      await deleteDoc(doc(itemsRef, item.id))
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
    pending,
    bought,
    loading,
    addItem,
    setQty,
    toggleDone,
    removeItem,
    clearBought,
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

function createHistory(listId: string, max: number) {
  const { db } = useFirebase()

  const entries = ref<HistoryEntry[]>([])
  const loading = ref(true)

  effectScope(true).run(() => {
    watchQuery(
      query(
        collection(db, 'lists', listId, 'history'),
        orderBy('at', 'desc'),
        limit(max),
      ),
      (snapshot) => {
        entries.value = snapshot.docs.map((d) => toHistoryEntry(d.id, d.data()))
        loading.value = false
      },
      'history',
    )
  })

  return { entries, loading }
}

const historyCache = new Map<string, ReturnType<typeof createHistory>>()

/** El historial de la lista, lo más reciente primero. */
export function useListHistory(listId: string = DEFAULT_LIST_ID, max = 100) {
  let api = historyCache.get(listId)
  if (!api) {
    api = createHistory(listId, max)
    historyCache.set(listId, api)
  }
  return api
}
