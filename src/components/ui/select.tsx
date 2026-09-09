import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options?: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'flex h-10 w-full appearance-none rounded-xl border border-input bg-card px-3.5 py-2 pr-9 text-sm text-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
