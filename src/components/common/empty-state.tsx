import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-border/80 bg-card/40 my-6 animate-in fade-in',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 ring-8 ring-primary/5">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground font-display">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
