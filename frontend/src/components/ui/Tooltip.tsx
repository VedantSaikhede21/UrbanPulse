import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  delayShow?: number;
  delayHide?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  delayShow = 400,
  delayHide = 100,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipId = useId();
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const triggerRef = useRef<HTMLElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 200; // approximate
    const tooltipHeight = 40; // approximate

    let top = 0, left = 0;
    const gap = 8;

    switch (placement) {
      case 'top':
        top = rect.top - tooltipHeight - gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + gap;
        break;
    }

    setPosition({ top, left });
  };

  const show = () => {
    hideTimeoutRef.current && clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delayShow);
  };

  const hide = () => {
    showTimeoutRef.current && clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delayHide);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hide();
    }
  };

  // Clone children to add ref and event handlers
  const childWithProps = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      show();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      show();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      hide();
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      children.props.onKeyDown?.(e);
      handleKeyDown(e);
    },
    'aria-describedby': isVisible ? tooltipId : undefined,
  });

  const tooltipContent = isVisible ? (
    <div
      id={tooltipId}
      role="tooltip"
      className={`
        fixed z-[100] pointer-events-none
        bg-surface-elevated text-text-primary font-caption px-1.5 py-1
        border border-border-default rounded-md shadow-md
        animate-fade-in
        ${className}
      `}
      style={{ top: position.top, left: position.left, maxWidth: '240px' }}
      aria-hidden="false"
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      {childWithProps}
      {typeof window !== 'undefined' && tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}