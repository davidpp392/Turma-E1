import { atividadeSchema, loginSchema, registerSchema } from '@/lib/validations';

describe('loginSchema', () => {
  it('aceita credenciais válidas', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejeita e-mail inválido', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: '123456' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('aceita registro válido', () => {
    const result = registerSchema.safeParse({
      nome: 'João',
      email: 'joao@email.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita nome curto', () => {
    const result = registerSchema.safeParse({
      nome: 'J',
      email: 'joao@email.com',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });
});

describe('atividadeSchema', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  it('aceita atividade para turma', () => {
    const result = atividadeSchema.safeParse({
      titulo: 'Prova 1',
      materia_id: validUuid,
      data_entrega: '2026-06-15',
      visibilidade: 'turma',
    });
    expect(result.success).toBe(true);
  });

  it('exige destinatário para atividade individual', () => {
    const result = atividadeSchema.safeParse({
      titulo: 'Trabalho',
      materia_id: validUuid,
      data_entrega: '2026-06-15',
      visibilidade: 'individual',
    });
    expect(result.success).toBe(false);
  });
});
