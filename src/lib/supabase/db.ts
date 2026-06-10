import { createClient } from '@/lib/supabase/client';
import { isDuplicateAtividadeError } from '@/lib/utils';
import type {
  Anotacao,
  ArquivoAnexo,
  ArquivoPessoal,
  Atividade,
  Materia,
  Notificacao,
  Profile,
} from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

type Unsubscribe = () => void;

// ─── Profiles ───────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!data) return null;
  return { ...data, bio: data.bio ?? '' };
}

export async function upsertProfile(
  userId: string,
  data: Partial<Pick<Profile, 'nome' | 'email' | 'avatar_url' | 'bio'>>,
): Promise<void> {
  const supabase = createClient();
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).single();

  if (existing) {
    await supabase.from('profiles').update(data).eq('id', userId);
  } else {
    await supabase.from('profiles').insert({
      id: userId,
      nome: data.nome ?? '',
      email: data.email ?? '',
      avatar_url: data.avatar_url ?? null,
      bio: data.bio ?? '',
    });
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<Pick<Profile, 'nome' | 'avatar_url' | 'bio'>>,
): Promise<void> {
  const supabase = createClient();
  await supabase.from('profiles').update(data).eq('id', userId);
}

export async function listProfiles(): Promise<Profile[]> {
  const supabase = createClient();
  const { data } = await supabase.from('profiles').select('*').order('nome');
  return (data ?? []).map((p) => ({ ...p, bio: p.bio ?? '' }));
}

export async function searchProfiles(term: string, excludeId?: string): Promise<Profile[]> {
  const q = term.toLowerCase().trim();
  if (q.length < 2) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`nome.ilike.%${q}%,email.ilike.%${q}%`)
    .limit(8);
  return (data ?? [])
    .filter((p) => p.id !== excludeId)
    .map((p) => ({ ...p, bio: p.bio ?? '' }));
}

// ─── Matérias ───────────────────────────────────────────────

export async function listMaterias(): Promise<Materia[]> {
  const supabase = createClient();
  const { data } = await supabase.from('materias').select('*').order('nome');
  return data ?? [];
}

// ─── Atividades ─────────────────────────────────────────────

export async function checkDuplicateAtividade(
  titulo: string,
  materiaId: string,
  dataEntrega: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('atividades')
    .select('id, titulo')
    .eq('materia_id', materiaId)
    .eq('data_entrega', dataEntrega);

  const normalized = titulo.trim().toLowerCase();
  return (data ?? []).some(
    (row) => row.id !== excludeId && (row.titulo ?? '').trim().toLowerCase() === normalized,
  );
}

export async function listAtividades(filtroMateria?: string): Promise<Atividade[]> {
  const supabase = createClient();
  let query = supabase
    .from('atividades')
    .select('*, materias(nome), profiles:autor_id(nome, avatar_url)')
    .order('data_entrega', { ascending: true });

  if (filtroMateria) query = query.eq('materia_id', filtroMateria);

  const { data } = await query;
  return (data ?? []) as Atividade[];
}

export async function createAtividade(
  data: Omit<Atividade, 'id' | 'created_at' | 'updated_at' | 'materias' | 'profiles'>,
): Promise<string> {
  const isDuplicate = await checkDuplicateAtividade(data.titulo, data.materia_id, data.data_entrega);
  if (isDuplicate) {
    const err = new Error('duplicate-atividade') as Error & { code?: string };
    err.code = 'duplicate-atividade';
    throw err;
  }

  const supabase = createClient();
  const { data: inserted, error } = await supabase.from('atividades').insert(data).select('id').single();

  if (error) {
    if (isDuplicateAtividadeError(error)) {
      const err = new Error('duplicate-atividade') as Error & { code?: string };
      err.code = 'duplicate-atividade';
      throw err;
    }
    throw error;
  }

  return inserted.id;
}

export async function updateAtividade(
  id: string,
  _userId: string,
  data: Omit<Atividade, 'id' | 'created_at' | 'updated_at' | 'materias' | 'profiles'>,
): Promise<void> {
  const isDuplicate = await checkDuplicateAtividade(
    data.titulo,
    data.materia_id,
    data.data_entrega,
    id,
  );
  if (isDuplicate) {
    const err = new Error('duplicate-atividade') as Error & { code?: string };
    err.code = 'duplicate-atividade';
    throw err;
  }

  const supabase = createClient();
  const { error } = await supabase.from('atividades').update(data).eq('id', id);
  if (error) {
    if (isDuplicateAtividadeError(error)) {
      const err = new Error('duplicate-atividade') as Error & { code?: string };
      err.code = 'duplicate-atividade';
      throw err;
    }
    throw error;
  }
}

export async function deleteAtividade(id: string, userId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('atividades').delete().eq('id', id).eq('autor_id', userId);
}

