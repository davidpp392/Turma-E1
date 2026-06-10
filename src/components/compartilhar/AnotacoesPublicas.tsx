'use client';

import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { listAnotacoesPublicas } from '@/lib/supabase/db';
import { animateCardsIn } from '@/lib/gsap';
import { formatDateTime } from '@/lib/utils';
import type { Anotacao, Materia } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface AnotacoesPublicasProps {
  materias: Materia[];
}

export default function AnotacoesPublicas({ materias }: AnotacoesPublicasProps) {
  const [filtroMateria, setFiltroMateria] = useState('');
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnotacoes = useCallback(async () => {
    const data = await listAnotacoesPublicas(filtroMateria || undefined);
    setAnotacoes(data);
    setLoading(false);
  }, [filtroMateria]);

  useEffect(() => {
    setLoading(true);
    fetchAnotacoes();
  }, [fetchAnotacoes]);

  useEffect(() => {
    if (!loading && anotacoes.length > 0) {
      setTimeout(() => animateCardsIn('.anotacao-card'), 50);
    }
  }, [anotacoes, loading]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Anotações da turma</h2>
      <Select
        label="Filtrar por matéria"
        value={filtroMateria}
        onChange={(e) => setFiltroMateria(e.target.value)}
        options={[{ value: '', label: 'Todas' }, ...materias.map((m) => ({ value: m.id, label: m.nome }))]}
        className="mb-4 max-w-xs"
      />
      {loading ? (
        <p className="text-text-muted">Carregando...</p>
      ) : anotacoes.length === 0 ? (
        <p className="text-text-muted">Nenhuma anotação pública encontrada</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {anotacoes.map((a) => (
            <Card key={a.id} className="anotacao-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                  {a.materias?.nome || 'Geral'}
                </span>
                <span className="text-xs text-text-muted">{formatDateTime(a.created_at)}</span>
              </div>
              <h3 className="font-semibold text-text-primary">{a.titulo}</h3>
              {a.conteudo && <p className="mt-1 text-sm text-text-secondary">{a.conteudo}</p>}
              {a.arquivos?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {a.arquivos.map((arq, i) => (
                    <a
                      key={i}
                      href={arq.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline"
                    >
                      📎 {arq.nome}
                    </a>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-text-muted">por {a.profiles?.nome}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
