import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingInputProps {
  value?: number | null; // e.g. 0 to 10 or 0 to 5
  max?: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function RatingInput({
  value = 0,
  max = 5,
  onChange,
  readOnly = false,
  label,
  size = 'md',
}: RatingInputProps) {
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const current = hoverVal !== null ? hoverVal : value || 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= current;

          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              onMouseEnter={() => !readOnly && setHoverVal(starIndex)}
              onMouseLeave={() => !readOnly && setHoverVal(null)}
              onClick={() => {
                if (!readOnly && onChange) {
                  // toggle to 0 if clicked same
                  onChange(value === starIndex ? 0 : starIndex);
                }
              }}
              className={cn(
                'p-0.5 rounded transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              )}
            >
              <Star
                className={cn(
                  'transition-colors',
                  size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5',
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/40 hover:text-amber-300'
                )}
              />
            </button>
          );
        })}
        {value ? (
          <span className="ml-2 text-xs font-medium text-muted-foreground tabular-nums">
            {value.toFixed(1)} / {max}
          </span>
        ) : null}
      </div>
    </div>
  );
}
