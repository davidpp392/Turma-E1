-- Migração: Firebase Auth + Supabase (UID do Firebase como TEXT)
-- Execute no SQL Editor se o banco já existia com UUID vinculado ao auth.users

-- Remover trigger de auth.users (perfis criados pelo app após Firebase login)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- profiles: id = Firebase UID (TEXT)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- Colunas de usuário nas demais tabelas
ALTER TABLE public.atividades DROP CONSTRAINT IF EXISTS atividades_autor_id_fkey;
ALTER TABLE public.atividades DROP CONSTRAINT IF EXISTS atividades_destinatario_id_fkey;
ALTER TABLE public.atividades ALTER COLUMN autor_id TYPE TEXT USING autor_id::text;
ALTER TABLE public.atividades ALTER COLUMN destinatario_id TYPE TEXT USING destinatario_id::text;
ALTER TABLE public.atividades ADD CONSTRAINT atividades_autor_id_fkey
  FOREIGN KEY (autor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.atividades ADD CONSTRAINT atividades_destinatario_id_fkey
  FOREIGN KEY (destinatario_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.anotacoes DROP CONSTRAINT IF EXISTS anotacoes_autor_id_fkey;
ALTER TABLE public.anotacoes DROP CONSTRAINT IF EXISTS anotacoes_destinatario_id_fkey;
ALTER TABLE public.anotacoes ALTER COLUMN autor_id TYPE TEXT USING autor_id::text;
ALTER TABLE public.anotacoes ALTER COLUMN destinatario_id TYPE TEXT USING destinatario_id::text;
ALTER TABLE public.anotacoes ADD CONSTRAINT anotacoes_autor_id_fkey
  FOREIGN KEY (autor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.anotacoes ADD CONSTRAINT anotacoes_destinatario_id_fkey
  FOREIGN KEY (destinatario_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.notificacoes DROP CONSTRAINT IF EXISTS notificacoes_usuario_id_fkey;
ALTER TABLE public.notificacoes ALTER COLUMN usuario_id TYPE TEXT USING usuario_id::text;
ALTER TABLE public.notificacoes ADD CONSTRAINT notificacoes_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.arquivos_pessoais DROP CONSTRAINT IF EXISTS arquivos_pessoais_usuario_id_fkey;
ALTER TABLE public.arquivos_pessoais ALTER COLUMN usuario_id TYPE TEXT USING usuario_id::text;
ALTER TABLE public.arquivos_pessoais ADD CONSTRAINT arquivos_pessoais_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.materias_favoritas DROP CONSTRAINT IF EXISTS materias_favoritas_usuario_id_fkey;
ALTER TABLE public.materias_favoritas ALTER COLUMN usuario_id TYPE TEXT USING usuario_id::text;
ALTER TABLE public.materias_favoritas ADD CONSTRAINT materias_favoritas_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
