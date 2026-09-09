import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98]',
          {
            // Variants
            'bg-primary text-primary-foreground shadow-sm hover:opacity-90': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border border-border bg-card text-foreground hover:bg-muted': variant === 'outline',
            'text-foreground hover:bg-muted': variant === 'ghost',
            'bg-destructive text-destructive-foreground shadow-sm hover:opacity-90': variant === 'destructive',
            // Sizes
            'h-8 px-3 text-xs gap-1.5': size === 'sm',
            'h-10 px-4 text-sm gap-2': size === 'md',
            'h-11 px-6 text-base gap-2.5': size === 'lg',
            'h-9 w-9 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
