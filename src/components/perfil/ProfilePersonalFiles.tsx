'use client';

import FileUpload from '@/components/shared/FileUpload';
import ProfileSection from '@/components/perfil/ProfileSection';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import {
  createArquivoPessoal,
  deleteArquivoPessoal,
  listArquivosPessoais,
  updateArquivoPessoal,
} from '@/lib/supabase/db';
import { sanitizeText } from '@/lib/sanitize';
import { getPersonalFileUrl, uploadPersonalFiles } from '@/lib/storage';
import { arquivoPessoalSchema } from '@/lib/validations';
import type { ArquivoAnexo, ArquivoPessoal } from '@/types';
import { FormEvent, useCallback, useEffect, useState } from 'react';

interface ProfilePersonalFilesProps {
  userId: string;
}

export default function ProfilePersonalFiles({ userId }: ProfilePersonalFilesProps) {
  const [arquivos, setArquivos] = useState<ArquivoPessoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ArquivoPessoal | null>(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ArquivoAnexo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchArquivos = useCallback(async () => {
    const data = await listArquivosPessoais(userId);
    setArquivos(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchArquivos(); }, [fetchArquivos]);

  const openNew = () => {
    setEditing(null);
    setTitulo('');
    setConteudo('');
    setFiles([]);
    setExistingFiles([]);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (arq: ArquivoPessoal) => {
    setEditing(arq);
    setTitulo(arq.titulo);
    setConteudo(arq.conteudo);
    setFiles([]);
    setExistingFiles(arq.arquivos || []);
    setErrors({});
    setModalOpen(true);
  };

  const handleDownload = async (arq: ArquivoAnexo) => {
    if (arq.url) {
      window.open(arq.url, '_blank');
      return;
    }
    if (arq.path) {
      const url = await getPersonalFileUrl(arq.path);
      if (url) window.open(url, '_blank');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = arquivoPessoalSchema.safeParse({ titulo, conteudo });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    let anexos = [...existingFiles];

    if (files.length > 0) {
      const { arquivos: uploaded, error } = await uploadPersonalFiles(files, userId);
      if (error) {
        setErrors({ form: error });
        setSaving(false);
        return;
      }
      anexos = [...anexos, ...uploaded];
    }

    const payload = {
      titulo: sanitizeText(titulo, 200),
      conteudo: sanitizeText(conteudo, 10000),
      arquivos: anexos,
      usuario_id: userId,
    };

    if (editing) {
      await updateArquivoPessoal(editing.id, payload);
    } else {
      await createArquivoPessoal(payload);
    }

    setModalOpen(false);
    setSaving(false);
    fetchArquivos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta anotação privada?')) return;
    await deleteArquivoPessoal(id);
    fetchArquivos();
  };

  return (
    <ProfileSection title="Arquivos pessoais" description="Anotações privadas só suas">
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={openNew}>+ Nova anotação</Button>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Carregando...</p>
      ) : arquivos.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhum arquivo pessoal guardado.</p>
      ) : (
        <ul className="space-y-2">
          {arquivos.map((arq) => (
            <li key={arq.id} className="rounded-xl border border-border-muted px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{arq.titulo}</p>
                  {arq.conteudo && (
                    <p className="mt-1 text-xs text-text-muted line-clamp-2">{arq.conteudo}</p>
                  )}
                  {arq.arquivos?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {arq.arquivos.map((f, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDownload(f)}
                          className="text-xs text-text-secondary hover:text-text-primary"
                        >
                          📎 {f.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(arq)}>Editar</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(arq.id)}>Excluir</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar anotação' : 'Nova anotação privada'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} error={errors.titulo} />
          <Textarea label="Conteúdo" value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
          <FileUpload files={files} onChange={setFiles} label="Anexar arquivos" />
          {errors.form && <p className="text-xs text-danger">{errors.form}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" size="sm" loading={saving}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </ProfileSection>
  );
}
