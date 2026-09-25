import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, Home, Users, ArrowRight } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const NAV = [
  // `compact: true` links are hidden below md so the header cannot overflow a
  // 360-400px phone (logo + 4 links measured 394px at 375px).
  { to: '/', label: 'Home', icon: Home, compact: true },
  { to: '/public-map', label: 'City map', icon: Map, compact: false },
  { to: '/auth/citizen-login', label: 'Citizen', icon: Users, compact: true },
];

/**
 * Chrome for every unauthenticated page (landing, about, public map, support).
 *
 * Without this, a visitor who landed on /public-map had no logo, no links and
 * no way home except the browser back button. Auth screens opt out via
 * `hideNav` because they already own their own centred layout.
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const hideNav = pathname.startsWith('/auth/');

  if (hideNav) {
    return <div className="min-h-screen bg-background text-foreground font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Skip link: rendered here for public pages. App.tsx owns the skip link
          for the authenticated shell, so only one exists per route. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-brand-lime focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-background"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-border-default bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            aria-label="UrbanPulse AI home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-lime text-base font-bold text-background">
              U
            </div>
            <span className="hidden font-serif text-lg font-bold italic tracking-tight sm:inline">
              UrbanPulse <span className="text-brand-lime">AI</span>
            </span>
          </Link>

          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, compact }) => {
              const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  // The visible label is hidden on small screens, so the link
                  // would otherwise be announced as an unlabelled control.
                  aria-label={label}
                  className={`inline-flex h-11 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime md:px-3 ${
                    compact ? 'hidden md:inline-flex' : ''
                  } ${
                    active
                      ? 'bg-brand-soft text-brand-lime'
                      : 'text-text-secondary hover:bg-surface-card hover:text-text-primary'
                  }`}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <Link
              to="/auth/staff-login"
              className="ml-1 inline-flex h-11 items-center gap-1.5 rounded-md bg-brand-lime px-3.5 text-sm font-semibold text-background transition-colors hover:bg-brand-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Staff login
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border-default px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-[11px] font-mono text-text-quaternary sm:flex-row">
          <span>© {new Date().getFullYear()} UrbanPulse AI. Built for Indian municipal infrastructure.</span>
          <nav aria-label="Footer" className="flex items-center gap-4">
            <Link to="/about" className="rounded hover:text-brand-lime">About</Link>
            <Link to="/support" className="rounded hover:text-brand-lime">Support</Link>
            <Link to="/auth/staff-login" className="rounded hover:text-brand-lime">Staff</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};
