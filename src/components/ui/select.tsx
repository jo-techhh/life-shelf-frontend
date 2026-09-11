import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface SelectProps {
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
  required?: boolean;
}

function getStatusDotColor(val: string | number): string | null {
  const s = String(val).toUpperCase();
  if (s.includes('WATCHING') || s.includes('IN_PROGRESS') || s.includes('READING') || s.includes('MEDIUM')) {
    return 'bg-amber-500 shadow-amber-500/30';
  }
  if (s.includes('WATCHED') || s.includes('COMPLETED') || s.includes('FINISHED')) {
    return 'bg-emerald-500 shadow-emerald-500/30';
  }
  if (s.includes('PLANNED') || s.includes('TO_READ') || s.includes('BACKLOG')) {
    return 'bg-sky-500 shadow-sky-500/30';
  }
  if (s.includes('DROPPED') || s.includes('HIGH') || s.includes('URGENT')) {
    return 'bg-rose-500 shadow-rose-500/30';
  }
  if (s.includes('LOW')) {
    return 'bg-slate-400';
  }
  return null;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    id,
    name,
    value: controlledValue,
    defaultValue,
    onChange,
    onValueChange,
    options = [],
    label,
    placeholder = 'Select option...',
    error,
    disabled = false,
    align = 'left',
    className,
    children,
    required,
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | number>(
    controlledValue !== undefined ? controlledValue : defaultValue ?? ''
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse children <option> tags if options prop is not passed or empty
  const parsedOptions: SelectOption[] = React.useMemo(() => {
    if (options && options.length > 0) return options;
    if (!children) return [];

    const items: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const props = child.props as { value?: string | number; children?: React.ReactNode };
        if (props.value !== undefined) {
          items.push({
            value: props.value,
            label: typeof props.children === 'string' ? props.children : String(props.value),
          });
        }
      }
    });
    return items;
  }, [options, children]);

  // Synchronize controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle escape and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = parsedOptions.find((opt) => String(opt.value) === String(internalValue));
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const statusDot = selectedOption ? getStatusDotColor(selectedOption.value) : null;

  const handleSelect = (val: string | number) => {
    setInternalValue(val);
    setIsOpen(false);

    if (onValueChange) {
      onValueChange(String(val));
    }
    if (onChange) {
      onChange({ target: { value: String(val), name } });
    }
  };

  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Hidden input for form integration */}
      {name && <input type="hidden" name={name} value={String(internalValue ?? '')} />}

      {/* Trigger Button */}
      <button
        ref={ref}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex items-center justify-between gap-2 h-9.5 w-full rounded-xl border border-border/80 bg-card px-3 text-xs font-medium text-foreground transition-all duration-150 cursor-pointer select-none text-left shadow-2xs hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20',
          isOpen && 'border-primary ring-2 ring-primary/25 shadow-xs',
          error && 'border-destructive focus:ring-destructive/20',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {statusDot && <span className={cn('w-2 h-2 rounded-full shrink-0 shadow-xs', statusDot)} />}
          <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
            {displayText}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200',
            isOpen && 'transform rotate-180 text-primary'
          )}
        />
      </button>

      {/* Custom Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute top-[calc(100%+6px)] z-50 min-w-full w-max max-w-[280px] max-h-60 overflow-y-auto rounded-2xl border border-border/90 bg-card p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="flex flex-col gap-0.5">
            {parsedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground italic">No options available</div>
            ) : (
              parsedOptions.map((option) => {
                const isSelected = String(option.value) === String(internalValue);
                const dot = getStatusDotColor(option.value);
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'flex items-center justify-between gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium transition-all duration-100 cursor-pointer text-left',
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground/90 hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {dot && <span className={cn('w-2 h-2 rounded-full shrink-0 shadow-xs', dot)} />}
                      {option.icon && <span className="shrink-0">{option.icon}</span>}
                      <span className="truncate">{option.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <span className="text-xs text-destructive font-medium">{error}</span>}
    </div>
  );
});
Select.displayName = 'Select';
