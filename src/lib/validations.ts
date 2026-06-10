import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const profileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  bio: z.string().max(300, 'Máximo de 300 caracteres').optional().default(''),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .optional()
    .or(z.literal('')),
});

export const arquivoPessoalSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório').max(200),
  conteudo: z.string().max(10000).optional().default(''),
});

export const atividadeSchema = z
  .object({
    titulo: z.string().min(2, 'Título obrigatório').max(200),
    descricao: z.string().max(5000).optional().default(''),
    materia_id: z.string().uuid('Selecione uma matéria'),
    data_entrega: z.string().min(1, 'Data de entrega obrigatória'),
    visibilidade: z.enum(['turma', 'individual']),
    destinatario_id: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) => data.visibilidade !== 'individual' || !!data.destinatario_id,
    { message: 'Selecione um destinatário para atividade individual', path: ['destinatario_id'] },
  );

export const anotacaoSchema = z
  .object({
    titulo: z.string().min(2, 'Título obrigatório').max(200),
    conteudo: z.string().max(10000).optional().default(''),
    materia_id: z.string().uuid().nullable().optional(),
    visibilidade: z.enum(['turma', 'individual']),
    destinatario_id: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) => data.visibilidade !== 'turma' || !!data.materia_id,
    { message: 'Selecione uma matéria para compartilhar com a turma', path: ['materia_id'] },
  )
  .refine(
    (data) => data.visibilidade !== 'individual' || !!data.destinatario_id,
    { message: 'Selecione um destinatário', path: ['destinatario_id'] },
  );

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AtividadeInput = z.infer<typeof atividadeSchema>;
export type AnotacaoInput = z.infer<typeof anotacaoSchema>;
