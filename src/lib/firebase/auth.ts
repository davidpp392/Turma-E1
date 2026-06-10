import { linkSupabaseSession, unlinkSupabaseSession } from '@/lib/supabase/bridge';
import { getFirebaseAuth } from '@/lib/firebase/client';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  type User,
} from 'firebase/auth';

export async function signIn(email: string, password: string) {
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await linkSupabaseSession(credential.user);
  return credential.user;
}

export async function signUp(email: string, password: string) {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await linkSupabaseSession(credential.user);
  return credential.user;
}

export async function signOut() {
  await firebaseSignOut(getFirebaseAuth());
  await unlinkSupabaseSession();
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}

export async function getCurrentUserAsync(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser;
  await auth.authStateReady();
  return auth.currentUser;
}

export async function changePassword(newPassword: string) {
  const user = await getCurrentUserAsync();
  if (!user) throw new Error('Usuário não autenticado');
  await updatePassword(user, newPassword);
}
