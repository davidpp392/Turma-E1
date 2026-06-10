'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { signIn } from '@/lib/firebase/auth';
import { getProfile, upsertProfile } from '@/lib/supabase/db';
import { loginSchema } from '@/lib/validations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const result = loginSchema.safeParse({ email: email.trim(), password });
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
      const user = await signIn(email.trim(), password);
      const existing = await getProfile(user.uid);
      if (!existing) {
        const nome = user.displayName || email.trim().split('@')[0];
        await upsertProfile(user.uid, { nome, email: user.email ?? email.trim(), avatar_url: null });
      }
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setAuthError(getAuthErrorMessage(error as { message?: string; code?: string }));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
        autoComplete="current-password"
        required
      />
      {authError && (
        <p className="text-sm text-danger" role="alert">
          {authError}
        </p>
      )}
      <Button type="submit" loading={loading} className="w-full">
        Entrar
      </Button>
      <p className="text-center text-sm text-text-muted">
        Não tem conta?{' '}
        <Link href="/registro" className="text-accent hover:underline">
          Registre-se
        </Link>
      </p>
    </form>
  );
}
