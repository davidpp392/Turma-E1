import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Gera iniciais a partir do nome (máx. 2 letras) */
export function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Cor de fundo determinística para avatar com iniciais */
export function getAvatarColor(nome: string): string {
  const colors = [
    'bg-zinc-700',
    'bg-stone-700',
    'bg-neutral-700',
    'bg-zinc-600',
    'bg-stone-600',
    'bg-neutral-600',
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isDuplicateAtividadeError(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'duplicate-atividade' ||
    error.code === '23505' ||
    (error.message?.includes('duplicate-atividade') ?? false) ||
    (error.message?.includes('idx_atividades_unique_lower_titulo') ?? false)
  );
}
