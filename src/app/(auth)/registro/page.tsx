import RegisterForm from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro — Site da Turma',
};

export default function RegistroPage() {
  return (
    <div>
      <h2 className="mb-6 text-sm font-medium text-text-secondary">Criar conta</h2>
      <RegisterForm />
    </div>
  );
}
