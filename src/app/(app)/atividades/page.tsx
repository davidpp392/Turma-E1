import AtividadesList from '@/components/atividades/AtividadesList';
import PageHeader from '@/components/ui/PageHeader';
import { getServerMaterias, getServerUser } from '@/lib/supabase/server-data';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Atividades — Site da Turma' };

export default async function AtividadesPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');
  const materias = await getServerMaterias();

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        label="Estudos"
        title="Atividades"
        description="Trabalhos, provas e entregas da turma."
      />
      <AtividadesList materias={materias} userId={user.id} />
    </div>
  );
}
