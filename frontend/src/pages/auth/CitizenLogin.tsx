import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { signInWithGoogle } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { AuthAlert, AuthLayout } from '../../components/layout/AuthLayout';
import { CheckCircle2, FileText, MapPin, ShieldCheck } from 'lucide-react';

const CITIZEN_STEPS = [
  { icon: FileText, label: 'Describe the issue', detail: 'Category, description and a photo if you have one' },
  { icon: MapPin, label: 'Pin the exact location', detail: 'Drop a pin or use your phone GPS' },
  { icon: CheckCircle2, label: 'AI triages and assigns it', detail: 'Department, priority and SLA are set automatically' },
];

export default function CitizenLogin() {
  useDocumentTitle('Citizen Login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) {
      setError(error);
    }
  }

  return (
    <AuthLayout
      variant="citizen"
      eyebrow="Citizen Portal"
      title="Sign in to report and track issues"
      subtitle="One Google account. No municipal paperwork, no forms to download."
      footer={
        <>
          Municipal staff?{' '}
          <Link
            to="/auth/staff-login"
            className="text-brand-lime font-medium hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
          >
            Staff Login
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <AuthAlert variant="error" message={error} />
        </div>
      )}

      <Button
        id="google-login-btn"
        onClick={handleGoogleLogin}
        disabled={loading}
        fullWidth
        size="lg"
        variant="primary"
        loading={loading}
        leftIcon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        }
      >
        {loading ? 'Connecting…' : 'Continue with Google'}
      </Button>

      {/* Onboarding: tell first-time users what happens after sign-in */}
      <div className="mt-6 pt-5 border-t border-border-subtle">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-quaternary mb-3">
          How it works
        </p>
        <ol className="space-y-3">
          {CITIZEN_STEPS.map((step, i) => (
            <li key={step.label} className="flex items-start gap-3">
              <div className="shrink-0 w-7 h-7 rounded-md bg-brand-soft border border-brand-lime/20 flex items-center justify-center">
                <step.icon size={14} className="text-brand-lime" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-body-sm text-text-primary font-medium leading-tight">
                  <span className="font-mono text-text-quaternary mr-1.5">{String(i + 1).padStart(2, '0')}</span>
                  {step.label}
                </p>
                <p className="text-caption text-text-tertiary mt-0.5">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-5 flex items-start gap-2 text-caption text-text-quaternary">
        <ShieldCheck size={14} className="shrink-0 mt-px" aria-hidden="true" />
        Your email is used only for ticket updates. We never share it with third parties.
      </p>
    </AuthLayout>
  );
}
