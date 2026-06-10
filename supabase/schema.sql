-- ============================================================
-- Site da Turma 2527-E1 — Schema Supabase
-- Execute no SQL Editor do Supabase (ordem: schema → policies → seed)
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

-- Perfis (id = Firebase UID)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT NOT NULL DEFAULT '' CHECK (char_length(bio) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Matérias (leitura pública)
CREATE TABLE IF NOT EXISTS public.materias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE CHECK (char_length(nome) BETWEEN 2 AND 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atividades (trabalhos/provas)
CREATE TABLE IF NOT EXISTS public.atividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL CHECK (char_length(titulo) BETWEEN 2 AND 200),
  descricao TEXT NOT NULL DEFAULT '' CHECK (char_length(descricao) <= 5000),
  materia_id UUID NOT NULL REFERENCES public.materias(id) ON DELETE RESTRICT,
  data_entrega DATE NOT NULL,
  autor_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  arquivos JSONB NOT NULL DEFAULT '[]'::jsonb,
  visibilidade TEXT NOT NULL DEFAULT 'turma' CHECK (visibilidade IN ('turma', 'individual')),
  destinatario_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraint de duplicidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_atividades_unique_lower_titulo
  ON public.atividades (materia_id, data_entrega, lower(titulo));

-- Anotações compartilhadas
CREATE TABLE IF NOT EXISTS public.anotacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL CHECK (char_length(titulo) BETWEEN 2 AND 200),
  conteudo TEXT NOT NULL DEFAULT '' CHECK (char_length(conteudo) <= 10000),
  materia_id UUID REFERENCES public.materias(id) ON DELETE SET NULL,
  autor_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  arquivos JSONB NOT NULL DEFAULT '[]'::jsonb,
  visibilidade TEXT NOT NULL DEFAULT 'turma' CHECK (visibilidade IN ('turma', 'individual')),
  destinatario_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('nova_atividade', 'nova_anotacao_individual')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL DEFAULT '',
  referencia_id UUID,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON public.notificacoes(usuario_id, lida, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_atividades_materia ON public.atividades(materia_id, data_entrega ASC);
CREATE INDEX IF NOT EXISTS idx_atividades_autor ON public.atividades(autor_id);
CREATE INDEX IF NOT EXISTS idx_anotacoes_materia ON public.anotacoes(materia_id) WHERE visibilidade = 'turma';

-- Arquivos pessoais (privados)
CREATE TABLE IF NOT EXISTS public.arquivos_pessoais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  usuario_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  materia_id UUID NOT NULL REFERENCES public.materias(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, materia_id)
);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER atividades_updated_at
  BEFORE UPDATE ON public.atividades
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER arquivos_pessoais_updated_at
  BEFORE UPDATE ON public.arquivos_pessoais
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Notificação ao criar atividade individual
CREATE OR REPLACE FUNCTION public.notify_nova_atividade()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.visibilidade = 'individual' AND NEW.destinatario_id IS NOT NULL THEN
    INSERT INTO public.notificacoes (usuario_id, tipo, titulo, mensagem, referencia_id)
    VALUES (
      NEW.destinatario_id,
      'nova_atividade',
      'Nova atividade: ' || NEW.titulo,
      'Você recebeu uma atividade individual.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER atividade_notify
  AFTER INSERT ON public.atividades
  FOR EACH ROW EXECUTE FUNCTION public.notify_nova_atividade();

-- Notificação ao criar anotação individual
CREATE OR REPLACE FUNCTION public.notify_nova_anotacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.visibilidade = 'individual' AND NEW.destinatario_id IS NOT NULL THEN
    INSERT INTO public.notificacoes (usuario_id, tipo, titulo, mensagem, referencia_id)
    VALUES (
      NEW.destinatario_id,
      'nova_anotacao_individual',
      'Nova anotação: ' || NEW.titulo,
      'Você recebeu uma anotação compartilhada.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER anotacao_notify
  AFTER INSERT ON public.anotacoes
  FOR EACH ROW EXECUTE FUNCTION public.notify_nova_anotacao();

-- ============================================================
-- STORAGE BUCKETS (executar via Dashboard ou API)
-- ============================================================
-- Criar buckets: avatars, atividades, anotacoes (públicos para leitura)

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('atividades', 'atividades', true),
  ('anotacoes', 'anotacoes', true),
  ('pessoais', 'pessoais', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.atividades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anotacoes;
