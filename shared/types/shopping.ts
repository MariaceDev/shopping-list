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

/**
 * Colores de avatar que se reparten entre los miembros, por orden de llegada.
 *
 * Primero los tres claros: son los que usa el diseño para las personas. El
 * amatista y el teal van al final porque en el prototipo son el color del
 * texto y de los botones, y de avatar se confunden con la interfaz.
 */
export const MEMBER_COLORS = [
  '#1DD3B0', // turquesa
  '#AFFC41', // verde lima
  '#B2FF9E', // verde claro
  '#086375', // teal tormentoso
  '#3C1642', // amatista oscuro
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

/** Un producto tal y como quedó al cerrar una compra. */
export interface TripItem {
  name: string
  qty: number
}

/**
 * Una compra terminada: lo que alimenta la pantalla de Historial.
 * Solo se crea, nunca se edita ni se borra.
 */
export interface ShoppingTrip {
  id: string
  at: number
  byUid: string
  byName: string
  items: TripItem[]
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

/**
 * Tinta legible encima de un color de la paleta. La paleta mezcla colores
 * muy oscuros (amatista, teal) con otros muy claros (lima, verde), así que
 * el contraste se calcula en vez de fijarse a mano.
 */
export function inkFor(color: string): string {
  const hex = color.replace('#', '')
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex

  const toLinear = (value: number) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4

  const r = toLinear(parseInt(full.slice(0, 2), 16) / 255)
  const g = toLinear(parseInt(full.slice(2, 4), 16) / 255)
  const b = toLinear(parseInt(full.slice(4, 6), 16) / 255)

  // Luminancia relativa (WCAG 2.1).
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#3C1642' : '#FFFFFF'
}
