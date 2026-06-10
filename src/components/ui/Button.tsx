import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary:
        'bg-text-primary text-surface hover:bg-accent-hover border border-transparent font-medium',
      secondary:
        'bg-transparent text-text-primary border border-border hover:border-border-focus hover:bg-surface-overlay',
      danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-full',
      md: 'px-5 py-2 text-sm rounded-full',
      lg: 'px-6 py-2.5 text-sm rounded-full',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
