import Avatar from '@/components/ui/Avatar';
import type { Profile } from '@/types';

interface ProfileHeaderProps {
  profile: Profile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="glass-card flex flex-col items-center p-8 text-center sm:flex-row sm:items-start sm:text-left sm:gap-8">
      <Avatar nome={profile.nome} avatarUrl={profile.avatar_url} size="2xl" ring />
      <div className="mt-6 sm:mt-0 flex-1 min-w-0">
        <p className="label-caps mb-2">Meu perfil</p>
        <h1 className="text-3xl font-light tracking-tight text-text-primary">{profile.nome}</h1>
        <p className="mt-1 text-sm text-text-muted">{profile.email}</p>
        {profile.bio ? (
          <p className="mt-4 text-sm leading-relaxed text-text-secondary italic">
            &ldquo;{profile.bio}&rdquo;
          </p>
        ) : (
          <p className="mt-4 text-sm text-text-muted">
            Adicione uma breve descrição sobre você nas configurações.
          </p>
        )}
      </div>
    </div>
  );
}
