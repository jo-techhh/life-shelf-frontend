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
            'bg-primary text-primary-foreground shadow-xs hover:bg-[hsl(var(--primary-hover))]': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50': variant === 'secondary',
            'border border-border/80 bg-card text-foreground hover:bg-muted/70 hover:border-border shadow-2xs': variant === 'outline',
            'text-foreground hover:bg-muted/70 hover:text-foreground': variant === 'ghost',
            'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90': variant === 'destructive',
            // Sizes
            'h-8.5 px-3 text-xs gap-1.5': size === 'sm',
            'h-9.5 px-4 text-sm gap-2': size === 'md',
            'h-11 px-5 text-base gap-2.5': size === 'lg',
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
