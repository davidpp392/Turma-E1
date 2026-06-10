import { createClient } from '@/lib/supabase/client';
import type { User } from 'firebase/auth';

/** Vincula sessão Supabase ao token Firebase (Third-Party Auth) */
export async function linkSupabaseSession(user: User): Promise<void> {
  const token = await user.getIdToken();
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'firebase',
    token,
  });
  if (error) throw error;
}

export async function unlinkSupabaseSession(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
