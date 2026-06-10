-- ============================================================
-- Seed data — Matérias da turma 2527-E1 (Ensino Técnico)
-- Execute após schema.sql e policies.sql
-- ============================================================

INSERT INTO public.materias (nome) VALUES
  ('Projeto de vida'),
  ('L. inglesa'),
  ('Instalações maquinas e comando eletrico'),
  ('Refrigeração e Ar-condicionado'),
  ('Organização industrial e Tecnol. da Manutenção'),
  ('Mecanismo Eletromecânicos'),
  ('Tecnologia de Materias, Manufactura e metrologia'),
  ('Sist. Eletroeletrônicos. Embarcados'),
  ('Automação industrial'),
  ('Arte'),
  ('Ed. Fisica'),
  ('Filosofia'),
  ('Geografia'),
  ('L. Portuguesa'),
  ('L. Espanhola'),
  ('Hístoria'),
  ('Biologia'),
  ('Quimica'),
  ('Fisica'),
  ('Matematica')
ON CONFLICT (nome) DO NOTHING;
