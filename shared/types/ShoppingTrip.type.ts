/** Un producto tal y como quedó al cerrar una compra. */
export type TripItem = {
  name: string;
  qty: number;
};

/**
 * Una compra terminada. Nunca se borra, y lo único que se puede cambiar
 * después es lo que costó.
 */
export type ShoppingTrip = {
  id: string;
  at: number;
  byUid: string;
  byName: string;
  items: TripItem[];
  /** Lo que costó, en euros. null mientras no se apunte en el Historial. */
  total: number | null;
};
