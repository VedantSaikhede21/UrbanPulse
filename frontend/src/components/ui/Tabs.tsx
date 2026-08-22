import React, { createContext, useContext, useState, useRef, useEffect, useId } from 'react';

type TabsVariant = 'underline' | 'pill' | 'segmented';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: TabsVariant;
  tabsId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within a Tabs provider');
  return ctx;
};

interface TabsProps {
  defaultValue: string;
  variant?: TabsVariant;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, variant = 'underline', onChange, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const tabsId = useId();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  const variantClasses = {
    underline: 'border-b border-border-default',
    pill: '',
    segmented: 'bg-surface-elevated rounded-lg p-1',
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange, variant, tabsId }}>
      <div className={className}>
        <div
          role="tablist"
          aria-orientation="horizontal"
          className={`flex gap-1 overflow-x-auto scrollbar-thin ${variantClasses[variant]}`}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && (child.type as React.ComponentType<any>).displayName === 'TabList') {
              return React.cloneElement(child as React.ReactElement<any>, { variant });
            }
            return child;
          })}
        </div>
        <div className="mt-4">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && (child.type as React.ComponentType<any>).displayName === 'TabPanel') {
              return React.cloneElement(child as React.ReactElement<any>, { activeTab });
            }
            return child;
          })}
        </div>
      </div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  variant?: TabsVariant;
  children: React.ReactNode;
  className?: string;
}

function TabListComponent({ variant, children, className = '' }: TabListProps) {
  const { activeTab, setActiveTab, tabsId, variant: ctxVariant } = useTabsContext();
  const currentVariant = variant || ctxVariant;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Add gradient fade on scroll for mobile
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateFade = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 4;
      el.style.backgroundImage = atEnd
        ? 'none'
        : 'linear-gradient(to right, transparent, var(--color-surface-base))';
    };

    updateFade();
    el.addEventListener('scroll', updateFade);
    return () => el.removeEventListener('scroll', updateFade);
  }, []);

  return (
    <div ref={scrollRef} className={`flex gap-1 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.type as React.ComponentType<any>).displayName === 'Tab') {
          return React.cloneElement(child as React.ReactElement<any>, {
            isActive: child.props.value === activeTab,
            onSelect: setActiveTab,
            tabsId,
            variant: currentVariant,
          });
        }
        return child;
      })}
    </div>
  );
}

TabListComponent.displayName = 'TabList';

interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: TabsVariant;
  isActive?: boolean;
  onSelect?: (value: string) => void;
  tabsId?: string;
}

function TabComponent({ value, children, disabled, className = '', variant, isActive, onSelect, tabsId }: TabProps) {
  const handleClick = () => {
    if (!disabled && onSelect) onSelect(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(value);
    }
  };

  const baseStyles = `
    flex-shrink-0 h-9 px-3 font-label font-medium text-sm
    transition-all duration-150 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const variantStyles = {
    underline: isActive
      ? 'text-brand-lime border-b-2 border-brand-lime -mb-px'
      : 'text-text-secondary hover:text-text-primary',
    pill: isActive
      ? 'bg-surface-card text-brand-lime shadow-sm'
      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md',
    segmented: isActive
      ? 'bg-brand-lime text-background shadow-sm'
      : 'text-text-secondary hover:text-text-primary',
  };

  return (
    <button
      role="tab"
      id={`${tabsId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${tabsId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant || 'underline']} ${className}`}
    >
      {children}
    </button>
  );
}

TabComponent.displayName = 'Tab';

interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab: string;
}

function TabPanelComponent({ value, children, className = '', activeTab }: TabPanelProps) {
  const { tabsId } = useTabsContext();
  const isActive = value === activeTab;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`${tabsId}-panel-${value}`}
      aria-labelledby={`${tabsId}-tab-${value}`}
      tabIndex={0}
      className={`animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
}

TabPanelComponent.displayName = 'TabPanel';

export const TabList = TabListComponent;
export const Tab = TabComponent;
export const TabPanel = TabPanelComponent;