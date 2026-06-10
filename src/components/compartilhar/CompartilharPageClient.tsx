'use client';

import AnotacoesPublicas from '@/components/compartilhar/AnotacoesPublicas';
import CompartilharForm from '@/components/compartilhar/CompartilharForm';
import Card from '@/components/ui/Card';
import type { Materia } from '@/types';
import { useState } from 'react';

interface CompartilharPageClientProps {
  materias: Materia[];
  userId: string;
}

export default function CompartilharPageClient({ materias, userId }: CompartilharPageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Nova anotação</h2>
        <CompartilharForm
          materias={materias}
          userId={userId}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      </Card>
      <div key={refreshKey}>
        <AnotacoesPublicas materias={materias} />
      </div>
    </div>
  );
}
