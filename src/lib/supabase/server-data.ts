import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { Atividade } from '@/types';

export interface ServerUser {
  id: string;
  email: string | null;
}

export async function getServerUser(): Promise<ServerUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

export async function getServerMaterias() {
  const supabase = await createClient();
  const { data } = await supabase.from('materias').select('*').order('nome');
  return data ?? [];
}

export async function getServerDashboardData() {
  if (!isSupabaseConfigured()) {
    return { proximas: [] as Atividade[], materiasCount: 0, alunosCount: 0, anotacoesCount: 0 };
  }

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const [{ data: proximas }, { count: materiasCount }, { count: alunosCount }, { count: anotacoesCount }] =
    await Promise.all([
      supabase
        .from('atividades')
        .select('*, materias(nome)')
        .gte('data_entrega', today)
        .order('data_entrega', { ascending: true })
        .limit(5),
      supabase.from('materias').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('anotacoes')
        .select('*', { count: 'exact', head: true })
        .eq('visibilidade', 'turma'),
    ]);

  return {
    proximas: (proximas ?? []) as Atividade[],
    materiasCount: materiasCount ?? 0,
    alunosCount: alunosCount ?? 0,
    anotacoesCount: anotacoesCount ?? 0,
  };
}
