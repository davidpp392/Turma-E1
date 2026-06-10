-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arquivos_pessoais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias_favoritas ENABLE ROW LEVEL SECURITY;

-- ===================== PROFILES =====================

CREATE POLICY "Perfis visíveis para autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuário edita próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Usuário cria próprio perfil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- ===================== MATERIAS =====================

CREATE POLICY "Matérias leitura pública"
  ON public.materias FOR SELECT
  TO anon, authenticated
  USING (true);

-- ===================== ATIVIDADES =====================

CREATE POLICY "Atividades turma: leitura pública"
  ON public.atividades FOR SELECT
  TO anon, authenticated
  USING (
    visibilidade = 'turma'
    OR autor_id = auth.uid()::text
    OR destinatario_id = auth.uid()::text
  );

CREATE POLICY "Atividades: inserção por autenticados"
  ON public.atividades FOR INSERT
  TO authenticated
  WITH CHECK (autor_id = auth.uid()::text);

CREATE POLICY "Atividades: edição somente autor"
  ON public.atividades FOR UPDATE
  TO authenticated
  USING (autor_id = auth.uid()::text)
  WITH CHECK (autor_id = auth.uid()::text);

CREATE POLICY "Atividades: exclusão somente autor"
  ON public.atividades FOR DELETE
  TO authenticated
  USING (autor_id = auth.uid()::text);

-- ===================== ANOTACOES =====================

CREATE POLICY "Anotações turma: leitura pública"
  ON public.anotacoes FOR SELECT
  TO anon, authenticated
  USING (
    visibilidade = 'turma'
    OR autor_id = auth.uid()::text
    OR destinatario_id = auth.uid()::text
  );

CREATE POLICY "Anotações: inserção por autenticados"
  ON public.anotacoes FOR INSERT
  TO authenticated
  WITH CHECK (autor_id = auth.uid()::text);

CREATE POLICY "Anotações: edição somente autor"
  ON public.anotacoes FOR UPDATE
  TO authenticated
  USING (autor_id = auth.uid()::text)
  WITH CHECK (autor_id = auth.uid()::text);

CREATE POLICY "Anotações: exclusão somente autor"
  ON public.anotacoes FOR DELETE
  TO authenticated
  USING (autor_id = auth.uid()::text);

-- ===================== NOTIFICACOES =====================

CREATE POLICY "Notificações: leitura própria"
  ON public.notificacoes FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid()::text);

CREATE POLICY "Notificações: atualização própria"
  ON public.notificacoes FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid()::text)
  WITH CHECK (usuario_id = auth.uid()::text);

-- ===================== STORAGE =====================

CREATE POLICY "Avatars leitura pública"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Avatars upload próprio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Avatars update próprio"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Atividades arquivos leitura pública"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'atividades');

CREATE POLICY "Atividades arquivos upload autenticado"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'atividades');

CREATE POLICY "Atividades arquivos delete autor"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'atividades');

CREATE POLICY "Anotacoes arquivos leitura pública"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'anotacoes');

CREATE POLICY "Anotacoes arquivos upload autenticado"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'anotacoes');

CREATE POLICY "Anotacoes arquivos delete autor"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'anotacoes');

-- ===================== ARQUIVOS PESSOAIS =====================

CREATE POLICY "Arquivos pessoais: leitura própria"
  ON public.arquivos_pessoais FOR SELECT TO authenticated
  USING (usuario_id = auth.uid()::text);

CREATE POLICY "Arquivos pessoais: inserção própria"
  ON public.arquivos_pessoais FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid()::text);

CREATE POLICY "Arquivos pessoais: edição própria"
  ON public.arquivos_pessoais FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid()::text) WITH CHECK (usuario_id = auth.uid()::text);

CREATE POLICY "Arquivos pessoais: exclusão própria"
  ON public.arquivos_pessoais FOR DELETE TO authenticated
  USING (usuario_id = auth.uid()::text);

-- ===================== MATERIAS FAVORITAS =====================

CREATE POLICY "Favoritos: leitura própria"
  ON public.materias_favoritas FOR SELECT TO authenticated
  USING (usuario_id = auth.uid()::text);

CREATE POLICY "Favoritos: inserção própria"
  ON public.materias_favoritas FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid()::text);

CREATE POLICY "Favoritos: exclusão própria"
  ON public.materias_favoritas FOR DELETE TO authenticated
  USING (usuario_id = auth.uid()::text);

-- ===================== STORAGE PESSOAIS =====================

CREATE POLICY "Pessoais leitura própria"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pessoais' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Pessoais upload próprio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pessoais' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Pessoais delete próprio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pessoais' AND (storage.foldername(name))[1] = auth.uid()::text);
