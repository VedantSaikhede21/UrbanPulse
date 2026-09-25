import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Bell, Shield, LogOut, Globe, Monitor, Smartphone } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';


const SETTINGS_SECTIONS = [
  {
    id: 'appearance',
    title: 'Appearance',
    icon: Monitor,
    description: 'Customise your viewing experience.',
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    icon: Bell,
    description: 'Control which updates you receive.',
  },
  {
    id: 'account',
    title: 'Account',
    icon: Shield,
    description: 'Manage your session and credentials.',
  },
];

/**
 * Shown in place of a control that would otherwise look interactive but do
 * nothing. A toggle that silently changes nothing is worse than no toggle,
 * so unavailable options are labelled instead of faked.
 */
const UnavailableChip: React.FC = () => (
  <span className="inline-flex items-center rounded-md border border-border-default bg-surface-raised px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-quaternary">
    Not available yet
  </span>
);

export const Settings: React.FC = () => {
  useDocumentTitle('Settings');
  const breadcrumbs = useBreadcrumbs();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('appearance');
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      toast({ type: 'success', title: 'Signed out', message: 'Your session has ended securely.' });
      navigate('/auth/citizen-login', { replace: true });
    } catch {
      toast({ type: 'error', title: 'Sign out failed', message: 'Please try again.' });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 min-h-screen text-foreground font-sans">
      <Breadcrumbs items={breadcrumbs} />
      <div className="border-b border-border-default pb-6">
        <h1 className="text-2xl font-serif italic font-bold">Settings</h1>
        <p className="text-text-tertiary text-xs mt-1">Manage your preferences, notifications, and account.</p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-border-default pb-4 overflow-x-auto">
        {SETTINGS_SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`focus-ring flex items-center gap-2 px-4 py-2 rounded text-xs font-medium transition-all whitespace-nowrap ${
                activeSection === s.id
                  ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/20'
                  : 'text-text-secondary hover:text-foreground border border-transparent'
              }`}
              aria-pressed={activeSection === s.id}
            >
              <Icon size={14} />
              {s.title}
            </button>
          );
        })}
      </div>

      <AnimatedSection>
        {activeSection === 'appearance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-serif italic font-bold">Appearance</h2>
            <p className="-mt-2 text-body-sm text-text-secondary">
              UrbanPulse ships with a single dark control-room theme.
            </p>
            <div className="space-y-3">
              <SettingRow icon={Moon} label="Dark Mode" description="Always on — the app is dark by design.">
                <UnavailableChip />
              </SettingRow>
              <SettingRow icon={Globe} label="Language" description="Interface translations are not available yet.">
                <UnavailableChip />
              </SettingRow>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-serif italic font-bold">Notification Preferences</h2>
            <p className="-mt-2 text-body-sm text-text-secondary">
              Today you are notified inside the app and by WhatsApp when a report changes status.
              These additional channels are not wired up yet.
            </p>
            <div className="space-y-3">
              <SettingRow icon={Smartphone} label="Push Notifications" description="Browser push is not available yet.">
                <UnavailableChip />
              </SettingRow>
              <SettingRow icon={Bell} label="Email Digest" description="Email digests are not available yet.">
                <UnavailableChip />
              </SettingRow>
            </div>
          </div>
        )}

        {activeSection === 'account' && (
          <div className="space-y-4">
            <h2 className="text-lg font-serif italic font-bold">Account</h2>
            <div className="space-y-3">
              {user ? (
                <>
                  <SettingRow icon={Shield} label="Session" description="You are currently logged in">
                    <span className="text-[10px] font-mono text-brand-lime bg-brand-lime/10 px-2 py-1 rounded">Active</span>
                  </SettingRow>
                  <SettingRow icon={LogOut} label="Sign Out" description="End your current session">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      aria-busy={signingOut}
                      className="focus-ring px-3 py-1.5 text-xs font-medium text-status-escalated border border-status-escalated/30 rounded hover:bg-status-escalated/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Sign out of your account"
                    >
                      {signingOut ? 'Signing out…' : 'Sign Out'}
                    </button>
                  </SettingRow>
                </>
              ) : (
                <SettingRow icon={LogOut} label="Account access" description="Sign in to manage your session">
                  <button
                    type="button"
                    onClick={() => navigate('/auth/citizen-login')}
                    className="focus-ring px-3 py-1.5 text-xs font-medium text-brand-lime border border-brand-lime/30 rounded hover:bg-brand-lime/10 transition-colors"
                  >
                    Sign In
                  </button>
                </SettingRow>
              )}
            </div>
          </div>
        )}
      </AnimatedSection>
    </div>
  );
};

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between bg-surface-card border border-border-default rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-border-default/30 flex items-center justify-center">
          <Icon size={16} className="text-text-secondary" />
        </div>
        <div>
          <p className="text-sm text-text-primary">{label}</p>
          {description && <p className="text-[10px] text-text-tertiary mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function AnimatedSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
