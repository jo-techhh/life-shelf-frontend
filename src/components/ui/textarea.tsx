import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          rows={rows}
          ref={ref}
          className={cn(
            'flex w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[80px]',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
