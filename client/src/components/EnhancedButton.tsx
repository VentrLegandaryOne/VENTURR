import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Enhanced Button with micro-interactions and psychological design
 * - Smooth hover/active states
 * - Loading states with spinner
 * - Icon support
 * - Haptic feedback feel
 */
export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'relative inline-flex items-center justify-center gap-2',
      'font-medium rounded-xl transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'active:scale-[0.98] hover:scale-[1.02]',
      'shadow-sm hover:shadow-lg',
      // Smooth transform and shadow transitions
      'transform-gpu will-change-transform',
    );

    const variantStyles = {
      primary: cn(
        'bg-gradient-to-r from-blue-600 to-indigo-600',
        'text-white',
        'hover:from-blue-700 hover:to-indigo-700',
        'hover:shadow-blue-500/30',
        'focus:ring-blue-500',
        'active:from-blue-800 active:to-indigo-800',
      ),
      secondary: cn(
        'bg-gradient-to-r from-slate-100 to-slate-200',
        'text-slate-900',
        'hover:from-slate-200 hover:to-slate-300',
        'hover:shadow-slate-500/20',
        'focus:ring-slate-500',
      ),
      outline: cn(
        'border-2 border-slate-300',
        'text-slate-700 bg-white',
        'hover:bg-slate-50 hover:border-slate-400',
        'hover:shadow-slate-500/10',
        'focus:ring-slate-500',
      ),
      ghost: cn(
        'text-slate-700',
        'hover:bg-slate-100',
        'focus:ring-slate-500',
        'shadow-none hover:shadow-none',
      ),
      danger: cn(
        'bg-gradient-to-r from-red-600 to-rose-600',
        'text-white',
        'hover:from-red-700 hover:to-rose-700',
        'hover:shadow-red-500/30',
        'focus:ring-red-500',
      ),
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-base min-h-[44px]',
      lg: 'px-6 py-3.5 text-lg min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          loading && 'pointer-events-none',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
        
        <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </span>
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

