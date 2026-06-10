'use client';

import {
  listNotificacoes,
  markAllNotificacoesRead,
  markNotificacaoRead,
  subscribeNotificacoes,
} from '@/lib/supabase/db';
import { animateNotificationIn, pulseBadge } from '@/lib/gsap';
import { formatDateTime } from '@/lib/utils';
import type { Notificacao } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface NotificationPanelProps {
  userId: string;
}

export default function NotificationPanel({ userId }: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set<string>());

  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  const fetchNotificacoes = useCallback(async () => {
    const data = await listNotificacoes(userId, 20);
    data.forEach((n) => seenIds.current.add(n.id));
    setNotificacoes(data);
  }, [userId]);

  useEffect(() => {
    fetchNotificacoes();

    const unsubscribe = subscribeNotificacoes(userId, (nova) => {
      if (seenIds.current.has(nova.id)) return;
      seenIds.current.add(nova.id);
      setNotificacoes((prev) => [nova, ...prev].slice(0, 20));
      if (badgeRef.current) pulseBadge(badgeRef.current);
    });

    return () => unsubscribe();
  }, [userId, fetchNotificacoes]);

  useEffect(() => {
    if (open && panelRef.current) {
      const items = panelRef.current.querySelectorAll('[data-notification]');
      items.forEach((el, i) => {
        setTimeout(() => animateNotificationIn(el as HTMLElement), i * 50);
      });
    }
  }, [open, notificacoes]);

  const markAsRead = async (id: string) => {
    await markNotificacaoRead(id);
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const markAllRead = async () => {
    await markAllNotificacoesRead(userId);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-overlay"
        aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
        aria-expanded={open}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            ref={badgeRef}
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            ref={panelRef}
            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-surface-raised shadow-xl"
            role="region"
            aria-label="Painel de notificações"
          >
            <div className="flex items-center justify-between border-b border-border p-3">
              <h3 className="text-sm font-semibold text-text-primary">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-accent hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <p className="p-4 text-center text-sm text-text-muted">Nenhuma notificação</p>
              ) : (
                notificacoes.map((n) => (
                  <button
                    key={n.id}
                    data-notification
                    onClick={() => !n.lida && markAsRead(n.id)}
                    className={`w-full border-b border-border-muted p-3 text-left transition-colors hover:bg-surface-overlay ${
                      !n.lida ? 'bg-accent/5' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-text-primary">{n.titulo}</p>
                    <p className="text-xs text-text-muted">{n.mensagem}</p>
                    <p className="mt-1 text-xs text-text-muted">{formatDateTime(n.created_at)}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
