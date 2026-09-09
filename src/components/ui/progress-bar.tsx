import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'primary' | 'success' | 'accent';
}

export function ProgressBar({
  value,
  max = 100,
  showText = false,
  size = 'md',
  className,
  variant = 'primary',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={cn('w-full flex items-center gap-3', className)}>
      <div
        className={cn(
          'w-full bg-secondary rounded-full overflow-hidden flex-1 relative',
          size === 'sm' && 'h-1.5',
          size === 'md' && 'h-2.5',
          size === 'lg' && 'h-3.5'
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            variant === 'primary' && 'bg-primary',
            variant === 'success' && 'bg-emerald-500',
            variant === 'accent' && 'bg-indigo-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <span className="text-xs font-semibold text-muted-foreground shrink-0 tabular-nums">
          {percentage}%
        </span>
      )}
    </div>
  );
}
