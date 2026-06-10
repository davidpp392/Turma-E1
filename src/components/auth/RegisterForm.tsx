'use client';

import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE } from '@/lib/constants';
import { signUp } from '@/lib/firebase/auth';
import { upsertProfile } from '@/lib/supabase/db';
import { uploadAvatar } from '@/lib/storage';
import { registerSchema } from '@/lib/validations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';

export default function RegisterForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      setErrors((prev) => ({ ...prev, avatar: 'Foto deve ter no máximo 2 MB' }));
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: 'Formato inválido (use JPG, PNG ou WebP)' }));
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors((prev) => {
      const { avatar: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMessage('');
    const result = registerSchema.safeParse({ nome: nome.trim(), email: email.trim(), password });
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

    try {
      const user = await signUp(email.trim(), password);
      let avatarUrl: string | null = null;

      if (avatarFile) {
        const { url, error: uploadError } = await uploadAvatar(avatarFile, user.uid);
        if (uploadError) {
          setAuthError(uploadError);
          setLoading(false);
          return;
        }
        avatarUrl = url;
      }

      await upsertProfile(user.uid, {
        nome: nome.trim(),
        email: email.trim(),
        avatar_url: avatarUrl,
      });

      if (!user.emailVerified) {
        setSuccessMessage(
          `Conta criada! Se a verificação de e-mail estiver ativa, confirme o link enviado para ${email.trim()} antes de entrar.`,
        );
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      const err = error as { message?: string; code?: string };
      if (err.code === 'auth/email-already-in-use') {
        setAuthError(getAuthErrorMessage(err));
      } else {
        setAuthError(getAuthErrorMessage(err));
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex flex-col items-center gap-3">
        {avatarPreview ? (
          <img src={avatarPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <Avatar nome={nome || '?'} size="xl" />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          className="hidden"
          id="avatar-upload"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          Foto (opcional)
        </Button>
        {errors.avatar && <p className="text-sm text-danger">{errors.avatar}</p>}
      </div>

      <Input
        label="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        error={errors.nome}
        autoComplete="name"
        required
      />
      <Input
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
        required
      />
      <Input
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="new-password"
        required
      />
      {authError && (
        <p className="text-sm text-danger" role="alert">
          {authError}
        </p>
      )}
      {successMessage && (
        <p className="text-sm text-success" role="status">
          {successMessage}
        </p>
      )}
      <Button type="submit" loading={loading} className="w-full">
        Criar conta
      </Button>
      <p className="text-center text-sm text-text-muted">
        Já tem conta?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
