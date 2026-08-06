import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Bell, Shield, LogOut, Globe, Monitor, Smartphone } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';

type Theme = 'dark' | 'light';

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

export const Settings: React.FC = () => {
  useDocumentTitle('Settings');
  const breadcrumbs = useBreadcrumbs();
  const [theme, setTheme] = useState<Theme>('dark');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('appearance');

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
            <div className="space-y-3">
              <SettingRow icon={Moon} label="Dark Mode">
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`focus-ring relative w-12 h-6 rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-brand-lime' : 'bg-border-default'
                  }`}
                  role="switch"
                  aria-checked={theme === 'dark'}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </SettingRow>
              <SettingRow icon={Globe} label="Language">
                <select
                  className="focus-ring bg-surface-card border border-border-default rounded px-3 py-1.5 text-xs text-text-primary"
                  defaultValue="en"
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="mr">मराठी</option>
                </select>
              </SettingRow>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-serif italic font-bold">Notification Preferences</h2>
            <div className="space-y-3">
              <SettingRow icon={Smartphone} label="Push Notifications" description="Receive real-time updates on your reports">
                <button
                  type="button"
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`focus-ring relative w-12 h-6 rounded-full transition-colors ${
                    pushEnabled ? 'bg-brand-lime' : 'bg-border-default'
                  }`}
                  role="switch"
                  aria-checked={pushEnabled}
                  aria-label="Toggle push notifications"
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow transition-transform ${
                      pushEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </SettingRow>
              <SettingRow icon={Bell} label="Email Digest" description="Weekly summary of your activity">
                <button
                  type="button"
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`focus-ring relative w-12 h-6 rounded-full transition-colors ${
                    emailEnabled ? 'bg-brand-lime' : 'bg-border-default'
                  }`}
                  role="switch"
                  aria-checked={emailEnabled}
                  aria-label="Toggle email digest"
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow transition-transform ${
                      emailEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </SettingRow>
            </div>
          </div>
        )}

        {activeSection === 'account' && (
          <div className="space-y-4">
            <h2 className="text-lg font-serif italic font-bold">Account</h2>
            <div className="space-y-3">
              <SettingRow icon={Shield} label="Session" description="You are currently logged in">
                <span className="text-[10px] font-mono text-brand-lime bg-brand-lime/10 px-2 py-1 rounded">Active</span>
              </SettingRow>
              <SettingRow icon={LogOut} label="Sign Out" description="End your current session">
                <button
                  type="button"
                  onClick={() => signOut?.()}
                  className="focus-ring px-3 py-1.5 text-xs font-medium text-red-400 border border-red-800/30 rounded hover:bg-red-950/30 transition-colors"
                  aria-label="Sign out of your account"
                >
                  Sign Out
                </button>
              </SettingRow>
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
