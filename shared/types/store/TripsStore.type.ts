import type { ShoppingTrip } from '../ShoppingTrip.type'

export type TripsState = {
  /** Las compras terminadas, de la más reciente a la más vieja. */
  trips: ShoppingTrip[];
  loading: boolean;
};

export type TripsActions = {
  /** Apuntar (o quitar, con null) lo que costó una compra. */
  setTotal: (tripId: string, total: number | null) => Promise<void>;
};

export type TripsStore = TripsState & TripsActions;
