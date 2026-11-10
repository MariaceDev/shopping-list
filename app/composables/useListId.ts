/**
 * El id de la lista abierta, que decidió el plugin list.client.ts.
 * Solo se usa por debajo de ListGate, donde siempre hay una lista.
 */
export function useListId(): string {
  const { $listId } = useNuxtApp()
  if (typeof $listId !== 'string') throw new Error('No hay ninguna lista abierta')
  return $listId
}
