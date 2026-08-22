import React, { useState, useRef, useEffect, useId, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

type DropdownPlacement = 'bottom' | 'top' | 'left' | 'right';
type DropdownAlign = 'start' | 'end' | 'center';

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  menuRef: React.RefObject<HTMLDivElement>;
  onItemSelect: (value: string) => void;
  selectedValue?: string;
  placement: DropdownPlacement;
  align: DropdownAlign;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('Dropdown components must be used within a Dropdown provider');
  return ctx;
};

interface DropdownProps {
  children: React.ReactNode;
  placement?: DropdownPlacement;
  align?: DropdownAlign;
  onChange?: (value: string) => void;
  defaultOpen?: boolean;
}

export function Dropdown({
  children,
  placement = 'bottom',
  align = 'start',
  onChange,
  defaultOpen = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleItemSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    onChange?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    const menu = menuRef.current;
    if (!menu) return;

    const items = menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])');
    if (items.length === 0) return;

    const currentIndex = Array.from(items).findIndex(el => el === document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, items.length - 1);
        items[nextIndex >= 0 ? nextIndex : 0].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        items[prevIndex].focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0].focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1].focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (currentIndex >= 0) {
          items[currentIndex].click();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
          menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Position menu
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current!;
      const menu = menuRef.current!;
      const triggerRect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const gap = 4;

      let top = 0, left = 0;

      // Vertical placement
      if (placement === 'bottom') {
        top = triggerRect.bottom + gap;
      } else if (placement === 'top') {
        top = triggerRect.top - menuRect.height - gap;
      }

      // Horizontal alignment
      if (align === 'start') {
        left = triggerRect.left;
      } else if (align === 'end') {
        left = triggerRect.right - menuRect.width;
      } else {
        left = triggerRect.left + triggerRect.width / 2 - menuRect.width / 2;
      }

      // Keep within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      left = Math.max(4, Math.min(left, viewportWidth - menuRect.width - 4));
      top = Math.max(4, Math.min(top, viewportHeight - menuRect.height - 4));

      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, placement, align]);

  const contextValue: DropdownContextValue = {
    isOpen,
    setIsOpen,
    triggerRef,
    menuRef,
    onItemSelect: handleItemSelect,
    selectedValue,
    placement,
    align,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div className="inline-block relative" onKeyDown={handleKeyDown}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>);
          }
          return child;
        })}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

function DropdownTriggerComponent({ children, className = '', 'aria-label': ariaLabel }: DropdownTriggerProps) {
  const { isOpen, setIsOpen, triggerRef } = useDropdownContext();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center gap-2 px-3 py-2 bg-surface-card border border-border-default rounded-lg
        text-body-sm text-text-primary
        hover:bg-surface-hover hover:border-border-hover
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base
        transition-all duration-150
        ${className}
      `}
    >
      {children}
      <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
    </button>
  );
}

DropdownTriggerComponent.displayName = 'DropdownTrigger';

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
  maxHeight?: string;
}

function DropdownMenuComponent({ children, className = '', minWidth = '160px', maxHeight = '320px' }: DropdownMenuProps) {
  const { isOpen, menuRef, selectedValue } = useDropdownContext();

  if (!isOpen) return null;

  const menuContent = (
    <div
      ref={menuRef}
      role="menu"
      className={`
        fixed z-[100] min-w-[${minWidth}] max-h-[${maxHeight}] overflow-y-auto
        bg-surface-elevated border border-border-default rounded-lg shadow-md p-1
        animate-fade-in scrollbar-thin
        ${className}
      `}
      tabIndex={-1}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { selectedValue });
        }
        return child;
      })}
    </div>
  );

  return createPortal(menuContent, document.body);
}

DropdownMenuComponent.displayName = 'DropdownMenu';

interface DropdownItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  selectedValue?: string;
}

function DropdownItemComponent({ value, children, disabled, className = '', icon, selectedValue }: DropdownItemProps) {
  const { onItemSelect, isOpen } = useDropdownContext();
  const isSelected = value === selectedValue;

  const handleClick = () => {
    if (!disabled) {
      onItemSelect(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onItemSelect(value);
    }
  };

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={isOpen ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-disabled={disabled}
      aria-selected={isSelected}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-body-sm text-text-primary
        rounded-md transition-colors duration-100
        hover:bg-surface-hover focus:bg-surface-hover focus:outline-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isSelected ? 'bg-brand-soft text-brand-lime' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0 w-4 h-4">{icon}</span>}
      <span className="flex-1 text-left">{children}</span>
      {isSelected && <Check size={14} className="text-brand-lime flex-shrink-0" aria-hidden="true" />}
    </button>
  );
}

DropdownItemComponent.displayName = 'DropdownItem';

interface DropdownSectionProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

function DropdownSectionComponent({ label, children, className = '' }: DropdownSectionProps) {
  return (
    <div className={className}>
      {label && (
        <div className="px-3 py-1.5 text-overline font-medium text-text-tertiary uppercase tracking-wider">
          {label}
        </div>
      )}
      <div role="group">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && (child.type as React.ComponentType<any>).displayName === 'DropdownItem') {
            return React.cloneElement(child as React.ReactElement<any>);
          }
          return child;
        })}
      </div>
    </div>
  );
}

DropdownSectionComponent.displayName = 'DropdownSection';

interface DropdownSeparatorProps {
  className?: string;
}

function DropdownSeparatorComponent({ className = '' }: DropdownSeparatorProps) {
  return <hr className={`border-t border-border-subtle my-1 ${className}`} role="separator" aria-hidden="true" />;
}

DropdownSeparatorComponent.displayName = 'DropdownSeparator';

export const DropdownTrigger = DropdownTriggerComponent;
export const DropdownMenu = DropdownMenuComponent;
export const DropdownItem = DropdownItemComponent;
export const DropdownSection = DropdownSectionComponent;
export const DropdownSeparator = DropdownSeparatorComponent;