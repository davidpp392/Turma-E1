-- Migração: recursos expandidos do perfil
-- Execute no SQL Editor do Supabase

-- Bio no perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '' CHECK (char_length(bio) <= 300);

-- Arquivos / anotações pessoais privadas
CREATE TABLE IF NOT EXISTS public.arquivos_pessoais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL CHECK (char_length(titulo) BETWEEN 1 AND 200),
  conteudo TEXT NOT NULL DEFAULT '' CHECK (char_length(conteudo) <= 10000),
  arquivos JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_arquivos_pessoais_usuario
  ON public.arquivos_pessoais(usuario_id, created_at DESC);

-- Matérias favoritas
CREATE TABLE IF NOT EXISTS public.materias_favoritas (
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  materia_id UUID NOT NULL REFERENCES public.materias(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, materia_id)
);

-- Trigger updated_at para arquivos_pessoais
CREATE TRIGGER arquivos_pessoais_updated_at
  BEFORE UPDATE ON public.arquivos_pessoais
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Storage bucket para arquivos pessoais
INSERT INTO storage.buckets (id, name, public)
VALUES ('pessoais', 'pessoais', false)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.arquivos_pessoais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias_favoritas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Arquivos pessoais: leitura própria"
  ON public.arquivos_pessoais FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Arquivos pessoais: inserção própria"
  ON public.arquivos_pessoais FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Arquivos pessoais: edição própria"
  ON public.arquivos_pessoais FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Arquivos pessoais: exclusão própria"
  ON public.arquivos_pessoais FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Favoritos: leitura própria"
  ON public.materias_favoritas FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Favoritos: inserção própria"
  ON public.materias_favoritas FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Favoritos: exclusão própria"
  ON public.materias_favoritas FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

-- Storage pessoais (privado)
CREATE POLICY "Pessoais leitura própria"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pessoais' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Pessoais upload próprio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pessoais' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Pessoais delete próprio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pessoais' AND (storage.foldername(name))[1] = auth.uid()::text);
