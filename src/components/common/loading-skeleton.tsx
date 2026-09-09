import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-muted/70', className)}
      {...props}
    />
  );
}

export function CardSkeletonGrid({ count = 6, aspect = 'poster' }: { count?: number; aspect?: 'poster' | 'video' | 'square' }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-2xl border border-border/40 p-3 bg-card/60">
          <Skeleton
            className={cn(
              'w-full rounded-xl',
              aspect === 'poster' && 'aspect-[2/3]',
              aspect === 'video' && 'aspect-video',
              aspect === 'square' && 'aspect-square'
            )}
          />
          <Skeleton className="h-4 w-3/4 mt-1" />
          <div className="flex items-center justify-between gap-2 mt-1">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/60">
          <Skeleton className="w-12 h-16 rounded-lg shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-20 h-6 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
