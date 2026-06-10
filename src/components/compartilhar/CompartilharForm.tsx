'use client';

import FileUpload from '@/components/shared/FileUpload';
import UserSearch from '@/components/shared/UserSearch';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { createAnotacao } from '@/lib/supabase/db';
import { sanitizeText } from '@/lib/sanitize';
import { uploadFiles } from '@/lib/storage';
import { anotacaoSchema } from '@/lib/validations';
import type { ArquivoAnexo, Materia } from '@/types';
import { FormEvent, useState } from 'react';

interface CompartilharFormProps {
  materias: Materia[];
  userId: string;
  onSuccess?: () => void;
}

export default function CompartilharForm({ materias, userId, onSuccess }: CompartilharFormProps) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [visibilidade, setVisibilidade] = useState<'turma' | 'individual'>('turma');
  const [destinatarioId, setDestinatarioId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = anotacaoSchema.safeParse({
      titulo,
      conteudo,
      materia_id: visibilidade === 'turma' ? materiaId : null,
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

    let arquivos: ArquivoAnexo[] = [];
    if (files.length > 0) {
      const { arquivos: uploaded, error: uploadError } = await uploadFiles(
        files,
        'anotacoes',
        userId,
      );
      if (uploadError) {
        setErrors({ form: uploadError });
        setLoading(false);
        return;
      }
      arquivos = uploaded;
    }

    try {
      await createAnotacao({
        titulo: sanitizeText(titulo, 200),
        conteudo: sanitizeText(conteudo, 10000),
        materia_id: visibilidade === 'turma' ? materiaId : null,
        visibilidade,
        destinatario_id: visibilidade === 'individual' ? destinatarioId : null,
        arquivos,
        autor_id: userId,
      });

      setSuccess(true);
      setTitulo('');
      setConteudo('');
      setMateriaId('');
      setFiles([]);
      setDestinatarioId(null);
      onSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({ form: (error as Error).message });
    } finally {
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
        label="Conteúdo"
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        error={errors.conteudo}
      />
      <Select
        label="Enviar para"
        value={visibilidade}
        onChange={(e) => setVisibilidade(e.target.value as 'turma' | 'individual')}
        options={[
          { value: 'turma', label: 'Turma (público por matéria)' },
          { value: 'individual', label: 'Aluno individual' },
        ]}
      />
      {visibilidade === 'turma' && (
        <Select
          label="Matéria"
          value={materiaId}
          onChange={(e) => setMateriaId(e.target.value)}
          options={materias.map((m) => ({ value: m.id, label: m.nome }))}
          placeholder="Selecione a matéria"
          error={errors.materia_id}
        />
      )}
      {visibilidade === 'individual' && (
        <UserSearch
          value={destinatarioId}
          onChange={(id) => setDestinatarioId(id)}
          excludeId={userId}
          error={errors.destinatario_id}
        />
      )}
      <FileUpload files={files} onChange={setFiles} label="Anexar arquivos ou imagens" />
      {errors.form && <p className="text-sm text-danger" role="alert">{errors.form}</p>}
      {success && (
        <p className="text-sm text-success" role="status">
          Anotação compartilhada com sucesso!
        </p>
      )}
      <Button type="submit" loading={loading}>
        Compartilhar
      </Button>
    </form>
  );
}
