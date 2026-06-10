'use client';

import {
  IconCalendar,
  IconHome,
  IconShare,
  IconTasks,
  IconUser,
  IconUsers,
} from '@/components/icons/NavIcons';
import { animateSidebarIn } from '@/lib/gsap';
import { TURMA_NOME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Início', Icon: IconHome },
  { href: '/alunos', label: 'Turma', Icon: IconUsers },
  { href: '/atividades', label: 'Atividades', Icon: IconTasks },
  { href: '/compartilhar', label: 'Compartilhar', Icon: IconShare },
  { href: '/horario', label: 'Horário', Icon: IconCalendar },
  { href: '/perfil', label: 'Perfil', Icon: IconUser },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open && sidebarRef.current) animateSidebarIn(sidebarRef.current);
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-[220px] flex-col border-r border-border bg-surface-raised/80 backdrop-blur-xl',
          'transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Navegação principal"
      >
        <div className="px-6 py-8">
          <p className="label-caps">Turma</p>
          <h1 className="mt-1 text-lg font-light tracking-tight text-text-primary">{TURMA_NOME}</h1>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                  active
                    ? 'bg-accent-subtle text-text-primary'
                    : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn(active ? 'text-text-primary' : 'text-text-muted')} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-muted px-6 py-5">
          <p className="text-[11px] text-text-muted">Portal da turma</p>
        </div>
      </aside>
    </>
  );
}
