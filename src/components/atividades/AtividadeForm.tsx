'use client';

import FileUpload from '@/components/shared/FileUpload';
import UserSearch from '@/components/shared/UserSearch';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { createAtividade, updateAtividade } from '@/lib/supabase/db';
import { sanitizeText } from '@/lib/sanitize';
import { uploadFiles } from '@/lib/storage';
import { isDuplicateAtividadeError } from '@/lib/utils';
import { atividadeSchema } from '@/lib/validations';
import type { ArquivoAnexo, Atividade, Materia } from '@/types';
import { FormEvent, useState } from 'react';

interface AtividadeFormProps {
  materias: Materia[];
  userId: string;
  atividade?: Atividade;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AtividadeForm({
  materias,
  userId,
  atividade,
  onSuccess,
  onCancel,
}: AtividadeFormProps) {
  const isEditing = !!atividade;
  const [titulo, setTitulo] = useState(atividade?.titulo || '');
  const [descricao, setDescricao] = useState(atividade?.descricao || '');
  const [materiaId, setMateriaId] = useState(atividade?.materia_id || '');
  const [dataEntrega, setDataEntrega] = useState(atividade?.data_entrega || '');
  const [visibilidade, setVisibilidade] = useState<'turma' | 'individual'>(
    atividade?.visibilidade || 'turma',
  );
  const [destinatarioId, setDestinatarioId] = useState<string | null>(
    atividade?.destinatario_id || null,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ArquivoAnexo[]>(atividade?.arquivos || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = atividadeSchema.safeParse({
      titulo,
      descricao,
      materia_id: materiaId,
      data_entrega: dataEntrega,
      visibilidade,
      destinatario_id: destinatarioId,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    let arquivos = [...existingFiles];

    if (files.length > 0) {
      const { arquivos: uploaded, error: uploadError } = await uploadFiles(
        files,
        'atividades',
        userId,
      );
      if (uploadError) {
        setErrors({ form: uploadError });
        setLoading(false);
        return;
      }
      arquivos = [...arquivos, ...uploaded];
    }

    const payload = {
      titulo: sanitizeText(titulo, 200),
      descricao: sanitizeText(descricao, 5000),
      materia_id: materiaId,
      data_entrega: dataEntrega,
      visibilidade,
      destinatario_id: visibilidade === 'individual' ? destinatarioId : null,
      arquivos,
      autor_id: userId,
    };

    try {
      if (isEditing) {
        await updateAtividade(atividade.id, userId, payload);
      } else {
        await createAtividade(payload);
      }
      onSuccess();
    } catch (error) {
      if (isDuplicateAtividadeError(error as { code?: string; message?: string })) {
        setErrors({
          form: 'Já existe uma atividade com este título, data de entrega e matéria.',
        });
      } else {
        setErrors({ form: (error as Error).message });
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        error={errors.titulo}
        required
      />
      <Textarea
        label="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        error={errors.descricao}
      />
      <Select
        label="Matéria"
        value={materiaId}
        onChange={(e) => setMateriaId(e.target.value)}
        options={materias.map((m) => ({ value: m.id, label: m.nome }))}
        disabled={materias.length === 0}
        placeholder="Selecione a matéria"
        error={errors.materia_id}
        required
      />
      {materias.length === 0 && (
        <p className="text-sm text-text-muted">Nenhuma matéria cadastrada. Peça ao responsável para cadastrar as matérias.</p>
      )}
      <Input
        label="Data de entrega"
        type="date"
        value={dataEntrega}
        onChange={(e) => setDataEntrega(e.target.value)}
        error={errors.data_entrega}
        required
      />
      <Select
        label="Visibilidade"
        value={visibilidade}
        onChange={(e) => setVisibilidade(e.target.value as 'turma' | 'individual')}
        options={[
          { value: 'turma', label: 'Turma inteira' },
          { value: 'individual', label: 'Aluno individual' },
        ]}
      />
      {visibilidade === 'individual' && (
        <UserSearch
          value={destinatarioId}
          onChange={(id) => setDestinatarioId(id)}
          excludeId={userId}
          error={errors.destinatario_id}
        />
      )}
      <FileUpload files={files} onChange={setFiles} />
      {existingFiles.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm text-text-secondary">Arquivos existentes:</p>
          {existingFiles.map((arq, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <a href={arq.url ?? '#'} target="_blank" rel="noopener noreferrer" className="text-accent">
                {arq.nome}
              </a>
              <button
                type="button"
                onClick={() => setExistingFiles(existingFiles.filter((_, j) => j !== i))}
                className="text-danger text-xs"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
      {errors.form && (
        <p className="text-sm text-danger" role="alert">
          {errors.form}
        </p>
      )}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? 'Salvar' : 'Criar atividade'}
        </Button>
      </div>
    </form>
  );
}
