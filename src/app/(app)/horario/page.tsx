import ScheduleViewer from '@/components/horario/ScheduleViewer';
import PageHeader from '@/components/ui/PageHeader';
import { TURMA_NOME } from '@/lib/constants';

export const metadata = { title: 'Horário — Site da Turma' };

export default function HorarioPage() {
  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        label="Agenda"
        title="Horário semanal"
        description={`Grade de aulas da turma ${TURMA_NOME}.`}
      />
      <ScheduleViewer />
    </div>
  );
}
