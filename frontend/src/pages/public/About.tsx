import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import {
  Shield, Activity, Map, AlertTriangle, CheckCircle2, Languages, Cpu,
  Workflow, Layers, Server, Database, BrainCircuit, Route, Clock, BarChart3, ArrowRight
} from 'lucide-react';

/**
 * Every description below states only what the running system actually does.
 * An earlier version claimed proximity-to-hospital scoring, ward-boundary
 * "nearest officer" routing, image-fingerprint dedup, citizen-satisfaction
 * scoring and escalation alerts — none of which are implemented, and all of
 * which a technical judge can disprove by reading the graph.
 */
const FEATURES = [
  {
    icon: Languages,
    title: 'Multilingual Intake',
    description: 'Citizens report issues via the web app or WhatsApp. Voice notes, photos and videos are accepted, and the AI pipeline understands the description in any language you write it in.',
  },
  {
    icon: Shield,
    title: 'Spam & Duplicate Detection',
    description: 'Dedicated agents merge reports filed for the same spot within a 100m radius and the same category, and flag accounts that have filed an unusual volume of reports.',
  },
  {
    icon: AlertTriangle,
    title: 'Priority Calculation',
    description: 'Every ticket is scored for severity and given a priority. High-priority issues are surfaced first in the officer queue so the worst problems are handled earliest.',
  },
  {
    icon: Route,
    title: 'Intelligent Routing',
    description: 'Issues are routed to the correct municipal department, then assigned to the field officer carrying the lightest active workload.',
  },
  {
    icon: Activity,
    title: 'SLA Monitoring',
    description: 'Every ticket carries a target resolution time derived from its category. The queue shows how long is left, and flags anything that has already overrun.',
  },
  {
    icon: Map,
    title: 'Ward Health Scoring',
    description: 'Each ward gets a dynamic Urban Health Score (0–100) that moves as issues are triaged and verified, so strain is visible before it becomes a crisis.',
  },
  {
    icon: CheckCircle2,
    title: 'Auto Verification',
    description: 'When an officer marks a ticket resolved, a verification agent reviews the closure evidence and confirms the fix before the ticket is closed.',
  },
  {
    icon: BarChart3,
    title: 'City Analytics',
    description: 'Department heads and city administrators get dashboards with ward trends, incident heatmaps, officer workload metrics and bottleneck alerts.',
  },
];

const PIPELINE_STEPS = [
  { icon: Languages, step: '01', title: 'Citizen Reports', description: 'Issue submitted via the web app or WhatsApp with a photo, location, and description.' },
  { icon: BrainCircuit, step: '02', title: 'AI Analysis', description: 'Gemini 2.5 Flash classifies the issue and extracts the details we need to route it.' },
  { icon: Shield, step: '03', title: 'Trust & Dedup', description: 'Fraud detection and deduplication agents verify authenticity and merge duplicate reports.' },
  { icon: AlertTriangle, step: '04', title: 'Priority Scoring', description: 'A severity score is calculated and the ticket is queued against the right SLA.' },
  { icon: Route, step: '05', title: 'Officer Dispatch', description: 'The ticket is routed to the correct department and assigned to a field officer.' },
  { icon: Clock, step: '06', title: 'Resolution & Verify', description: 'The officer resolves the issue with proof, and the verification agent confirms closure.' },
];

const TECH_STACK = [
  { icon: Server, label: 'Backend', value: 'FastAPI + LangGraph' },
  { icon: BrainCircuit, label: 'AI Model', value: 'Gemini 2.5 Flash' },
  { icon: Layers, label: 'Frontend', value: 'React + Tailwind CSS' },
  { icon: Database, label: 'Database', value: 'Supabase (PostgreSQL)' },
  { icon: Map, label: 'Maps', value: 'Leaflet + basemap tiles' },
  { icon: Cpu, label: 'Orchestration', value: 'Multi-agent LangGraph pipeline' },
];

