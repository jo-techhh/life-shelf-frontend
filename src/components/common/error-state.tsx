import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an issue communicating with your LifeShelf service. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-destructive/20 bg-destructive/5 my-6 animate-in fade-in',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 ring-8 ring-destructive/5">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground font-display">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}
