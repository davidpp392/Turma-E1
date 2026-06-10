'use client';

import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ProfileSection from '@/components/perfil/ProfileSection';
import Textarea from '@/components/ui/Textarea';
import { changePassword } from '@/lib/firebase/auth';
import { updateProfile } from '@/lib/supabase/db';
import { ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE } from '@/lib/constants';
import { uploadAvatar } from '@/lib/storage';
import { profileSchema } from '@/lib/validations';
import type { Profile } from '@/types';
import { FormEvent, useRef, useState } from 'react';

interface ProfileSettingsProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export default function ProfileSettings({ profile, onUpdate }: ProfileSettingsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [nome, setNome] = useState(profile.nome);
  const [bio, setBio] = useState(profile.bio || '');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      setErrors({ avatar: 'Foto deve ter no máximo 2 MB' });
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors({ avatar: 'Formato inválido' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse({ nome, bio, password: password || undefined });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    let avatarUrl = profile.avatar_url;

    if (avatarFile) {
      const { url, error } = await uploadAvatar(avatarFile, profile.id);
      if (error) {
        setErrors({ form: error });
        setLoading(false);
        return;
      }
      avatarUrl = url;
    }

    try {
      await updateProfile(profile.id, { nome: nome.trim(), bio: bio.trim(), avatar_url: avatarUrl });

      if (password) {
        await changePassword(password);
      }

      onUpdate({ ...profile, nome: nome.trim(), bio: bio.trim(), avatar_url: avatarUrl });
      setPassword('');
      setAvatarFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({ form: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileSection title="Configurações" description="Foto, nome, descrição e senha">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <Avatar nome={nome} size="lg" />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            Trocar foto
          </Button>
        </div>
        {errors.avatar && <p className="text-xs text-danger">{errors.avatar}</p>}

        <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} error={errors.nome} />
        <Textarea
          label="Breve descrição"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          error={errors.bio}
          placeholder="Interesses, hobbies ou uma frase sobre você..."
          rows={3}
        />
        <p className="text-[11px] text-text-muted -mt-3">{bio.length}/300</p>
        <Input
          label="Nova senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="Deixe em branco para manter"
          autoComplete="new-password"
        />

        {errors.form && <p className="text-xs text-danger">{errors.form}</p>}
        {success && <p className="text-xs text-success">Perfil atualizado!</p>}

        <Button type="submit" loading={loading} size="sm">
          Salvar alterações
        </Button>
      </form>
    </ProfileSection>
  );
}