export function subscribeAtividades(
  onChange: (atividades: Atividade[]) => void,
  filtroMateria?: string,
): Unsubscribe {
  const supabase = createClient();
  let channel: RealtimeChannel;

  const refresh = () => {
    listAtividades(filtroMateria).then(onChange);
  };

  channel = supabase
    .channel(`atividades-${filtroMateria ?? 'all'}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'atividades' }, refresh)
    .subscribe();

  refresh();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function listAtividadesByAutor(userId: string, max = 5): Promise<Atividade[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('atividades')
    .select('*, materias(nome)')
    .eq('autor_id', userId)
    .order('created_at', { ascending: false })
    .limit(max);
  return (data ?? []) as Atividade[];
}

export async function countAtividadesByAutor(userId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('atividades')
    .select('*', { count: 'exact', head: true })
    .eq('autor_id', userId);
  return count ?? 0;
}

// ─── Anotações ──────────────────────────────────────────────

export async function listAnotacoesPublicas(filtroMateria?: string): Promise<Anotacao[]> {
  const supabase = createClient();
  let query = supabase
    .from('anotacoes')
    .select('*, materias(nome), profiles:autor_id(nome, avatar_url)')
    .eq('visibilidade', 'turma')
    .order('created_at', { ascending: false });

  if (filtroMateria) query = query.eq('materia_id', filtroMateria);

  const { data } = await query;
  return (data ?? []) as Anotacao[];
}

export async function createAnotacao(
  data: Omit<Anotacao, 'id' | 'created_at' | 'materias' | 'profiles'>,
): Promise<string> {
  const supabase = createClient();
  const { data: inserted, error } = await supabase.from('anotacoes').insert(data).select('id').single();
  if (error) throw error;
  return inserted.id;
}

export async function countAnotacoesByAutor(userId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('anotacoes')
    .select('*', { count: 'exact', head: true })
    .eq('autor_id', userId);
  return count ?? 0;
}

export async function countAnotacoesTurma(): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('anotacoes')
    .select('*', { count: 'exact', head: true })
    .eq('visibilidade', 'turma');
  return count ?? 0;
}

// ─── Notificações ───────────────────────────────────────────

export async function listNotificacoes(userId: string, max = 20): Promise<Notificacao[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false })
    .limit(max);
  return data ?? [];
}

export function subscribeNotificacoes(
  userId: string,
  onInsert: (notificacao: Notificacao) => void,
): Unsubscribe {
  const supabase = createClient();
  const channel = supabase
    .channel(`notificacoes-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: `usuario_id=eq.${userId}`,
      },
      (payload) => onInsert(payload.new as Notificacao),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function markNotificacaoRead(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
}

export async function markAllNotificacoesRead(userId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('usuario_id', userId)
    .eq('lida', false);
}

// ─── Arquivos pessoais ──────────────────────────────────────

export async function listArquivosPessoais(userId: string): Promise<ArquivoPessoal[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('arquivos_pessoais')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createArquivoPessoal(
  data: Omit<ArquivoPessoal, 'id' | 'created_at' | 'updated_at'>,
): Promise<void> {
  const supabase = createClient();
  await supabase.from('arquivos_pessoais').insert(data);
}

export async function updateArquivoPessoal(
  id: string,
  data: Omit<ArquivoPessoal, 'id' | 'created_at' | 'updated_at' | 'usuario_id'>,
): Promise<void> {
  const supabase = createClient();
  await supabase.from('arquivos_pessoais').update(data).eq('id', id);
}

export async function deleteArquivoPessoal(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('arquivos_pessoais').delete().eq('id', id);
}

// ─── Matérias favoritas ─────────────────────────────────────

export async function listMateriasFavoritas(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('materias_favoritas')
    .select('materia_id')
    .eq('usuario_id', userId);
  return (data ?? []).map((r) => r.materia_id);
}

export async function addMateriaFavorita(userId: string, materiaId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('materias_favoritas').upsert({ usuario_id: userId, materia_id: materiaId });
}

export async function removeMateriaFavorita(userId: string, materiaId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('materias_favoritas')
    .delete()
    .eq('usuario_id', userId)
    .eq('materia_id', materiaId);
}

export async function countMateriasFavoritas(userId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('materias_favoritas')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', userId);
  return count ?? 0;
}

// ─── Dashboard ──────────────────────────────────────────────

export async function listProximasAtividades(max = 5): Promise<Atividade[]> {
  const today = new Date().toISOString().split('T')[0];
  const supabase = createClient();
  const { data } = await supabase
    .from('atividades')
    .select('*, materias(nome)')
    .gte('data_entrega', today)
    .order('data_entrega', { ascending: true })
    .limit(max);
  return (data ?? []) as Atividade[];
}

export async function countProfiles(): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  return count ?? 0;
}
