'use client';

import ProfileSection from '@/components/perfil/ProfileSection';
import {
  addMateriaFavorita,
  listMaterias,
  listMateriasFavoritas,
  removeMateriaFavorita,
} from '@/lib/supabase/db';
import { cn } from '@/lib/utils';
import type { Materia } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface ProfileFavoriteSubjectsProps {
  userId: string;
}

export default function ProfileFavoriteSubjects({ userId }: ProfileFavoriteSubjectsProps) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [allMaterias, favIds] = await Promise.all([
      listMaterias(),
      listMateriasFavoritas(userId),
    ]);
    setMaterias(allMaterias);
    setFavoritos(new Set(favIds));
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = async (materiaId: string) => {
    const isFav = favoritos.has(materiaId);

    if (isFav) {
      await removeMateriaFavorita(userId, materiaId);
      setFavoritos((prev) => {
        const next = new Set(prev);
        next.delete(materiaId);
        return next;
      });
    } else {
      await addMateriaFavorita(userId, materiaId);
      setFavoritos((prev) => new Set(prev).add(materiaId));
    }
  };

  const favoritas = materias.filter((m) => favoritos.has(m.id));

  return (
    <ProfileSection title="Matérias favoritas" description="Disciplinas que você mais gosta">
      {loading ? (
        <p className="text-sm text-text-muted">Carregando...</p>
      ) : (
        <>
          {favoritas.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {favoritas.map((m) => (
                <span
                  key={m.id}
                  className="rounded-full border border-border bg-accent-subtle px-3 py-1 text-xs text-text-primary"
                >
                  {m.nome}
                </span>
              ))}
            </div>
          )}
          <p className="mb-3 text-xs text-text-muted">Toque para adicionar ou remover:</p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {materias.map((m) => {
              const active = favoritos.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors',
                    active
                      ? 'border-text-primary bg-text-primary text-surface'
                      : 'border-border text-text-muted hover:border-border-focus hover:text-text-secondary',
                  )}
                >
                  {m.nome}
                </button>
              );
            })}
          </div>
        </>
      )}
    </ProfileSection>
  );
}
