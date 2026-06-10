'use client';

import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { signOut } from '@/lib/firebase/auth';
import type { Profile } from '@/types';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  profile: Profile | null;
  onMenuClick: () => void;
}

export default function Header({ profile, onMenuClick }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-xl lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-text-muted transition-colors hover:text-text-primary lg:hidden"
        aria-label="Abrir menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        {profile && <NotificationPanel userId={profile.id} />}
        {profile && (
          <div className="hidden items-center gap-2.5 sm:flex">
            <Avatar nome={profile.nome} avatarUrl={profile.avatar_url} size="sm" />
            <span className="max-w-[120px] truncate text-[13px] text-text-secondary">
              {profile.nome}
            </span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-text-muted">
          Sair
        </Button>
      </div>
    </header>
  );
}
