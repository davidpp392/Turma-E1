'use client';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Image from 'next/image';
import { useState } from 'react';

export default function ScheduleViewer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/assets/schedule.png';
    link.download = 'horario-semanal-2527-E1.png';
    link.click();
  };

  return (
    <div className="mt-8">
      <button
        onClick={() => setModalOpen(true)}
        className="group relative w-full max-w-3xl mx-auto block overflow-hidden rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Abrir horário semanal em tamanho maior"
      >
        <Image
          src="/assets/schedule.png"
          alt="Horário semanal da turma 2527-E1"
          width={1200}
          height={800}
          className="w-full h-auto transition-transform group-hover:scale-[1.02]"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <span className="rounded-lg bg-surface-raised/90 px-4 py-2 text-sm text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Clique para ampliar
          </span>
        </div>
      </button>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setZoom(1); }}
        title="Horário Semanal — Turma 2527-E1"
        className="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
              −
            </Button>
            <span className="text-sm text-text-muted">{Math.round(zoom * 100)}%</span>
            <Button variant="secondary" size="sm" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
              +
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownload}>
              Download
            </Button>
          </div>
          <div className="overflow-auto max-h-[70vh] rounded-lg border border-border">
            <img
              src="/assets/schedule.png"
              alt="Horário semanal da turma 2527-E1"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              className="w-full h-auto transition-transform"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
