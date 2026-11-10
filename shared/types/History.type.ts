/** Qué se puede registrar en el historial. */
export type HistoryAction = 'added' | 'removed' | 'bought' | 'qty-changed' | 'total-set';

/** Una línea del historial. Solo se crea, nunca se edita ni se borra. */
export type HistoryEntry = {
  id: string;
  action: HistoryAction;
  itemName: string;
  qty: number;
  byUid: string;
  byName: string;
  at: number;
  /** Solo en 'total-set': la compra y el importe que se le puso. */
  tripId?: string;
  total?: number | null;
};
