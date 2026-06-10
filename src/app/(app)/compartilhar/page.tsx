import CompartilharPageClient from '@/components/compartilhar/CompartilharPageClient';
import PageHeader from '@/components/ui/PageHeader';
import { getServerMaterias, getServerUser } from '@/lib/supabase/server-data';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Compartilhar — Site da Turma' };

export default async function CompartilharPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');
  const materias = await getServerMaterias();

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        label="Materiais"
        title="Compartilhar"
        description="Envie anotações e arquivos para a turma ou para um colega."
      />
      <CompartilharPageClient materias={materias} userId={user.id} />
    </div>
  );
}
