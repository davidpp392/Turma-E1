'use client';

import ProfileSection from '@/components/perfil/ProfileSection';
import { computeBadges } from '@/lib/badges';
import {
  countAtividadesByAutor,
  countAnotacoesByAutor,
  countMateriasFavoritas,
} from '@/lib/supabase/db';
import type { Profile } from '@/types';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ProfileBadgesProps {
  profile: Profile;
}

export default function ProfileBadges({ profile }: ProfileBadgesProps) {
  const [stats, setStats] = useState({ atividadesCount: 0, anotacoesCount: 0, favoritosCount: 0 });

  useEffect(() => {
    Promise.all([
      countAtividadesByAutor(profile.id),
      countAnotacoesByAutor(profile.id),
      countMateriasFavoritas(profile.id),
    ]).then(([atividadesCount, anotacoesCount, favoritosCount]) => {
      setStats({ atividadesCount, anotacoesCount, favoritosCount });
    });
  }, [profile.id]);

  const badges = computeBadges({
    atividadesCount: stats.atividadesCount,
    anotacoesCount: stats.anotacoesCount,
    hasAvatar: !!profile.avatar_url,
    hasBio: !!profile.bio?.trim(),
    favoritosCount: stats.favoritosCount,
  });

  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <ProfileSection title="Conquistas" description={`${unlocked} de ${badges.length} desbloqueadas`}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              'rounded-xl border p-4 text-center transition-all',
              badge.unlocked
                ? 'border-border bg-accent-subtle/20'
                : 'border-border-muted opacity-40 grayscale',
            )}
            title={badge.descricao}
          >
            <span className="text-2xl" aria-hidden="true">{badge.emoji}</span>
            <p className="mt-2 text-xs font-medium text-text-primary">{badge.titulo}</p>
            <p className="mt-0.5 text-[10px] text-text-muted">{badge.descricao}</p>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}
