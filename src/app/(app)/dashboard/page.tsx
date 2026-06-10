import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import { TURMA_NOME } from '@/lib/constants';
import { getServerDashboardData } from '@/lib/supabase/server-data';
import { formatDate } from '@/lib/utils';
import type { Atividade } from '@/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Início — Site da Turma' };

const quickLinks = [
  { href: '/alunos', title: 'Turma', desc: 'Fotos de todos os alunos' },
  { href: '/atividades', title: 'Atividades', desc: 'Trabalhos e provas' },
  { href: '/compartilhar', title: 'Compartilhar', desc: 'Anotações e arquivos' },
  { href: '/horario', title: 'Horário', desc: 'Grade semanal' },
];

export default async function DashboardPage() {
  const { proximas, materiasCount, alunosCount, anotacoesCount } = await getServerDashboardData();

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        label="Início"
        title={`Turma ${TURMA_NOME}`}
        description="Tudo o que a turma precisa, num só lugar."
      />

      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Próximas entregas', value: proximas.length },
          { label: 'Alunos', value: alunosCount },
          { label: 'Matérias', value: materiasCount },
          { label: 'Anotações', value: anotacoesCount },
        ].map((stat) => (
          <Card key={stat.label} className="!p-4">
            <p className="label-caps">{stat.label}</p>
            <p className="mt-2 text-3xl font-light text-text-primary">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card hover className="h-full !p-4">
              <p className="text-sm font-medium text-text-primary">{link.title}</p>
              <p className="mt-1 text-xs text-text-muted">{link.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-secondary">Próximas atividades</h2>
          <Link
            href="/atividades"
            className="text-xs text-text-muted transition-colors hover:text-text-primary"
          >
            Ver todas →
          </Link>
        </div>
        {proximas.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhuma entrega programada.</p>
        ) : (
          <div className="space-y-2">
            {(proximas as Atividade[]).map((a) => (
              <Card key={a.id} className="!p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{a.titulo}</p>
                    <p className="text-xs text-text-muted">{a.materias?.nome}</p>
                  </div>
                  <time className="shrink-0 text-xs text-text-secondary">
                    {formatDate(a.data_entrega)}
                  </time>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
