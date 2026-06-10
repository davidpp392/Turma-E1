'use client';

import { getAvatarColor, getInitials } from '@/lib/utils';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  nome: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ring?: boolean;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
  '2xl': 'h-28 w-28 text-2xl',
};

const imageSizeMap = { sm: 32, md: 40, lg: 56, xl: 80, '2xl': 112 };

export default function Avatar({
  nome,
  avatarUrl,
  size = 'md',
  className,
  ring = false,
}: AvatarProps) {
  const initials = getInitials(nome);
  const colorClass = getAvatarColor(nome);
  const ringClass = ring ? 'ring-2 ring-border ring-offset-2 ring-offset-surface' : '';

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`Avatar de ${nome}`}
        width={imageSizeMap[size]}
        height={imageSizeMap[size]}
        className={cn('rounded-full object-cover', sizeMap[size], ringClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-medium tracking-wide text-white/90',
        sizeMap[size],
        colorClass,
        ringClass,
        className,
      )}
      aria-label={`Iniciais de ${nome}: ${initials}`}
      role="img"
    >
      {initials}
    </div>
  );
}
