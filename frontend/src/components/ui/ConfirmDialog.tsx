import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading,
}) => {
  const confirmColor = variant === 'danger' ? 'bg-status-escalated hover:bg-red-600' : variant === 'warning' ? 'bg-status-progress hover:bg-amber-600' : 'bg-brand-lime text-background hover:bg-brand-lime-hover';

  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-surface-card border border-border-default rounded-xl shadow-2xl w-full max-w-sm"
            onClick={e => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-start justify-between p-4 pb-2">
              <div className="flex items-start gap-3">
                {variant === 'danger' && <AlertTriangle size={18} className="text-status-escalated mt-0.5 flex-shrink-0" />}
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
                  <p className="text-xs text-text-secondary mt-1">{message}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors focus-ring rounded" aria-label="Close dialog">
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 pt-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-raised hover:bg-surface-hover border border-border-default rounded-lg transition-colors focus-ring"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus-ring ${confirmColor} disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5`}
              >
                {loading && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
