import type { FirebaseApp } from 'firebase/app'
import type { Auth, User } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

/** Lo que deja montado el plugin de Firebase: app, servicios y sesión. */
export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  user: User;
};
