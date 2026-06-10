import { cn } from '@/lib/utils';

interface ProfileSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ProfileSection({ title, description, children, className }: ProfileSectionProps) {
  return (
    <section className={cn('glass-card p-6', className)}>
      <div className="mb-5">
        <h2 className="text-sm font-medium text-text-primary">{title}</h2>
        {description && <p className="mt-1 text-xs text-text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
