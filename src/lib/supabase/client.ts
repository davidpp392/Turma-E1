import { getSupabaseEnv } from '@/lib/supabase/env';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local',
    );
  }
  return createBrowserClient(env.url, env.key);
}
