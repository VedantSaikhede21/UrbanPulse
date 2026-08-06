import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type ShortcutAction =
  | { type: 'navigate'; path: string }
  | { type: 'openDialog'; dialog: string }
  | { type: 'action'; callback: () => void };

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: ShortcutAction;
  roles?: string[];
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const shortcutsRef = useRef<Shortcut[]>([]);

  const shortcuts: Shortcut[] = [
    { key: 'h', description: 'Home', action: { type: 'navigate', path: '/' } },
    { key: 'd', ctrl: true, description: 'Dashboard', action: { type: 'navigate', path: `/${role}/dashboard` }, roles: ['citizen', 'dept', 'admin', 'super-admin'] },
    { key: 'q', ctrl: true, description: 'Queue', action: { type: 'navigate', path: '/officer/queue' }, roles: ['super-admin', 'admin', 'dept', 'officer'] },
    { key: 'r', ctrl: true, description: 'Report Issue', action: { type: 'navigate', path: '/citizen/report' }, roles: ['citizen'] },
    { key: 'f', ctrl: true, description: 'Focus search', action: { type: 'action', callback: () => {
      const el = document.querySelector<HTMLInputElement>('[data-search-input]');
      el?.focus();
    }}},
    { key: 'k', ctrl: true, description: 'Command palette', action: { type: 'action', callback: () => {
      window.dispatchEvent(new CustomEvent('toggle-command-palette'));
    }}},
    { key: 'Escape', description: 'Close modals', action: { type: 'action', callback: () => {
      document.querySelector<HTMLButtonElement>('[data-dismiss-modal]')?.click();
    }}},
    { key: '/', ctrl: true, description: 'Search tickets', action: { type: 'action', callback: () => {
      const el = document.querySelector<HTMLInputElement>('[data-search-input]');
      el?.focus();
      el?.select();
    }}},
    { key: 'p', ctrl: true, description: 'Profile', action: { type: 'navigate', path: `/${role}/profile` } },
    { key: 'n', ctrl: true, description: 'Notifications', action: { type: 'navigate', path: '/citizen/notifications' }, roles: ['citizen'] },
    { key: '?', shift: true, description: 'Show keyboard shortcuts', action: { type: 'action', callback: () => {
      window.dispatchEvent(new CustomEvent('toggle-shortcuts-help'));
    }}},
  ];

  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

    if (e.key !== 'Escape' && isInput) return;
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) return;

    for (const s of shortcutsRef.current) {
      if (s.key !== e.key) continue;
      if (s.ctrl && !e.ctrlKey && !e.metaKey) continue;
      if (s.shift && !e.shiftKey) continue;
      if (s.alt && !e.altKey) continue;
      if (s.roles && !s.roles.includes(role || '')) continue;

      e.preventDefault();
      e.stopPropagation();

      if (s.action.type === 'navigate') {
        navigate(s.action.path);
      } else if (s.action.type === 'action') {
        s.action.callback();
      }
      break;
    }
  }, [navigate, role]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}
