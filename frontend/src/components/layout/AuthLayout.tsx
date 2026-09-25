import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';

type AuthVariant = 'citizen' | 'staff';

interface AuthLayoutProps {
  variant: AuthVariant;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const VARIANT_META: Record<AuthVariant, string> = {
  citizen: 'Report and track civic issues in your ward',
  staff: 'Triage, assign and resolve city tickets',
};

/**
 * Shared chrome for every unauthenticated screen (login, register, password
 * recovery). Centralising it keeps the five auth pages visually identical:
 * one brand lockup, one card surface, one field style, one alert style.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  variant,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}) => {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center font-sans p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient control-room backdrop — decorative only, hidden from AT */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(198,241,53,0.10) 0%, transparent 65%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[420px]"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-brand-lime transition-colors mb-6 focus-ring"
          aria-label="Back to home page"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Brand + role lockup */}
        <div className="mb-7">
          <Link
            to="/"
            className="flex w-fit items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            aria-label="UrbanPulse AI home"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-lime flex items-center justify-center text-background font-bold text-base">
              U
            </div>
            <span className="font-serif italic font-bold text-lg tracking-tight">
              UrbanPulse <span className="text-brand-lime">AI</span>
            </span>
          </Link>

          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-default bg-panel-card px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" aria-hidden="true" />
              {eyebrow}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-border-default rounded-xl p-6 sm:p-7 card-glow">
          {children}
        </div>

        <p className="mt-5 text-center text-caption text-text-quaternary font-mono">{VARIANT_META[variant]}</p>

        {footer && <div className="mt-4 text-center text-sm text-text-tertiary">{footer}</div>}
      </motion.div>
    </div>
  );
};

interface TextFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
}

/** Single field style for all auth forms — 44px target, DESIGN border/radius. */
export const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  hint,
}) => {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-label uppercase tracking-wider text-text-secondary mb-2">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-describedby={hintId}
        onChange={e => onChange(e.target.value)}
        className="focus-ring w-full min-h-[44px] bg-surface-raised border border-border-default rounded-lg px-4 py-2.5 text-body text-text-primary placeholder:text-text-quaternary transition-colors hover:border-border-hover"
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-caption text-text-quaternary">
          {hint}
        </p>
      )}
    </div>
  );
};

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  required,
  minLength,
  hint,
}) => {
  const [show, setShow] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-label uppercase tracking-wider text-text-secondary mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          aria-describedby={hintId}
          onChange={e => onChange(e.target.value)}
          className="focus-ring w-full min-h-[44px] bg-surface-raised border border-border-default rounded-lg px-4 py-2.5 pr-12 text-body text-text-primary placeholder:text-text-quaternary transition-colors hover:border-border-hover"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-panel-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && (
        <p id={hintId} className="mt-1.5 text-caption text-text-quaternary">
          {hint}
        </p>
      )}
    </div>
  );
};

/** Inline, field-adjacent feedback — never a bare colour-only signal. */
export const AuthAlert: React.FC<{ variant: 'error' | 'success'; message: string }> = ({
  variant,
  message,
}) => {
  const styles =
    variant === 'error'
      ? 'border-status-escalated/30 bg-status-escalated/10 text-status-escalated'
      : 'border-status-resolved/30 bg-status-resolved/10 text-status-resolved';
  const Icon = variant === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div role="alert" className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-body-sm ${styles}`}>
      <Icon size={16} className="shrink-0 mt-px" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};

/** Centred success panel used after a non-form auth action completes. */
export const AuthSuccess: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="text-center">
    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-status-resolved/10 border border-status-resolved/30 flex items-center justify-center">
      <CheckCircle2 size={26} className="text-status-resolved" aria-hidden="true" />
    </div>
    <h2 className="text-display-sm font-semibold text-text-primary">{title}</h2>
    <div className="mt-2 text-body-sm text-text-secondary leading-relaxed">{children}</div>
  </div>
);

/** Quiet text link used in the auth footer rows. */
export const AuthLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1 text-brand-lime font-medium hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
  >
    {children}
  </Link>
);
