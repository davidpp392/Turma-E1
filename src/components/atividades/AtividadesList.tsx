'use client';

import AtividadeCard from '@/components/atividades/AtividadeCard';
import AtividadeForm from '@/components/atividades/AtividadeForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { deleteAtividade, listAtividades, subscribeAtividades } from '@/lib/supabase/db';
import { animateCardsIn } from '@/lib/gsap';
import type { Atividade, Materia } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AtividadesListProps {
  materias: Materia[];
  userId: string;
}

export default function AtividadesList({ materias, userId }: AtividadesListProps) {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [filtroMateria, setFiltroMateria] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Atividade | null>(null);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchAtividades = useCallback(async () => {
    const data = await listAtividades(filtroMateria || undefined);
    setAtividades(data);
    setLoading(false);
  }, [filtroMateria]);

  useEffect(() => {
    setLoading(true);
    fetchAtividades();
  }, [fetchAtividades]);

  useEffect(() => {
    if (!loading && listRef.current) {
      const cards = listRef.current.querySelectorAll('.animate-card');
      if (cards.length > 0) animateCardsIn('.animate-card');
    }
  }, [atividades, loading]);

  useEffect(() => {
    const unsubscribe = subscribeAtividades((data) => {
      setAtividades(data);
      setLoading(false);
    }, filtroMateria || undefined);

    return () => unsubscribe();
  }, [filtroMateria]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;
    await deleteAtividade(id, userId);
    setAtividades((prev) => prev.filter((a) => a.id !== id));
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditing(null);
    fetchAtividades();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select
          label="Filtrar por matéria"
          value={filtroMateria}
          onChange={(e) => setFiltroMateria(e.target.value)}
          options={[{ value: '', label: 'Todas as matérias' }, ...materias.map((m) => ({ value: m.id, label: m.nome }))]}
          className="sm:max-w-xs"
        />
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          + Nova atividade
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : atividades.length === 0 ? (
        <p className="text-center text-text-muted py-12">Nenhuma atividade encontrada</p>
      ) : (
        <div ref={listRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {atividades.map((a) => (
            <AtividadeCard
              key={a.id}
              atividade={a}
              currentUserId={userId}
              onEdit={(atv) => { setEditing(atv); setShowForm(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Editar atividade' : 'Nova atividade'}
        className="max-w-2xl"
      >
        <AtividadeForm
          materias={materias}
          userId={userId}
          atividade={editing || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
