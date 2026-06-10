'use client';

import ProfileSection from '@/components/perfil/ProfileSection';
import { listNotificacoes, markNotificacaoRead, subscribeNotificacoes } from '@/lib/supabase/db';
import { formatDateTime } from '@/lib/utils';
import type { Notificacao } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ProfileNotificationsProps {
  userId: string;
}

export default function ProfileNotifications({ userId }: ProfileNotificationsProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef(new Set<string>());

  const fetchNotificacoes = useCallback(async () => {
    const data = await listNotificacoes(userId, 8);
    data.forEach((n) => seenIds.current.add(n.id));
    setNotificacoes(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotificacoes();
    const unsubscribe = subscribeNotificacoes(userId, () => fetchNotificacoes());
    return () => unsubscribe();
  }, [userId, fetchNotificacoes]);

  const markAsRead = async (id: string) => {
    await markNotificacaoRead(id);
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const unread = notificacoes.filter((n) => !n.lida).length;

  return (
    <ProfileSection
      title="Notificações"
      description={unread > 0 ? `${unread} não lida${unread > 1 ? 's' : ''}` : 'Alertas e mensagens recebidas'}
    >
      {loading ? (
        <p className="text-sm text-text-muted">Carregando...</p>
      ) : notificacoes.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhuma notificação.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {notificacoes.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => !n.lida && markAsRead(n.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  n.lida ? 'border-border-muted opacity-60' : 'border-border bg-accent-subtle/30'
                }`}
              >
                <p className="text-sm text-text-primary">{n.titulo}</p>
                <p className="text-xs text-text-muted mt-0.5">{n.mensagem}</p>
                <p className="text-[11px] text-text-muted mt-1">{formatDateTime(n.created_at)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </ProfileSection>
  );
}
