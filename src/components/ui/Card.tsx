import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  dataAnimate?: boolean;
  hover?: boolean;
}

export default function Card({ children, className, dataAnimate, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card p-5',
        hover && 'hover:border-border-focus cursor-pointer',
        dataAnimate && 'animate-card',
        className,
      )}
    >
      {children}
    </div>
  );
}
