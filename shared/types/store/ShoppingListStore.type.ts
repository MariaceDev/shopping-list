import type { ShoppingItem } from '../ShoppingItem.type'
import type { ShoppingTrip } from '../ShoppingTrip.type'

export type ShoppingListState = {
  items: ShoppingItem[];
  loading: boolean;
};

export type ShoppingListGetters = {
  /** Lo que ya está en el carro durante el modo tienda. */
  inCart: ShoppingItem[];
  /** Lo que falta por coger. */
  pending: ShoppingItem[];
};

export type ShoppingListActions = {
  /** Añadir un producto. Si ya está en la lista, suma unidades. */
  addItem: (name: string, qty?: number) => Promise<void>;
  /** Cambiar las unidades. Bajar de 1 borra el producto. */
  setQty: (itemId: string, qty: number) => Promise<void>;
  /** Meter o sacar del carro durante el modo tienda. */
  toggleDone: (itemId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  /** Guardar lo del carro como compra terminada y quitarlo de la lista. */
  finishTrip: () => Promise<void>;
  /** Devolver a la lista todo lo de una compra pasada. */
  repeatTrip: (trip: ShoppingTrip) => Promise<void>;
};

export type ShoppingListStore = ShoppingListState & ShoppingListGetters & ShoppingListActions;
