import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, AlertTriangle, Info, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

type ConfirmVariant = 'danger' | 'warning' | 'info';
type ConfirmSize = 'sm' | 'md' | 'lg';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant?: ConfirmVariant;
  size?: ConfirmSize;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
}

const variantConfig: Record<ConfirmVariant, { icon: React.ElementType; iconColor: string; iconBg: string }> = {
  danger: { icon: AlertCircle, iconColor: 'text-status-escalated', iconBg: 'bg-status-escalated/10' },
  warning: { icon: AlertTriangle, iconColor: 'text-status-progress', iconBg: 'bg-status-progress/10' },
  info: { icon: Info, iconColor: 'text-status-new', iconBg: 'bg-status-new/10' },
};

const sizeStyles: Record<ConfirmSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  variant = 'danger',
  size = 'md',
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmLoading = false,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        if (e.key === 'Tab') {
          // Focus trap
          const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusableElements || focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { icon: Icon, iconColor, iconBg } = variantConfig[variant];

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeStyles[size]} bg-surface-raised border border-border-default rounded-lg
          shadow-xl p-6 animate-scale-in
        `}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            <Icon size={24} className={iconColor} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="confirm-modal-title" className="text-body font-semibold text-text-primary">
              {title}
            </h2>
            <p id="confirm-modal-description" className="text-body-sm text-text-secondary mt-1.5">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-text-tertiary hover:text-text-primary transition-colors rounded-md p-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={confirmLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            size="md"
            onClick={onConfirm}
            loading={confirmLoading}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}