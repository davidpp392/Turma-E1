'use client';

import Avatar from '@/components/ui/Avatar';
import { listProfiles } from '@/lib/supabase/db';
import { animateCardsIn } from '@/lib/gsap';
import type { Profile } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function AlunosGallery() {
  const [alunos, setAlunos] = useState<Profile[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchAlunos = useCallback(async () => {
    const data = await listProfiles();
    setAlunos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAlunos();
  }, [fetchAlunos]);

  useEffect(() => {
    if (!loading && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.aluno-card');
      if (cards.length > 0) animateCardsIn('.aluno-card');
    }
  }, [alunos, loading, busca]);

  const filtrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase().trim()),
  );

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border border-text-muted border-t-text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          <span className="text-text-primary font-medium">{filtrados.length}</span>
          {filtrados.length === 1 ? ' aluno' : ' alunos'}
        </p>
        <input
          type="search"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full sm:max-w-xs rounded-full border border-border bg-surface-overlay/50 px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-0"
          aria-label="Buscar aluno por nome"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-24 text-center">
          <p className="text-text-secondary">
            {busca ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado ainda.'}
          </p>
          {!busca && (
            <p className="mt-1 text-sm text-text-muted">
              Os perfis aparecem aqui quando os colegas criam conta.
            </p>
          )}
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {filtrados.map((aluno) => (
            <article
              key={aluno.id}
              className="aluno-card glass-card group flex flex-col items-center p-6 text-center"
            >
              <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
                <Avatar nome={aluno.nome} avatarUrl={aluno.avatar_url} size="2xl" ring />
              </div>
              <h3 className="text-sm font-medium leading-snug text-text-primary">{aluno.nome}</h3>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
