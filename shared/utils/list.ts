/**
 * Id de la primera lista que hubo. Quien ya era miembro de ella entra sin
 * enlace, como antes de que hubiera varias listas.
 */
export const DEFAULT_LIST_ID = 'casa'

/** Nombre que se enseña si la lista no tiene uno guardado. */
export const DEFAULT_LIST_NAME = 'Lista de la compra'

/** Parámetro del enlace que abre una lista: `/?lista=<id>`. */
export const LIST_PARAM = 'lista'

/** Dónde recuerda cada dispositivo la última lista abierta. */
export const LIST_STORAGE_KEY = 'lista-actual'

const LIST_ID_PATTERN = /^[a-z0-9-]{3,40}$/

/** Si un texto vale como id de lista (minúsculas, cifras y guiones). */
export function isValidListId(value: unknown): value is string {
  return typeof value === 'string' && LIST_ID_PATTERN.test(value)
}

/** La lista a abrir: la del enlace manda; si no, la última guardada. */
export function pickListId(fromUrl: unknown, stored: unknown): string | null {
  if (isValidListId(fromUrl)) return fromUrl
  if (isValidListId(stored)) return stored
  return null
}

/**
 * Id nuevo y difícil de adivinar: quien tenga el enlace puede entrar en la
 * lista, así que no puede ser algo como «mama».
 */
export function newListId(length = 12): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

/** El enlace que abre una lista. */
export function listLink(origin: string, listId: string): string {
  return `${origin}/?${LIST_PARAM}=${encodeURIComponent(listId)}`
}

/** Saca el id de un enlace pegado (o del id a secas). */
export function listIdFromLink(text: string): string | null {
  const clean = text.trim()
  if (isValidListId(clean)) return clean
  try {
    const id = new URL(clean).searchParams.get(LIST_PARAM)
    return isValidListId(id) ? id : null
  } catch {
    return null
  }
}
