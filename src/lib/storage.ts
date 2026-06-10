import { createClient } from '@/lib/supabase/client';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { sanitizeFilename } from '@/lib/sanitize';
import type { ArquivoAnexo } from '@/types';

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `Arquivo "${file.name}" excede o limite de 5 MB`;
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `Tipo de arquivo não permitido: ${file.name}`;
  }
  return null;
}

async function uploadToBucket(
  files: File[],
  bucket: 'atividades' | 'anotacoes' | 'pessoais',
  userId: string,
): Promise<{ arquivos: ArquivoAnexo[]; error: string | null }> {
  const supabase = createClient();
  const arquivos: ArquivoAnexo[] = [];

  for (const file of files) {
    const validationError = validateFile(file);
    if (validationError) return { arquivos: [], error: validationError };

    const safeName = sanitizeFilename(file.name);
    const path = `${userId}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) return { arquivos: [], error: error.message };

    if (bucket === 'pessoais') {
      arquivos.push({ nome: file.name, path, tipo: file.type, tamanho: file.size });
    } else {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      arquivos.push({ nome: file.name, url: data.publicUrl, tipo: file.type, tamanho: file.size });
    }
  }

  return { arquivos, error: null };
}

export async function uploadFiles(
  files: File[],
  bucket: 'atividades' | 'anotacoes',
  userId: string,
): Promise<{ arquivos: ArquivoAnexo[]; error: string | null }> {
  return uploadToBucket(files, bucket, userId);
}

export async function uploadPersonalFiles(
  files: File[],
  userId: string,
): Promise<{ arquivos: ArquivoAnexo[]; error: string | null }> {
  return uploadToBucket(files, 'pessoais', userId);
}

export async function getPersonalFileUrl(path: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.storage.from('pessoais').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const safeName = sanitizeFilename(file.name);
  const path = `${userId}/avatar-${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
