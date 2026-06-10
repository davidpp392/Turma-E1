'use client';

import ProfileSection from '@/components/perfil/ProfileSection';
import { listAtividadesByAutor } from '@/lib/supabase/db';
import { formatDate } from '@/lib/utils';
import type { Atividade } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ProfileRecentActivitiesProps {
  userId: string;
}

export default function ProfileRecentActivities({ userId }: ProfileRecentActivitiesProps) {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAtividadesByAutor(userId, 5).then((data) => {
      setAtividades(data);
      setLoading(false);
    });
  }, [userId]);

  return (
    <ProfileSection title="Atividades recentes" description="Trabalhos e provas que você criou">
      {loading ? (
        <p className="text-sm text-text-muted">Carregando...</p>
      ) : atividades.length === 0 ? (
        <p className="text-sm text-text-muted">Você ainda não criou atividades.</p>
      ) : (
        <ul className="space-y-2">
          {atividades.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border-muted px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">{a.titulo}</p>
                <p className="text-xs text-text-muted">{a.materias?.nome}</p>
              </div>
              <time className="shrink-0 text-xs text-text-muted">{formatDate(a.data_entrega)}</time>
            </li>
          ))}
        </ul>
      )}
      <Link href="/atividades" className="mt-4 inline-block text-xs text-text-muted hover:text-text-primary">
        Ver todas →
      </Link>
    </ProfileSection>
  );
}