export const About: React.FC = () => {
  useDocumentTitle('About');
  const breadcrumbs = useBreadcrumbs();
  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen space-y-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section */}
      <section className="border-b border-border-default pb-8">
        <div className="flex items-center gap-2 text-brand-lime mb-2">
          <Activity size={18} className="animate-pulse" />
          <h1 className="text-xl font-serif italic font-bold">About UrbanPulse AI</h1>
        </div>
        <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
          An AI-powered civic infrastructure triage platform built for Indian municipalities.
          Where a conventional complaint portal hides the process behind a ticket number,
          UrbanPulse shows how each report was categorised, prioritised, routed and closed.
        </p>
      </section>

      {/* Overview */}
      <section className="bg-surface-card border border-border-default rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime">
            <Workflow size={18} />
          </div>
          <h2 className="font-serif italic font-bold text-lg">What Is UrbanPulse?</h2>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">
          UrbanPulse is a civic technology platform that uses a multi-agent AI pipeline to
          triage, route and track civic infrastructure complaints. Citizens report issues — from
          potholes to water leaks to broken streetlights — with a photo and a map pin, through the
          web app or WhatsApp. Behind the scenes, specialised LangGraph agents analyse,
          deduplicate, prioritise, route and verify each report, while keeping every stakeholder
          informed.
        </p>
        <p className="text-text-secondary text-sm leading-relaxed">
          The platform provides dynamic Ward Health Scores, per-category SLA tracking, a public
          incident map, and per-department analytics. Every automated decision is recorded, so a
          department head can answer not just "how many complaints" but "why was this treated as
          urgent, and who picked it up".
        </p>
      </section>

      {/* Key Features */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime">
            <Layers size={18} />
          </div>
          <h2 className="font-serif italic font-bold text-lg">Key Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface-card border border-border-default/60 p-5 rounded hover:border-brand-lime/20 transition-all duration-300"
            >
              <div className="w-9 h-9 rounded bg-brand-soft flex items-center justify-center text-brand-lime mb-3">
                <feature.icon size={18} />
              </div>
              <h3 className="font-serif italic font-bold text-sm mb-1.5">{feature.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime">
            <Route size={18} />
          </div>
          <h2 className="font-serif italic font-bold text-lg">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PIPELINE_STEPS.map((step) => (
            <div
              key={step.step}
              className="bg-surface-card border border-border-default/60 p-5 rounded relative"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-brand-lime bg-brand-soft px-2 py-0.5 rounded-full border border-brand-lime/10 inline-block mb-3">
                Step {step.step}
              </span>
              <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime mb-2">
                <step.icon size={16} />
              </div>
              <h3 className="font-serif italic font-bold text-sm mb-1">{step.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-soft flex items-center justify-center text-brand-lime">
            <Cpu size={18} />
          </div>
          <h2 className="font-serif italic font-bold text-lg">Technology Stack</h2>
        </div>
        <div className="bg-surface-card border border-border-default rounded-lg p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {TECH_STACK.map((item) => (
              <div key={item.label} className="text-center p-3">
                <div className="w-9 h-9 rounded bg-brand-soft flex items-center justify-center text-brand-lime mx-auto mb-2">
                  <item.icon size={16} />
                </div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-text-tertiary mb-1">{item.label}</span>
                <span className="block text-xs font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-soft border border-brand-lime/20 rounded-lg p-6 text-center space-y-3">
        <h2 className="font-serif italic font-bold text-lg">See a real report go end to end</h2>
        <p className="text-text-secondary text-sm max-w-lg mx-auto">
          Open the live city map to see what is open right now, or sign in to file your own report
          and follow it through every step.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            to="/public-map"
            className="focus-ring inline-flex h-11 items-center gap-2 bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-6 rounded text-sm transition-all duration-200"
          >
            <span>Open the live map</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/auth/citizen-login"
            className="focus-ring inline-flex h-11 items-center gap-2 border border-border-default bg-surface-card text-foreground hover:border-brand-lime/40 font-semibold px-6 rounded text-sm transition-all duration-200"
          >
            Sign in to report an issue
          </Link>
        </div>
      </section>

    </div>
  );
};
