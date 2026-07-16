import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Activity, Map, AlertTriangle, CheckCircle2, Languages } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-lime selection:text-background overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-lime/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Realtime UHS Badge */}
        <div className="inline-flex items-center space-x-2 bg-brand-soft border border-brand-lime/20 px-3.5 py-1.5 rounded-full mb-8 animate-fade-in">
          <Activity size={14} className="text-brand-lime animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider text-brand-lime">
            Live City UHS: <span className="font-bold">78.4 / 100</span>
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif italic font-bold tracking-tight max-w-4xl mb-6 leading-[1.15]">
          AI-Powered <span className="text-brand-lime">Civic Infrastructure</span> Triage & Routing
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mb-10 leading-relaxed">
          UrbanPulse AI is a pilot-ready civic reporting platform. Report potholes, broken signage, waste overflows, or water leaks in any language. Watch 9 specialized AI agents process and route your complaint in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/auth/citizen-login"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-8 py-3.5 rounded transition-all duration-200"
          >
            <span>Report an Issue</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/public-map"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-panel-card border border-panel-border hover:border-brand-lime/30 text-gray-200 hover:text-white font-medium px-8 py-3.5 rounded transition-all duration-200"
          >
            <Map size={16} />
            <span>View City Pulse Map</span>
          </Link>
        </div>
      </section>

      {/* Pipeline Visual Feature Section */}
      <section className="py-20 border-t border-panel-border bg-panel-bg/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif italic font-bold mb-4">
              A Nine-Agent Orchestrated System
            </h2>
            <p className="text-gray-400 text-sm">
              We replace black-box municipality complaint forms with an interactive multi-agent pipeline providing complete visibility to citizens and officers alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-panel-card border border-panel-border/60 p-6 rounded hover:border-brand-lime/20 transition-all duration-300">
              <div className="w-10 h-10 rounded bg-brand-soft flex items-center justify-center text-brand-lime mb-4">
                <Languages size={20} />
              </div>
              <h3 className="font-serif italic font-bold text-lg mb-2">Multilingual Intake</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Ingest reports via web app or WhatsApp, supporting voice recordings and photos in local regional dialects.
              </p>
            </div>

            <div className="bg-panel-card border border-panel-border/60 p-6 rounded hover:border-brand-lime/20 transition-all duration-300">
              <div className="w-10 h-10 rounded bg-brand-soft flex items-center justify-center text-brand-lime mb-4">
                <Shield size={20} />
              </div>
              <h3 className="font-serif italic font-bold text-lg mb-2">Spam & Duplicate Filter</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                LangGraph agents cross-verify image features and geo-coordinates to identify spammers and cluster duplicates automatically.
              </p>
            </div>

            <div className="bg-panel-card border border-panel-border/60 p-6 rounded hover:border-brand-lime/20 transition-all duration-300">
              <div className="w-10 h-10 rounded bg-brand-soft flex items-center justify-center text-brand-lime mb-4">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-serif italic font-bold text-lg mb-2">Priority Calculation</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Calculates severity based on proximity to vital infrastructure, hospital corridors, and public schools.
              </p>
            </div>

            <div className="bg-panel-card border border-panel-border/60 p-6 rounded hover:border-brand-lime/20 transition-all duration-300">
              <div className="w-10 h-10 rounded bg-brand-soft flex items-center justify-center text-brand-lime mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-serif italic font-bold text-lg mb-2">Auto Verification</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Upon officer closure, a verification agent verifies photo comparisons to confirm resolution before ticket close.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Ticker */}
      <footer className="border-t border-panel-border py-8 text-center bg-background">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
          <div>© {new Date().getFullYear()} UrbanPulse AI. Indian Municipal Pilot.</div>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-foreground">About Pilot</Link>
            <Link to="/auth/staff-login" className="hover:text-foreground">Staff Login</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
