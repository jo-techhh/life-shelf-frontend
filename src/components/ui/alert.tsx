import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'destructive';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, { container: string; iconClass: string; defaultIcon: React.ReactNode }> = {
  default: {
    container: 'bg-secondary/60 border-border text-foreground',
    iconClass: 'text-foreground',
    defaultIcon: <Info className="w-4 h-4 shrink-0" />,
  },
  info: {
    container: 'bg-primary/10 border-primary/25 text-foreground',
    iconClass: 'text-primary',
    defaultIcon: <Info className="w-4 h-4 shrink-0" />,
  },
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/25 text-foreground',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    defaultIcon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/25 text-foreground',
    iconClass: 'text-amber-600 dark:text-amber-400',
    defaultIcon: <AlertTriangle className="w-4 h-4 shrink-0" />,
  },
  destructive: {
    container: 'bg-rose-500/10 border-rose-500/25 text-foreground',
    iconClass: 'text-rose-600 dark:text-rose-400',
    defaultIcon: <AlertCircle className="w-4 h-4 shrink-0" />,
  },
};

export function Alert({
  variant = 'default',
  title,
  icon,
  children,
  className,
  onClose,
  ...props
}: AlertProps) {
  const current = variantStyles[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-sm text-xs leading-relaxed transition-all',
        current.container,
        className
      )}
      {...props}
    >
      <div className={cn('mt-0.5 shrink-0', current.iconClass)}>
        {icon || current.defaultIcon}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {title && <h5 className="font-semibold tracking-tight text-foreground">{title}</h5>}
        <div className="text-foreground/80 font-normal leading-relaxed">{children}</div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors -mr-1 -mt-0.5 shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
