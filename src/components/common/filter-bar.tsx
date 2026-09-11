import React from 'react';
import { cn } from '@/lib/utils';

export interface FilterBarProps {
  tabs?: React.ReactNode;
  search?: React.ReactNode;
  filters?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  tabs,
  search,
  filters,
  children,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3.5 bg-card/70 dark:bg-card/60 border border-border/70 p-3 sm:p-4 rounded-2xl shadow-xs transition-all',
        className
      )}
    >
      {tabs && <div className="border-b border-border/50 pb-2.5">{tabs}</div>}

      {(search || filters) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {search && <div className="relative flex-1 min-w-0">{search}</div>}
          {filters && (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {filters}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
