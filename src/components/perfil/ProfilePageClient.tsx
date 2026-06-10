'use client';

import ProfileBadges from '@/components/perfil/ProfileBadges';
import ProfileFavoriteSubjects from '@/components/perfil/ProfileFavoriteSubjects';
import ProfileHeader from '@/components/perfil/ProfileHeader';
import ProfileNotifications from '@/components/perfil/ProfileNotifications';
import ProfilePersonalFiles from '@/components/perfil/ProfilePersonalFiles';
import ProfileRecentActivities from '@/components/perfil/ProfileRecentActivities';
import ProfileSettings from '@/components/perfil/ProfileSettings';
import { getCurrentUserAsync } from '@/lib/firebase/auth';
import { getProfile } from '@/lib/supabase/db';
import type { Profile } from '@/types';
import { useEffect, useState } from 'react';

export default function ProfilePageClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUserAsync().then(async (user) => {
      if (!user) return;
      const data = await getProfile(user.uid);
      if (data) setProfile({ ...data, bio: data.bio ?? '' });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border border-text-muted border-t-text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="page-container animate-fade-in space-y-6">
      <ProfileHeader profile={profile} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileRecentActivities userId={profile.id} />
        <ProfileNotifications userId={profile.id} />
        <ProfilePersonalFiles userId={profile.id} />
        <ProfileFavoriteSubjects userId={profile.id} />
        <ProfileBadges profile={profile} />
        <ProfileSettings profile={profile} onUpdate={setProfile} />
      </div>
    </div>
  );
}
