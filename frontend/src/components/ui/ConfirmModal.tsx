import React, { useEffect, useRef, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
}

const variantStyles: Record<ConfirmVariant, { icon: string; confirm: string; border: string }> = {
  danger: {
    icon: 'text-status-escalated',
    confirm: 'bg-status-escalated text-foreground hover:bg-red-600 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    border: 'border-status-escalated/30',
  },
  warning: {
    icon: 'text-status-progress',
    confirm: 'bg-status-progress text-background hover:bg-amber-500',
    border: 'border-status-progress/30',
  },
  info: {
    icon: 'text-status-new',
    confirm: 'bg-brand-lime text-background hover:bg-brand-dim hover:shadow-[0_0_12px_rgba(198,241,53,0.3)]',
    border: 'border-panel-border',
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const vs = variantStyles[variant];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      onCancel();
    }
  }, [onCancel, loading]);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open && previousFocus.current) {
      previousFocus.current.focus();
      previousFocus.current = null;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`bg-panel-bg border ${vs.border} rounded-lg max-w-md w-full p-6 shadow-2xl shadow-black/40 outline-none animate-fade-in-up`}
      >
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${vs.border} bg-panel-card`}>
            <AlertTriangle size={20} className={vs.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-panel-border">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-mono font-medium rounded bg-panel-card border border-panel-border text-gray-300 hover:bg-panel-hover transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-mono font-semibold rounded transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${vs.confirm}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
