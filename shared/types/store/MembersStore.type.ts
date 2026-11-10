import type { ListMember } from '../ListMember.type'

export type MembersState = {
  members: ListMember[];
  loading: boolean;
};

export type MembersGetters = {
  /** Tu ficha de miembro, o null si aún no has entrado. */
  me: ListMember | null;
};

export type MembersActions = {
  /** Entrar en la lista con un nombre y un color de la paleta. */
  join: (name: string, color: string) => Promise<void>;
  updateProfile: (name: string, color: string) => Promise<void>;
};

export type MembersStore = MembersState & MembersGetters & MembersActions;
