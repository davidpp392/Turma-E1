import AlunosGallery from '@/components/alunos/AlunosGallery';
import PageHeader from '@/components/ui/PageHeader';
import { TURMA_NOME } from '@/lib/constants';

export const metadata = { title: 'Turma — Site da Turma' };

export default function AlunosPage() {
  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        label="Galeria"
        title="Nossa turma"
        description={`Fotos e nomes de todos os alunos da turma ${TURMA_NOME}.`}
      />
      <AlunosGallery />
    </div>
  );
}
