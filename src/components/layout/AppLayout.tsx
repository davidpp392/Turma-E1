'use client';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { getCurrentUserAsync } from '@/lib/firebase/auth';
import { getProfile } from '@/lib/supabase/db';
import type { Profile } from '@/types';
import { useEffect, useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getCurrentUserAsync().then(async (user) => {
      if (!user) return;
      const data = await getProfile(user.uid);
      if (data) setProfile(data);
    });
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header profile={profile} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-8 lg:px-10 lg:py-10" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
