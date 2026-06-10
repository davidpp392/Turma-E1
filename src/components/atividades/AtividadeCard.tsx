'use client';

import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import type { Atividade } from '@/types';

interface AtividadeCardProps {
  atividade: Atividade;
  currentUserId?: string;
  onEdit?: (atividade: Atividade) => void;
  onDelete?: (id: string) => void;
}

export default function AtividadeCard({
  atividade,
  currentUserId,
  onEdit,
  onDelete,
}: AtividadeCardProps) {
  const isAuthor = currentUserId === atividade.autor_id;
  const materiaNome = atividade.materias?.nome || 'Matéria';
  const autorNome = atividade.profiles?.nome || 'Autor';

  return (
    <Card dataAnimate className="animate-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-text-muted">
              {materiaNome}
            </span>
            {atividade.visibilidade === 'individual' && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-text-muted">
                Individual
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-text-primary">{atividade.titulo}</h3>
          {atividade.descricao && (
            <p className="mt-1 text-sm text-text-secondary line-clamp-2">{atividade.descricao}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-text-secondary">{formatDate(atividade.data_entrega)}</p>
          <p className="text-xs text-text-muted">entrega</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Avatar
          nome={autorNome}
          avatarUrl={atividade.profiles?.avatar_url}
          size="sm"
        />
        <span className="text-xs text-text-muted">{autorNome}</span>
      </div>

      {atividade.arquivos?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {atividade.arquivos.map((arq, i) => (
            <a
              key={i}
              href={arq.url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-surface-overlay px-2 py-1 text-xs text-accent hover:underline"
            >
              📎 {arq.nome}
            </a>
          ))}
        </div>
      )}

      {isAuthor && (
        <div className="mt-4 flex gap-2 border-t border-border-muted pt-3">
          <Button variant="secondary" size="sm" onClick={() => onEdit?.(atividade)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete?.(atividade.id)}>
            Excluir
          </Button>
        </div>
      )}
    </Card>
  );
}
