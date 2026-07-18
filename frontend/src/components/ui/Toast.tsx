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

  useEffect(() => {
    if (data.duration !== 0) {
      const timer = setTimeout(() => onDismiss(data.id), data.duration ?? 5000);
      return () => clearTimeout(timer);
    }
  }, [data.id, data.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
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
        <p className="text-xs font-semibold text-foreground">{data.title}</p>
        {data.message && (
          <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{data.message}</p>
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
