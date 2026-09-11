import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: ToastItem[];
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string, title?: string) => addToast(message, 'success', title),
    error: (message: string, title?: string) => addToast(message, 'error', title),
    info: (message: string, title?: string) => addToast(message, 'info', title),
  };

  // Intercept any raw window.alert calls and route to beautiful LifeShelf toast
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg?: unknown) => {
      addToast(String(msg ?? ''), 'info', 'Notice');
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Floating Toast Notification Container (Top Right) */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={cn(
              'pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-xl text-sm transition-all duration-200 animate-in fade-in-0 slide-in-from-top-2',
              'bg-card/95 text-foreground ring-1 ring-black/5 dark:ring-white/10',
              t.type === 'success' && 'border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/5',
              t.type === 'error' && 'border-rose-500/30 dark:border-rose-500/20 shadow-rose-500/5',
              t.type === 'info' && 'border-primary/30 shadow-primary/5'
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              {/* Type Icon Container */}
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                  t.type === 'success' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                  t.type === 'error' && 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                  t.type === 'info' && 'bg-primary/15 text-primary'
                )}
              >
                {t.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {t.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                {t.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
                {t.title && (
                  <span className="font-semibold text-xs text-foreground tracking-tight">
                    {t.title}
                  </span>
                )}
                <span className="text-xs text-foreground/90 font-medium leading-relaxed break-words">
                  {t.message}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary shrink-0 -mr-1 -mt-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
