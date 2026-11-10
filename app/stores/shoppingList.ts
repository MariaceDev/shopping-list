import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import type { HistoryAction } from '#shared/types/History.type'
import type { ShoppingItem } from '#shared/types/ShoppingItem.type'
import type { ShoppingTrip } from '#shared/types/ShoppingTrip.type'
import type {
  ShoppingListActions,
  ShoppingListGetters,
  ShoppingListState,
} from '#shared/types/store/ShoppingListStore.type'

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


export const useShoppingListStore = defineStore('shoppingList', () => {
  const { db, user } = useFirebase()
  const membersStore = useMembersStore()
  const listId = useListId()

  const state = reactive<ShoppingListState>({ items: [], loading: true })

  const itemsRef = collection(db, 'lists', listId, 'items')

  watchQuery(
    query(itemsRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      // Mientras el servidor confirma un producto nuevo, su fecha es una
      // estimación local en vez de null (que se pintaría sin «ahora»).
      state.items = snapshot.docs.map((d) =>
        toItem(d.id, d.data({ serverTimestamps: 'estimate' })),
      )
      state.loading = false
    },
    'items',
  )

  const inCart = computed<ShoppingListGetters['inCart']>(() => state.items.filter((i) => i.done))

  /** Lo que falta por coger. */
  const pending = computed<ShoppingListGetters['pending']>(() => state.items.filter((i) => !i.done))

  const myName = (): string => membersStore.me?.name ?? ''


  async function record(action: HistoryAction, itemName: string, qty: number): Promise<void> {
    await addDoc(collection(db, 'lists', listId, 'history'), {
      action,
      itemName,
      qty,
      byUid: user.uid,
      byName: myName(),
      at: serverTimestamp(),
    })
  }

  async function addItem(name: string, qty = 1): Promise<void> {
    const clean = name.trim()
    if (!clean) return

    const existing = state.items.find(
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
      addedByName: myName(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    await record('added', clean, qty)
  }

  /** Cambiar las unidades. Bajar de 1 borra el producto. */
  async function setQty(itemId: string, qty: number): Promise<void> {
    const item = state.items.find((i) => i.id === itemId)
    if (!item) return

    if (qty < 1) {
      await removeItem(itemId)
      return
    }

    await updateDoc(doc(itemsRef, itemId), { qty, updatedAt: serverTimestamp() })
    await record('qty-changed', item.name, qty)
  }

  /** Meter o sacar del carro durante el modo tienda. */
  async function toggleDone(itemId: string): Promise<void> {
    const item = state.items.find((i) => i.id === itemId)
    if (!item) return

    await updateDoc(doc(itemsRef, itemId), {
      done: !item.done,
      updatedAt: serverTimestamp(),
    })
    if (!item.done) await record('bought', item.name, item.qty)
  }


  async function finishTrip(): Promise<void> {
    const taken = inCart.value
    if (!taken.length) return

    await addDoc(collection(db, 'lists', listId, 'trips'), {
      at: serverTimestamp(),
      byUid: user.uid,
      byName: myName(),
      items: taken.map((i) => ({ name: i.name, qty: i.qty })),
      // El precio se apunta luego, desde el Historial.
      total: null,
    })

    for (const item of taken) {
      await deleteDoc(doc(itemsRef, item.id))
    }
  }

  async function repeatTrip(trip: ShoppingTrip): Promise<void> {
    for (const item of trip.items) {
      await addItem(item.name, item.qty)
    }
  }

  async function removeItem(itemId: string): Promise<void> {
    const item = state.items.find((i) => i.id === itemId)
    if (!item) return

    await deleteDoc(doc(itemsRef, itemId))
    await record('removed', item.name, item.qty)
  }

  const actions: ShoppingListActions = {
    addItem,
    setQty,
    toggleDone,
    removeItem,
    finishTrip,
    repeatTrip,
  }

  return { ...toRefs(state), inCart, pending, ...actions }
})
