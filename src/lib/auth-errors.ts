/** Traduz erros do Firebase Auth para mensagens amigáveis em português */
export function getAuthErrorMessage(error: { message?: string; code?: string }): string {
  const msg = (error.message ?? '').toLowerCase();
  const code = error.code ?? '';

  if (
    code === 'auth/email-not-verified' ||
    msg.includes('email not verified') ||
    msg.includes('email not confirmed')
  ) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada (e o spam).';
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credential')
  ) {
    return 'E-mail ou senha incorretos. Se você acabou de se registrar, confirme o e-mail antes de entrar.';
  }

  if (code === 'auth/email-already-in-use' || msg.includes('email already in use')) {
    return 'Este e-mail já está cadastrado. Tente fazer login.';
  }

  if (msg.includes('signup is disabled') || code === 'auth/operation-not-allowed') {
    return 'O cadastro está desativado no momento. Contate o administrador.';
  }

  if (code === 'auth/weak-password') {
    return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
  }

  return error.message ?? 'Erro de autenticação. Tente novamente.';
}
