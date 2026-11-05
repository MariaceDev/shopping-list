/**
 * Tipos compartidos de la lista de la compra.
 *
 * Esta carpeta `shared/` es el equivalente mínimo al paquete `common` de
 * Digibite: lo que tengan que conocer a la vez la UI, los tests y (si algún
 * día las hay) las Cloud Functions vive aquí. Nuxt la auto-importa y también
 * se puede importar como `#shared/types/shopping`.
 */

/** Id de la lista por defecto. Una casa, una lista. */
export const DEFAULT_LIST_ID = 'casa'

/** Colores de avatar que se reparten entre los miembros, por orden de llegada. */
export const MEMBER_COLORS = [
  '#14b8a6', // turquesa
  '#a3e635', // lima
  '#f59e0b', // ámbar
  '#f472b6', // rosa
  '#818cf8', // índigo
  '#fb7185', // coral
] as const

/** Un producto de la lista. */
export interface ShoppingItem {
  id: string
  /** Nombre tal cual lo escribió quien lo añadió: "Leche semidesnatada". */
  name: string
  /** Unidades pedidas. Siempre >= 1. */
  qty: number
  /** Marcado como comprado durante la compra. */
  done: boolean
  addedByUid: string
  addedByName: string
  createdAt: number
  updatedAt: number
}

/** Alguien que ha entrado en la lista (por el tag NFC o por enlace). */
export interface ListMember {
  uid: string
  name: string
  color: string
  joinedAt: number
}

/** Qué se puede registrar en el historial. */
export type HistoryAction = 'added' | 'removed' | 'bought' | 'qty-changed'

/** Una línea del historial. Solo se crea, nunca se edita ni se borra. */
export interface HistoryEntry {
  id: string
  action: HistoryAction
  itemName: string
  qty: number
  byUid: string
  byName: string
  at: number
}

/** La inicial que se pinta en el avatar. */
export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

/** Color estable para un miembro, a partir de cuántos había antes. */
export function colorForIndex(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length]!
}
