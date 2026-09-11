import * as React from 'react';
import { cn } from '@/lib/utils';
import { Priority, MovieStatus, SeriesStatus, ReadingStatus, StudyStatus, TravelStatus, TripStatus, PlanStatus } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'accent';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center font-medium rounded-lg border transition-colors select-none',
        {
          'bg-primary/12 text-primary border-primary/20': variant === 'default',
          'bg-secondary text-secondary-foreground border-border/40': variant === 'secondary',
          'border-border/80 text-foreground/80 bg-card/60': variant === 'outline',
          'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/20': variant === 'success',
          'bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/20': variant === 'warning',
          'bg-destructive/12 text-destructive border-destructive/20': variant === 'destructive',
          'bg-accent text-accent-foreground border-primary/20': variant === 'accent',
          'px-2 py-0.5 text-[11px] leading-tight': size === 'sm',
          'px-2.5 py-1 text-xs font-semibold': size === 'md',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PriorityBadge({ priority }: { priority?: Priority }) {
  if (!priority) return null;
  const config = {
    LOW: { label: 'Low', variant: 'secondary' as const },
    MEDIUM: { label: 'Medium', variant: 'outline' as const },
    HIGH: { label: 'High', variant: 'warning' as const },
  }[priority];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

type AnyStatus = MovieStatus | SeriesStatus | ReadingStatus | StudyStatus | TravelStatus | TripStatus | PlanStatus;

export function StatusBadge({ status }: { status?: AnyStatus }) {
  if (!status) return null;

  const statusMap: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    PLANNED: { label: 'Planned', variant: 'secondary' },
    WATCHING: { label: 'Watching', variant: 'default' },
    WATCHED: { label: 'Watched', variant: 'success' },
    DROPPED: { label: 'Dropped', variant: 'destructive' },
    READING: { label: 'Reading', variant: 'default' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    LEARNING: { label: 'Learning', variant: 'default' },
    WANT_TO_VISIT: { label: 'Want to Visit', variant: 'accent' },
    PLANNING: { label: 'Planning', variant: 'default' },
    VISITED: { label: 'Visited', variant: 'success' },
    IN_PROGRESS: { label: 'In Progress', variant: 'default' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' },
    BOOKED: { label: 'Booked', variant: 'default' },
    ONGOING: { label: 'Ongoing', variant: 'warning' },
  };

  const item = statusMap[status] || { label: status, variant: 'secondary' };

  return <Badge variant={item.variant}>{item.label}</Badge>;
}
