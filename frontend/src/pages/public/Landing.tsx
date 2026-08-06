import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, Activity, Camera, TrendingUp, GitBranch, Eye, Clock, Shield, FileText, ArrowDown,
} from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PipelineSection } from '../../components/pipeline/PipelineSection';
import { HeroSection } from '../../components/ui/HeroSection';

export const Landing: React.FC = () => {
  useDocumentTitle('UrbanPulse AI — AI-Powered Civic Triage');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* ============= HERO ============= */}
      <HeroSection />

      {/* ============= WHY EXISTING SYSTEMS FAIL (narrative contrast) ============= */}
      <section className="relative py-28 px-6 border-t border-border-default overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-lime/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-lime mb-4 block">Why Existing Systems Fail</span>
            <h2 className="text-3xl sm:text-4xl font-serif italic font-bold leading-tight mb-12">
              One Street.{' '}
              <span className="text-text-tertiary">Two Different Outcomes.</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left — Without visibility */}
              <div className="bg-surface-card border border-border-default rounded-xl p-6 opacity-60">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-text-quaternary block mb-6">Without visibility</span>
                <div className="space-y-5">
                  {[
                    { time: '8:43 AM', label: 'Resident reports streetlight' },
                    { label: 'Ticket created' },
                    { label: 'Forwarded' },
                    { label: 'Forwarded again' },
                    { label: 'No updates received' },
                    { time: '11 days', label: 'Still broken.' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-border-default flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-text-quaternary" />
                      </div>
                      <div className="min-w-0">
                        {step.time && (
                          <span className="text-[10px] font-mono text-text-quaternary block leading-none mb-0.5">{step.time}</span>
                        )}
                        <span className="text-xs font-mono text-text-tertiary">{step.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — With UrbanPulse */}
              <div className="bg-surface-card border border-brand-lime/30 rounded-xl p-6 shadow-lg shadow-brand-lime/5">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-brand-lime block mb-6">With UrbanPulse</span>
                <div className="space-y-5">
                  {[
                    { time: '8:43 AM', label: 'Resident reports streetlight' },
                    { label: 'Damage confirmed' },
                    { label: 'Priority calculated' },
                    { label: 'Officer assigned' },
                    { label: 'Repair completed' },
                    { label: 'Citizen notified' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-lime text-background flex items-center justify-center shrink-0">
                        <CheckCircle2 size={10} />
                      </div>
                      <div className="min-w-0">
                        {step.time && (
                          <span className="text-[10px] font-mono text-brand-lime/60 block leading-none mb-0.5">{step.time}</span>
                        )}
                        <span className="text-xs font-mono text-foreground">{step.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-border-default flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-brand-lime" />
                  <span className="text-xs font-mono text-brand-lime font-medium">2h 31m · Resolved</span>
                </div>
              </div>
            </div>

            {/* Emotional coda */}
            <div className="mt-12 text-center">
              <p className="text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
                They didn't need another ticket number.{' '}
                <span className="text-foreground font-medium">They needed someone to fix it.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <PipelineSection />

      {/* ============= WHY NINE SPECIALISTS? — story flow ============= */}
      <section className="relative py-28 px-6 border-t border-border-default overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-lime/[0.01] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-lime mb-4 block">Why Nine Specialists?</span>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-serif italic font-bold leading-tight mb-3">
                One AI can summarize.{' '}
                <span className="text-text-tertiary">Nine specialists can solve.</span>
              </h2>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-14">
              {[
                { icon: Camera, title: 'Vision', quote: '"I found a pothole."', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                { icon: TrendingUp, title: 'Priority', quote: '"This affects a school road."', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                { icon: GitBranch, title: 'Routing', quote: '"Roads Department."', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                { icon: CheckCircle2, title: 'Verification', quote: '"Repair confirmed."', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              ].map((s, i) => (
                <React.Fragment key={s.title}>
                  {i > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="hidden md:block shrink-0"
                    >
                      <ArrowDown size={16} className="text-text-quaternary rotate-[-90deg]" />
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className={`${s.bg} ${s.border} border rounded-xl p-5 text-center flex-1 w-full md:w-auto min-w-0`}
                  >
                    <div className={`w-11 h-11 rounded-full ${s.bg} ${s.border} border flex items-center justify-center mx-auto mb-3`}>
                      <s.icon size={20} className={s.color} />
                    </div>
                    <h3 className={`text-sm font-semibold ${s.color} mb-1`}>{s.title}</h3>
                    <p className="text-xs font-medium text-text-secondary leading-snug">{s.quote}</p>
                  </motion.div>
                </React.Fragment>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-sm text-text-secondary leading-relaxed max-w-2xl mx-auto text-center mt-12"
            >
              Every specialist owns one decision. One doesn't do everything.{' '}
              <span className="text-foreground font-medium">But together, they run a city.</span>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ============= TODAY'S CITY ============= */}
      <section className="relative py-28 px-6 border-t border-border-default overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-lime/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row items-center justify-between gap-12"
          >
            <div className="flex-1 max-w-lg">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-lime mb-4 block">Today's City</span>
              <h2 className="text-3xl sm:text-4xl font-serif italic font-bold leading-tight mb-6">
                What changed across{' '}
                <span className="text-brand-lime">your city today?</span>
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                Municipal workers resolve thousands of issues every day — potholes, broken
                streetlights, illegal dumping, water leaks. UrbanPulse captures every one.
              </p>
              <Link
                to="/public-map"
                className="group inline-flex items-center gap-2 text-sm font-medium text-brand-lime hover:brightness-110 transition-all focus-ring rounded"
              >
                View live city map
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="flex-1 w-full max-w-md">
              <div className="bg-surface-card border border-border-default rounded-xl p-6 shadow-lg shadow-black/10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Today's Snapshot</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-text-quaternary">Example data · demo</span>
                    <Activity size={14} className="text-brand-lime" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '412', label: 'Reports today', sub: 'Across all wards' },
                    { value: '389', label: 'Resolved', sub: '94% completion rate' },
                    { value: '2h 14m', label: 'Avg response', sub: 'From report to dispatch' },
                    { value: '47m', label: 'Avg repair', sub: 'From dispatch to done' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="bg-surface-muted border border-border-default rounded-lg p-3.5"
                    >
                      <div className="text-lg sm:text-xl font-semibold font-mono text-foreground leading-tight">{stat.value}</div>
                      <div className="text-[11px] font-medium text-text-tertiary mt-0.5">{stat.label}</div>
                      <div className="text-[9px] text-text-quaternary mt-0.5">{stat.sub}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border-default space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-tertiary">Fastest department</span>
                    <span className="text-foreground font-medium">Roads</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-tertiary">Most improved ward</span>
                    <span className="text-foreground font-medium">Ward 12</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============= TRUST / ACCOUNTABILITY ============= */}
      <section className="relative py-28 px-6 border-t border-border-default overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-lime/[0.005] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-lime mb-4 block">Built for Trust</span>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-serif italic font-bold leading-tight mb-3">
                Every decision.{' '}
                <span className="text-text-tertiary">Explained.</span>
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-12 max-w-xl mx-auto">
                AI is a tool, not a black box. Every recommendation comes with a reason. Every decision leaves a trace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { icon: Eye, title: 'Explainable', desc: 'Every AI decision shows its reasoning and confidence. No black boxes.' },
                { icon: FileText, title: 'Transparent', desc: 'Every ticket logs who decided what, when, and why — including overrides.' },
                { icon: Clock, title: 'Auditable', desc: 'Every action has a timestamp. Every change has an owner.' },
                { icon: Shield, title: 'Accountable', desc: 'If an officer overrides a recommendation, that decision is preserved.' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-surface-card border border-border-default rounded-xl p-5 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-lime/[0.08] border border-brand-lime/[0.15] flex items-center justify-center mb-3">
                      <Icon size={16} className="text-brand-lime" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{s.title}</h3>
                    <p className="text-xs text-text-tertiary leading-relaxed">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm text-text-secondary leading-relaxed max-w-2xl mx-auto text-center mt-12 border-t border-border-default pt-8"
            >
              Every recommendation can be challenged.{' '}
              <span className="text-foreground font-medium">Every override is recorded.</span>{' '}
              Every decision can be audited.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ============= CTA SECTION ============= */}
      <section className="relative py-28 px-6 border-t border-border-default overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-lime/8 rounded-full blur-[200px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl sm:text-5xl font-serif italic font-bold leading-tight mb-6 text-balance">
              See how your city{' '}
              <span className="text-brand-lime">would respond</span>
            </h2>
            <p className="text-text-secondary text-sm max-w-lg mx-auto mb-10 leading-relaxed">
              Watch one complaint travel from a citizen&apos;s phone to a repair crew — verified, routed, and resolved in under three hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/trace"
                className="group relative inline-flex items-center justify-center gap-2 bg-brand-lime text-background font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-brand-lime/20"
              >
                Watch a Live Demo
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                <div className="absolute inset-0 rounded-xl glow-lime opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 bg-surface-card border border-border-default hover:border-brand-lime/30 text-text-primary hover:text-foreground font-medium px-8 py-3.5 rounded-xl transition-all duration-200"
              >
                Request a Pilot
              </Link>
            </div>
            <p className="text-[10px] text-text-quaternary mt-4">No sign-up required to explore</p>
          </motion.div>
        </div>
      </section>

      {/* ============= FOOTER ============= */}
      <footer className="border-t border-border-default py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded bg-brand-lime flex items-center justify-center text-background font-bold text-sm shadow-lg shadow-brand-lime/20">U</div>
                <span className="font-serif italic font-bold text-sm">UrbanPulse <span className="text-brand-lime">AI</span></span>
              </div>
              <p className="text-[10px] text-text-tertiary leading-relaxed max-w-[180px]">
                AI-powered civic infrastructure triage and routing for Indian municipalities.
              </p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-text-tertiary block mb-3">Platform</span>
              <div className="space-y-2">
                <Link to="/public-map" className="block text-xs text-text-secondary hover:text-foreground transition-colors focus-ring rounded">City Pulse Map</Link>
                <Link to="/about" className="block text-xs text-text-secondary hover:text-foreground transition-colors focus-ring rounded">About the Pilot</Link>
                <Link to="/trace" className="block text-xs text-text-secondary hover:text-foreground transition-colors focus-ring rounded">Live Agent Trace</Link>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-text-tertiary block mb-3">Citizens</span>
              <div className="space-y-2">
                <Link to="/auth/citizen-login" className="block text-xs text-text-secondary hover:text-foreground transition-colors focus-ring rounded">Report an Issue</Link>
                <Link to="/auth/citizen-login" className="block text-xs text-text-secondary hover:text-foreground transition-colors focus-ring rounded">Track My Report</Link>
                <Link to="/auth/citizen-login" className="block text-xs text-text-secondary hover:text-foreground transition-colors focus-ring rounded">Citizen Login</Link>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-text-tertiary block mb-3">Staff</span>
              <div className="space-y-2">
                <Link to="/auth/staff-login" className="block text-xs text-text-secondary hover:text-foreground transition-colors focus-ring rounded">Staff Login</Link>
                <Link to="/auth/staff-register" className="block text-xs text-text-secondary hover:text-foreground transition-colors focus-ring rounded">Staff Registration</Link>
                <Link to="/support" className="block text-xs text-text-secondary hover:text-foreground transition-colors focus-ring rounded">Support</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border-default pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-text-quaternary">
            <div>© {new Date().getFullYear()} UrbanPulse AI. Indian Municipal Pilot.</div>
          </div>
        </div>
      </footer>

    </div>
  );
};
