import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle2, AlertCircle, Sparkles, Activity } from 'lucide-react';
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

export const ProcessingPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ticketId) return;

    const es = new EventSource(apiUrl(`/api/tickets/${ticketId}/process`));

    es.onmessage = (event) => {
      try {
        const data: AgentStep = JSON.parse(event.data);

        if (data.status === 'done') {
          setDone(true);
          es.close();
          return;
        }

        if (data.status === 'error') {
          setError(data.reasoning);
          es.close();
          return;
        }

        setSteps(prev => [...prev, data]);
      } catch {
        setParseErrors(prev => prev + 1);
      }
    };

    es.onerror = () => {
      setError('Connection to pipeline lost. Make sure the backend is running on port 8000.');
      es.close();
    };

    return () => es.close();
  }, [ticketId]);

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => {
        navigate(`/citizen/report/${ticketId}`);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [done, navigate, ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen text-foreground font-sans space-y-6">

      <div className="border-b border-panel-border pb-6">
        <div className="flex items-center gap-2 text-brand-lime mb-1">
          <Sparkles size={18} className={done ? '' : 'animate-pulse'} />
          <h1 className="text-xl font-serif italic font-bold">
            {done ? 'AI Pipeline Complete' : 'Processing Your Report...'}
          </h1>
        </div>
        <p className="text-gray-500 text-xs">
          {done
            ? 'Redirecting to ticket detail...'
            : `Running 8-agent LangGraph pipeline for ticket ${ticketId?.slice(0, 8)}...`}
        </p>
      </div>

      <div className="bg-panel-card border border-panel-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-panel-border bg-panel-bg">
          <Activity size={14} className={`${!done ? 'text-brand-lime animate-pulse' : 'text-green-400'}`} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
            {done ? 'Pipeline Complete' : error ? 'Error' : 'Processing...'}
          </span>
          <span className="ml-auto font-mono text-[10px] text-gray-600">
            {steps.length} agent{steps.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
          {steps.map((step, i) => (
            <div key={`step-${i}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-brand-soft border border-brand-lime/20 flex items-center justify-center text-base shrink-0">
                  {AGENT_ICONS[step.agent] || '🤖'}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-panel-border/60 mt-2" />
                )}
              </div>
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

          {!done && !error && (
            <div className="flex items-center gap-3 text-gray-400 py-2">
              <Loader size={16} className="animate-spin text-brand-lime" />
              <span className="text-xs font-mono">AI agents analyzing your report...</span>
              {parseErrors > 0 && (
                <span className="text-[9px] text-yellow-500 font-mono ml-auto">{parseErrors} parse warnings</span>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {done && (
        <div className="bg-brand-soft border border-brand-lime/20 rounded-lg p-5 text-center space-y-2">
          <CheckCircle2 size={24} className="text-brand-lime mx-auto" />
          <p className="text-sm font-serif italic text-brand-lime font-bold">Report Processed Successfully!</p>
          <p className="text-xs text-gray-400">Redirecting to ticket detail...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-5 text-center space-y-3">
          <AlertCircle size={24} className="text-red-400 mx-auto" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => navigate(`/citizen/report/${ticketId}`)}
            className="bg-panel-card border border-panel-border text-gray-300 hover:text-foreground px-5 py-2 rounded text-xs"
          >
            View Report Anyway
          </button>
        </div>
      )}
    </div>
  );
};
