import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (data: Omit<ToastData, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColors: Record<ToastType, string> = {
  success: 'text-status-resolved',
  error: 'text-status-escalated',
  warning: 'text-status-progress',
  info: 'text-status-new',
};

const borderColors: Record<ToastType, string> = {
  success: 'border-status-resolved/30',
  error: 'border-status-escalated/30',
  warning: 'border-status-progress/30',
  info: 'border-status-new/30',
};

const bgColors: Record<ToastType, string> = {
  success: 'bg-status-resolved/10',
  error: 'bg-status-escalated/10',
  warning: 'bg-status-progress/10',
  info: 'bg-status-new/10',
};

const ToastItem: React.FC<{
  data: ToastData;
  onDismiss: (id: string) => void;
}> = ({ data, onDismiss }) => {
  const Icon = icons[data.type];
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const startTimeRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(data.duration ?? 5000);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const startTimer = useCallback((duration: number) => {
    clearTimer();
    if (duration > 0) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => onDismiss(data.id), duration);
    }
  }, [data.id, onDismiss, clearTimer]);

  useEffect(() => {
    if (data.duration !== 0) {
      remainingRef.current = data.duration ?? 5000;
      startTimer(remainingRef.current);
    }
    return clearTimer;
  }, [data.duration, startTimer, clearTimer]);

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      clearTimer();
    }
  }, [clearTimer]);

  const handleMouseLeave = useCallback(() => {
    if (remainingRef.current > 0 && data.duration !== 0) {
      startTimer(remainingRef.current);
    }
  }, [startTimer, data.duration]);

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg shadow-black/30
        backdrop-blur-md
        ${bgColors[data.type]}
        ${borderColors[data.type]}
        animate-slide-in-right
      `}
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${iconColors[data.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-caption font-semibold text-foreground">{data.title}</p>
        {data.message && (
          <p className="text-meta text-tertiary mt-0.5 leading-relaxed">{data.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(data.id)}
        className="shrink-0 text-gray-500 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-lime rounded"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((data: Omit<ToastData, 'id'>): string => {
    const id = `toast-${++counterRef.current}-${Date.now()}`;
    setToasts(prev => [...prev, { ...data, id }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 max-w-sm w-full pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem data={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
