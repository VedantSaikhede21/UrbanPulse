import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Command } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const shortcuts = useKeyboardShortcuts();

  React.useEffect(() => {
    const handler = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-shortcuts-help', handler);
    return () => window.removeEventListener('toggle-shortcuts-help', handler);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-surface-card border border-border-default rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <div className="flex items-center justify-between p-4 border-b border-border-default">
              <div className="flex items-center gap-2">
                <Command size={16} className="text-brand-lime" />
                <h2 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors focus-ring rounded"
                aria-label="Close shortcuts"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-surface-raised transition-colors">
                  <span className="text-xs text-text-secondary">{s.description}</span>
                  <kbd className="flex items-center gap-0.5 text-[10px] font-mono">
                    {s.ctrl && <span className="px-1.5 py-0.5 rounded bg-surface-raised border border-border-default text-text-tertiary">⌘</span>}
                    {s.shift && <span className="px-1.5 py-0.5 rounded bg-surface-raised border border-border-default text-text-tertiary">⇧</span>}
                    {s.alt && <span className="px-1.5 py-0.5 rounded bg-surface-raised border border-border-default text-text-tertiary">⌥</span>}
                    <span className="px-1.5 py-0.5 rounded bg-surface-raised border border-border-default text-text-tertiary font-semibold">
                      {s.key === 'Escape' ? 'Esc' : s.key === '/' ? '/' : s.key.toUpperCase()}
                    </span>
                  </kbd>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border-default">
              <p className="text-[10px] text-text-quaternary text-center">
                Press <kbd className="px-1 py-0.5 rounded bg-surface-raised border border-border-default text-text-tertiary">?</kbd> to toggle
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
