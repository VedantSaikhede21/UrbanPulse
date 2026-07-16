import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, Sparkles, CheckCircle2, AlertCircle, Loader, Play } from 'lucide-react';
import { apiUrl } from '../../lib/api';

interface AgentStep {
  agent: string;
  action: string;
  reasoning: string;
  node: string;
  status: 'running' | 'done' | 'error';
  result?: Record<string, unknown>;
}

const AGENT_ICONS: Record<string, string> = {
  'CX Agent': '🌐',
  'Vision Agent': '👁️',
  'Trust & Fraud Agent': '🛡️',
  'Deduplication Agent': '🔍',
  'Priority Agent': '⚡',
  'Routing Agent': '🗺️',
  'Escalation Agent': '⏰',
  'Verification Agent': '✅',
  'Analytics Agent': '📊',
  'Pipeline': '🤖',
};

export const LiveAgentTrace: React.FC = () => {
  const { ticketId: routeTicketId } = useParams<{ ticketId?: string }>();
  const [ticketId, setTicketId] = useState(routeTicketId || '');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<Record<string, unknown> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  // Auto-scroll as steps arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  function startTrace() {
    if (!ticketId.trim()) return;
    setSteps([]);
    setDone(false);
    setError(null);
    setFinalResult(null);
    setRunning(true);

    // Close any existing connection
    esRef.current?.close();

    const es = new EventSource(apiUrl(`/api/tickets/${ticketId.trim()}/process`));
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const data: AgentStep = JSON.parse(event.data);

        if (data.status === 'done') {
          setDone(true);
          setRunning(false);
          if (data.result) setFinalResult(data.result);
          es.close();
          return;
        }

        if (data.status === 'error') {
          setError(data.reasoning);
          setRunning(false);
          es.close();
          return;
        }

        setSteps(prev => [...prev, data]);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setError('Connection to pipeline lost. Make sure the backend is running on port 8000.');
      setRunning(false);
      es.close();
    };
  }

  function stopTrace() {
    esRef.current?.close();
    setRunning(false);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen font-sans text-foreground space-y-6">

      {/* Header */}
      <div className="border-b border-panel-border pb-6">
        <div className="flex items-center gap-2 text-brand-lime mb-1">
          <Sparkles size={18} className="animate-pulse" />
          <h1 className="text-xl font-serif italic font-bold">Live Agent Trace Console</h1>
        </div>
        <p className="text-gray-500 text-xs">
          Enter a Ticket ID to watch the 9-agent LangGraph pipeline process it in real time using Gemini 2.5 Flash.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Paste a Ticket UUID (from /citizen/dashboard)..."
          value={ticketId}
          onChange={e => setTicketId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !running && startTrace()}
          className="flex-1 bg-panel-card border border-panel-border rounded px-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-brand-lime"
        />
        {!running ? (
          <button
            onClick={startTrace}
            disabled={!ticketId.trim()}
            className="flex items-center gap-2 bg-brand-lime text-background hover:bg-brand-lime-hover disabled:bg-gray-800 disabled:text-gray-500 font-semibold px-5 py-2.5 rounded text-xs transition-colors"
          >
            <Play size={14} />
            Run Pipeline
          </button>
        ) : (
          <button
            onClick={stopTrace}
            className="flex items-center gap-2 bg-red-900/40 border border-red-800/50 text-red-400 hover:bg-red-900/60 font-semibold px-5 py-2.5 rounded text-xs transition-colors"
          >
            Stop
          </button>
        )}
      </div>

      {/* Pipeline Feed */}
      {(steps.length > 0 || running) && (
        <div className="bg-panel-card border border-panel-border rounded-lg overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-panel-border bg-panel-bg">
            <Activity size={14} className={`${running ? 'text-brand-lime animate-pulse' : 'text-gray-400'}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
              {running ? 'Pipeline Running...' : done ? 'Pipeline Complete' : 'Stopped'}
            </span>
            <span className="ml-auto font-mono text-[10px] text-gray-600">
              {steps.length} / 9 agents
            </span>
          </div>

          {/* Steps */}
          <div className="p-5 space-y-4 max-h-[480px] overflow-y-auto">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 animate-fade-in">
                {/* Icon column */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-brand-soft border border-brand-lime/20 flex items-center justify-center text-base shrink-0">
                    {AGENT_ICONS[step.agent] || '🤖'}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-panel-border/60 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-100">{step.agent}</span>
                    <span className="text-[10px] font-mono text-brand-lime bg-brand-soft px-2 py-0.5 rounded-full border border-brand-lime/10">
                      {step.action}
                    </span>
                    <CheckCircle2 size={12} className="text-brand-lime ml-auto shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{step.reasoning}</p>
                </div>
              </div>
            ))}

            {/* Running spinner */}
            {running && (
              <div className="flex items-center gap-3 text-gray-400 py-2">
                <Loader size={16} className="animate-spin text-brand-lime" />
                <span className="text-xs font-mono">Waiting for next agent...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Final Result Card */}
      {done && finalResult && (
        <div className="bg-brand-soft border border-brand-lime/20 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-lime">
            <CheckCircle2 size={18} />
            <span className="font-serif italic font-bold text-base">Pipeline Complete — Results Written to Supabase</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {[
              { label: 'Category', value: finalResult.category as string },
              { label: 'Severity', value: finalResult.severity as string },
              { label: 'Priority', value: `Level ${finalResult.priority_score}` },
              { label: 'Status', value: finalResult.status as string },
            ].map(item => (
              <div key={item.label} className="bg-panel-bg border border-panel-border rounded p-3">
                <span className="text-gray-500 block text-[10px] mb-0.5">{item.label}</span>
                <span className="text-white font-semibold capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400 text-xs leading-relaxed">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {steps.length === 0 && !running && !error && (
        <div className="border border-dashed border-panel-border/60 rounded-lg py-16 text-center text-gray-500">
          <Sparkles className="mx-auto mb-3 text-gray-700" size={28} />
          <p className="text-sm font-serif italic">Enter a ticket ID above to launch the AI pipeline</p>
          <p className="text-[11px] mt-1 text-gray-600 font-mono">Copy any UUID from the Citizen Dashboard</p>
        </div>
      )}
    </div>
  );
};
