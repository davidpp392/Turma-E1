'use client';

import { animateModalIn, animateModalOut } from '@/lib/gsap';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import Button from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (overlay && content) animateModalIn(overlay, content);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleClose = () => {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (overlay && content) {
      animateModalOut(overlay, content).then(onClose);
    } else {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={contentRef}
        className={cn('glass-card w-full max-w-lg p-6', className)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className="text-base font-medium text-text-primary">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Fechar">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
