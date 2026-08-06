import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import {
  HelpCircle, ChevronDown, ChevronRight, Mail, MessageCircle, ExternalLink,
  FileText, LifeBuoy, AlertTriangle, Map, Activity, User
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'How do I report a civic issue?',
    a: 'Navigate to the Report Issue page and fill out the form with a description, photo, and location. You can also submit reports via WhatsApp. An OTP-based login is required to track your report.',
  },
  {
    q: 'What types of issues can I report?',
    a: 'UrbanPulse accepts reports for potholes, broken streetlights, water leaks, sewage overflows, garbage dumping, broken signage, road damage, and other civic infrastructure problems.',
  },
  {
    q: 'How is the priority of my report determined?',
    a: 'Priority is calculated automatically based on proximity to hospitals, schools, and critical infrastructure, severity of the issue, your citizen reputation score, and historical data for the location.',
  },
  {
    q: 'Can I track the status of my report?',
    a: 'Yes. Every report gets a unique ticket ID. You can view real-time status updates, see which AI agent is processing it, and track the SLA timer from your Citizen Dashboard.',
  },
  {
    q: 'What is the Urban Health Score (UHS)?',
    a: 'UHS is a dynamic 0-100 score for each ward based on the number of resolved vs pending issues, average response times, citizen feedback, and infrastructure condition trends.',
  },
  {
    q: 'How do I contact a field officer?',
    a: 'Once your report is assigned, you can view the officer details in your ticket view. For urgent matters, the escalation agent will notify the department head automatically.',
  },
];

const QUICK_LINKS = [
  { label: 'Report an Issue', path: '/auth/citizen-login', icon: AlertTriangle, desc: 'Submit a new civic complaint' },
  { label: 'My Dashboard', path: '/citizen/dashboard', icon: User, desc: 'Track your active tickets' },
  { label: 'Ward Health Map', path: '/public-map', icon: Map, desc: 'View city-wide UHS scores' },
  { label: 'Live Agent Trace', path: '/trace', icon: Activity, desc: 'Watch the AI pipeline in action' },
  { label: 'Settings', path: '/settings', icon: FileText, desc: 'Manage your profile and preferences' },
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
          {FAQ_ITEMS.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-panel-bg/50 transition-colors"
              >
                {openIndex === index ? (
                  <ChevronDown size={14} className="text-brand-lime shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-gray-500 shrink-0" />
                )}
                <span className="text-sm font-medium text-foreground">{item.q}</span>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4 pl-12">
                  <p className="text-text-secondary text-xs leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
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
            Our support team is available during business hours to help with technical issues, 
            account questions, and feedback about the platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-raised border border-border-default rounded p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground mb-0.5">Email Support</h3>
                <p className="text-text-secondary text-xs font-mono">support@urbanpulse.ai</p>
              </div>
            </div>
            <div className="bg-surface-raised border border-border-default rounded p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime shrink-0">
                <MessageCircle size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground mb-0.5">WhatsApp Channel</h3>
                <p className="text-text-secondary text-xs font-mono">Available on pilot wards</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-900/20 border border-amber-800/30 rounded p-3 flex items-start gap-3">
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300 text-xs leading-relaxed">
              For urgent infrastructure hazards involving immediate safety risks (active gas leaks, 
              collapsing structures, electrical fires), please contact local emergency services 
              directly. UrbanPulse reports are processed during standard municipal hours.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="bg-surface-card border border-border-default rounded-lg p-5 text-center space-y-2">
        <p className="text-text-secondary text-sm">
          Have suggestions or found a bug? We welcome feedback to improve the platform.
        </p>
        <p className="text-text-tertiary text-xs font-mono">
          Reach us at feedback@urbanpulse.ai
        </p>
      </section>

    </div>
  );
};
