import { getAuthErrorMessage } from '@/lib/auth-errors';

describe('getAuthErrorMessage', () => {
  it('identifica e-mail não confirmado', () => {
    const msg = getAuthErrorMessage({ message: 'Email not confirmed', code: 'email_not_confirmed' });
    expect(msg).toMatch(/confirme seu e-mail/i);
  });

  it('identifica credenciais inválidas', () => {
    const msg = getAuthErrorMessage({ message: 'Invalid credential', code: 'auth/invalid-credential' });
    expect(msg).toMatch(/e-mail ou senha incorretos/i);
  });
});
