/** Un producto de la lista. */
export type ShoppingItem = {
  id: string;
  name: string;
  qty: number;
  done: boolean;
  addedByUid: string;
  addedByName: string;
  createdAt: number;
  updatedAt: number;
};
