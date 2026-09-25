import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import {
  HelpCircle, ChevronDown, ChevronRight, Mail, MessageCircle, ExternalLink,
  FileText, LifeBuoy, AlertTriangle, Map, User
} from 'lucide-react';

/**
 * FAQ answers describe the flow that actually exists. An earlier version
 * promised OTP login (the app uses Google sign-in), officer contact details
 * that are never rendered, hospital-proximity priority scoring, and an
 * escalation agent that raises alerts — none of which are implemented.
 */
const FAQ_ITEMS = [
  {
    q: 'How do I report a civic issue?',
    a: 'Go to Report an issue, add a short description, attach a photo if you have one, and drop a pin on the map. You can also submit reports over WhatsApp. You will need to sign in with Google to track your report afterwards.',
  },
  {
    q: 'What types of issues can I report?',
    a: 'UrbanPulse accepts reports for potholes, broken streetlights, water leaks, sewage overflows, garbage dumping, broken signage, road damage, and other civic infrastructure problems.',
  },
  {
    q: 'How is the priority of my report determined?',
    a: 'The AI pipeline scores the severity of your report and sets a priority automatically. Higher priority reports appear first in the officer queue, so the worst problems are picked up earliest.',
  },
  {
    q: 'Can I track the status of my report?',
    a: 'Yes. Every report gets a ticket ID. From your dashboard you can see the current stage, a plain-language note on what happens next, and how long is left against the target time.',
  },
  {
    q: 'What is the Urban Health Score (UHS)?',
    a: 'UHS is a 0–100 score for each ward. It moves as issues are triaged and verified, so a falling score means a ward is under more strain and needs attention.',
  },
  {
    q: 'What happens after I file a report?',
    a: 'The pipeline classifies the issue, checks for duplicates, scores the priority, and assigns it to the right department and an available field officer. You can follow each stage from your dashboard.',
  },
];

const QUICK_LINKS = [
  { label: 'Report an issue', path: '/auth/citizen-login', icon: AlertTriangle, desc: 'Submit a new civic issue (sign-in required)' },
  { label: 'My dashboard', path: '/citizen', icon: User, desc: 'Track your active reports' },
  { label: 'City incident map', path: '/public-map', icon: Map, desc: 'See what is open across the city' },
  { label: 'Settings', path: '/settings', icon: FileText, desc: 'Manage your account' },
];

export const Support: React.FC = () => {
  useDocumentTitle('Support');
  const breadcrumbs = useBreadcrumbs();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen space-y-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <section className="border-b border-border-default pb-6">
        <div className="flex items-center gap-2 text-brand-lime mb-2">
          <LifeBuoy size={18} />
          <h1 className="text-xl font-serif italic font-bold">Help & Support</h1>
        </div>
        <p className="text-text-secondary text-xs max-w-2xl">
          Find answers to common questions, learn how the platform works, or reach out to the support team.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime">
            <HelpCircle size={18} />
          </div>
          <h2 className="font-serif italic font-bold text-lg">Frequently Asked Questions</h2>
        </div>

        <div className="bg-surface-card border border-border-default rounded-lg divide-y divide-border-default">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-button-${index}`;
            const panelId = `faq-panel-${index}`;
            return (
              <div key={index}>
                <button
                  type="button"
                  id={buttonId}
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full flex min-h-[44px] items-center gap-3 px-5 py-4 text-left hover:bg-panel-bg/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:-outline-offset-2"
                >
                  {isOpen ? (
                    <ChevronDown size={14} className="text-brand-lime shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-500 shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-sm font-medium text-foreground">{item.q}</span>
                </button>
                {isOpen && (
                  <div id={panelId} role="region" aria-labelledby={buttonId} className="px-5 pb-4 pl-12">
                    <p className="text-text-secondary text-xs leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Links */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime">
            <ExternalLink size={18} />
          </div>
          <h2 className="font-serif italic font-bold text-lg">Quick Links</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="bg-surface-card border border-border-default/60 p-4 rounded hover:border-brand-lime/20 transition-all duration-300 group"
            >
              <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime mb-2 group-hover:bg-brand-lime group-hover:text-background transition-all duration-200">
                <link.icon size={16} />
              </div>
              <h3 className="font-serif italic font-bold text-sm mb-0.5">{link.label}</h3>
              <p className="text-text-secondary text-xs">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime">
            <Mail size={18} />
          </div>
          <h2 className="font-serif italic font-bold text-lg">Contact Support</h2>
        </div>

        <div className="bg-surface-card border border-border-default rounded-lg p-5 space-y-4">
          <p className="text-text-secondary text-sm leading-relaxed">
            For technical issues, account questions, or feedback about the platform, email us
            directly. We read every message.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:support@urbanpulse.ai?subject=UrbanPulse%20support%20request"
              className="flex min-h-[44px] items-start gap-3 rounded border border-border-default bg-surface-raised p-4 transition-colors hover:border-brand-lime/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            >
              <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime shrink-0">
                <Mail size={16} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-foreground mb-0.5">Email support</h3>
                <p className="text-text-secondary text-xs font-mono break-all">support@urbanpulse.ai</p>
              </div>
            </a>
            <a
              href="mailto:feedback@urbanpulse.ai?subject=UrbanPulse%20feedback"
              className="flex min-h-[44px] items-start gap-3 rounded border border-border-default bg-surface-raised p-4 transition-colors hover:border-brand-lime/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            >
              <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime shrink-0">
                <MessageCircle size={16} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-foreground mb-0.5">Send feedback</h3>
                <p className="text-text-secondary text-xs font-mono break-all">feedback@urbanpulse.ai</p>
              </div>
            </a>
          </div>

          <div className="rounded border border-status-progress/30 bg-status-progress/10 p-3 flex items-start gap-3">
            <AlertTriangle size={14} className="text-status-progress shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-status-progress text-xs leading-relaxed">
              For urgent infrastructure hazards involving immediate safety risks (active gas leaks,
              collapsing structures, electrical fires), please contact local emergency services
              first. Do not wait for a report to be processed.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="rounded-lg border border-border-default bg-surface-card p-5 text-center space-y-2">
        <p className="text-text-secondary text-sm">
          Found a bug or have a suggestion? We act on both.
        </p>
        <a
          href="mailto:feedback@urbanpulse.ai?subject=UrbanPulse%20feedback"
          className="focus-ring inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-brand-lime hover:underline"
        >
          Send us an email
        </a>
      </section>

    </div>
  );
};
