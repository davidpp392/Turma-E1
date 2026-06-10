import { TURMA_NOME } from '@/lib/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="label-caps">Turma {TURMA_NOME}</p>
          <h1 className="mt-3 text-3xl font-light tracking-tight text-text-primary">Bem-vindo</h1>
          <p className="mt-2 text-sm text-text-muted">Portal da turma</p>
        </div>
        <div className="glass-card p-8">{children}</div>
      </div>
    </div>
  );
}
