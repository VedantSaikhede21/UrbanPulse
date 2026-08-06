import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import {
  Shield, Activity, Map, AlertTriangle, CheckCircle2, Languages, Cpu,
  Workflow, Layers, Server, Database, BrainCircuit, Route, Clock, BarChart3, ArrowRight
} from 'lucide-react';

const FEATURES = [
  {
    icon: Languages,
    title: 'Multilingual Intake',
    description: 'Citizens report issues via web or WhatsApp in any regional language. Voice notes, photos, and videos are accepted and processed by Gemini AI.',
  },
  {
    icon: Shield,
    title: 'Spam & Duplicate Detection',
    description: 'A dedicated LangGraph agent cross-verifies image features, geo-coordinates, and report fingerprints to eliminate duplicates and flag spam.',
  },
  {
    icon: AlertTriangle,
    title: 'Priority Calculation',
    description: 'Severity is computed based on proximity to hospitals, schools, and critical infrastructure. High-priority issues are fast-tracked automatically.',
  },
  {
    icon: Route,
    title: 'Intelligent Routing',
    description: 'Issues are routed to the correct municipal department and the nearest available field officer based on ward boundaries and workload.',
  },
  {
    icon: Activity,
    title: 'Real-Time SLA Monitoring',
    description: 'Every ticket has a live SLA timer. Escalation agents trigger alerts when response or resolution thresholds are at risk of being missed.',
  },
  {
    icon: Map,
    title: 'Ward Health Scoring',
    description: 'Each ward receives a dynamic Urban Health Score (UHS) based on resolved vs pending issues, response times, and citizen satisfaction.',
  },
  {
    icon: CheckCircle2,
    title: 'Auto Verification',
    description: 'When an officer marks a ticket resolved, a verification agent compares before/after photos to confirm the fix before the ticket is closed.',
  },
  {
    icon: BarChart3,
    title: 'City Analytics',
    description: 'Department heads and city administrators get real-time dashboards with trends, heatmaps, officer performance metrics, and bottleneck alerts.',
  },
];

const PIPELINE_STEPS = [
  { icon: Languages, step: '01', title: 'Citizen Reports', description: 'Issue submitted via web app or WhatsApp with photo, location, and voice description in any language.' },
  { icon: BrainCircuit, step: '02', title: 'AI Analysis', description: 'Gemini 2.5 Flash classifies the issue, extracts details, and assigns preliminary metadata.' },
  { icon: Shield, step: '03', title: 'Trust & Dedup', description: 'Fraud detection and deduplication agents verify authenticity and merge duplicate reports.' },
  { icon: AlertTriangle, step: '04', title: 'Priority Scoring', description: 'Severity score calculated using infrastructure proximity, citizen reputation, and historical data.' },
  { icon: Route, step: '05', title: 'Officer Dispatch', description: 'Ticket is routed to the correct department and assigned to the nearest available field officer.' },
  { icon: Clock, step: '06', title: 'Resolution & Verify', description: 'Officer resolves the issue, uploads proof, and the verification agent confirms closure automatically.' },
];

const TECH_STACK = [
  { icon: Server, label: 'Backend', value: 'FastAPI + LangGraph' },
  { icon: BrainCircuit, label: 'AI Model', value: 'Gemini 2.5 Flash' },
  { icon: Layers, label: 'Frontend', value: 'React + Tailwind CSS' },
  { icon: Database, label: 'Database', value: 'Supabase (PostgreSQL)' },
  { icon: Map, label: 'Maps', value: 'Leaflet + OpenStreetMap' },
  { icon: Cpu, label: 'Orchestration', value: '9-Agent LangGraph Pipeline' },
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
        <p className="text-text-secondary text-xs max-w-2xl">
          An open, AI-powered civic infrastructure triage platform built for Indian municipalities. 
          UrbanPulse replaces opaque government complaint portals with a transparent, multi-agent pipeline 
          that gives citizens and officers complete visibility into every step of the resolution process.
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
          UrbanPulse is a pilot-ready civic technology platform that uses a 9-agent AI pipeline to 
          triage, route, and track civic infrastructure complaints. Citizens can report issues — from 
          potholes to water leaks to broken streetlights — in any language using the web app or 
          WhatsApp. Behind the scenes, specialized LangGraph agents analyze, deduplicate, prioritize, 
          route, and verify each report, while keeping every stakeholder informed in real time.
        </p>
        <p className="text-text-secondary text-sm leading-relaxed">
          The platform provides dynamic Ward Health Scores (UHS), live SLA monitoring, geospatial 
          incident mapping, and per-department analytics. It is designed to reduce resolution times, 
          eliminate paperwork, and bring transparency to civic governance.
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
        <h2 className="font-serif italic font-bold text-lg">Ready to report an issue?</h2>
        <p className="text-text-secondary text-sm max-w-lg mx-auto">
          Use the platform to submit a civic issue and watch the AI pipeline process it in real time.
        </p>
        <Link
          to="/auth/citizen-login"
          className="focus-ring inline-flex items-center gap-2 bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-6 py-2.5 rounded text-sm transition-all duration-200"
        >
          <span>Report an Issue</span>
          <ArrowRight size={14} />
        </Link>
      </section>

    </div>
  );
};
