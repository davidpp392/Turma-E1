import LoginForm from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entrar — Site da Turma',
};

export default function LoginPage() {
  return (
    <div>
      <h2 className="mb-6 text-sm font-medium text-text-secondary">Entrar na conta</h2>
      <LoginForm />
    </div>
  );
}
