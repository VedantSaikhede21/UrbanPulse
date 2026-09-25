import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, Camera, Search, Wrench, CheckCircle2, Bell, Clock, Zap } from 'lucide-react';

const beforeStages = [
  { id: 'submitted', label: 'Submitted', time: '9:14 AM' },
  { id: 'waiting', label: 'Waiting...', time: '', isWaiting: true },
];

/**
 * `evidence` was previously only reachable through a mouse-only tooltip, so it
 * was invisible to keyboard users and to anyone on a touch device. Each stage
 * now carries the copy and reveals it on hover, focus, tap, or Enter/Space.
 */
const pipelineStages = [
  { id: 'connected', label: 'UrbanPulse Connected', time: '9:15 AM', icon: Search, evidence: 'Fast-tracked · Priority: 1' },
  { id: 'analyzed', label: 'AI Identified', time: '9:16 AM', icon: Camera, evidence: 'Location: Sector 17, Navi Mumbai' },
  { id: 'assigned', label: 'Assigned to Department', time: '9:22 AM', icon: Wrench, evidence: 'Officer: Roads Dept, Navi Mumbai' },
  { id: 'fixed', label: 'Repaired', time: '11:47 AM', icon: Wrench, isClimax: true, evidence: 'Repair photo uploaded' },
  { id: 'verified', label: 'Verified', time: '11:49 AM', icon: CheckCircle2, evidence: 'Before/after match confirmed' },
  { id: 'notified', label: 'Citizen Notified', time: '11:51 AM', icon: Bell, evidence: 'SMS sent · Citizen confirmed' },
];

const allStages = [...beforeStages, ...pipelineStages];

/** Cadence of the hero pipeline demo. Tuned so a full cycle lands near 6s:
 * long enough to read each stage, short enough that a looping card never feels
 * like it is waiting on something. */
const STEP_MS = 550;
const SETTLE_MS = 700;
const HOLD_MS = 3000;

const ticketVariants = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  enter: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.25 } },
};

const checkPath = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

function PotholeSVG({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="0" y="40" width="120" height="4" rx="2" fill="#4b5563" />
      <rect x="0" y="48" width="120" height="4" rx="2" fill="#4b5563" />
      <ellipse cx="60" cy="44" rx="14" ry="6" fill="#1f2937" />
      <path d="M 46 44 Q 60 38 74 44" stroke="#6b7280" strokeWidth="1.5" fill="none" />
      <text x="60" y="72" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="ui-monospace, monospace">{label}</text>
    </svg>
  );
}

function RepairedSVG({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="0" y="40" width="120" height="4" rx="2" fill="#6b7280" />
      <rect x="0" y="48" width="120" height="4" rx="2" fill="#6b7280" />
      <rect x="46" y="38" width="28" height="16" rx="3" fill="#4b5563" stroke="#6b7280" strokeWidth="0.5" />
      <text x="60" y="72" textAnchor="middle" fill="#d1d5db" fontSize="8" fontFamily="ui-monospace, monospace">{label}</text>
    </svg>
  );
}

function formatDate() {
  const d = new Date();
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runIdRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const [totalScroll, setTotalScroll] = useState(0);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setTotalScroll(document.documentElement.scrollHeight - window.innerHeight);
    const handler = () => setTotalScroll(document.documentElement.scrollHeight - window.innerHeight);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const runPipeline = (loop = false) => {
    clearTimers();
    // A run id invalidates callbacks queued by a previous run, so pressing
    // Replay mid-sequence cannot have the old timers keep writing state.
    const runId = ++runIdRef.current;
    const alive = () => runIdRef.current === runId;

    setActiveIdx(-1);
    setIsConnected(false);
    setIsComplete(false);
    setShowBeforeAfter(false);

    if (prefersReducedMotion) {
      setActiveIdx(allStages.length - 1);
      setIsConnected(true);
      setIsComplete(true);
      setShowBeforeAfter(true);
      return;
    }

    allStages.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => {
        if (!alive()) return;
        setActiveIdx(i);
        if (i === beforeStages.length) {
          setIsConnected(true);
        }
        if (i === allStages.length - 1) {
          timersRef.current.push(setTimeout(() => {
            if (!alive()) return;
            setIsComplete(true);
            setShowBeforeAfter(true);
          }, SETTLE_MS));
        }
      }, i * STEP_MS));
    });

    if (loop) {
      const cycle = allStages.length * STEP_MS + SETTLE_MS + HOLD_MS;
      timersRef.current.push(setTimeout(() => {
        if (alive()) runPipeline(true);
      }, cycle));
    }
  };

  // The hero card is the landing page's only motion. It used to run once and
  // then sit frozen at the finished state, so anyone who arrived after the
  // ~4s sequence, or scrolled back up, saw a static card and read the page as
  // broken. Repeating it keeps the demo alive on a screen left open.
  useEffect(() => {
    runPipeline(true);
    return () => {
      runIdRef.current++;
      clearTimers();
    };
  }, [prefersReducedMotion]);

  const pageScroll = useScroll();
  // Scroll-linked fade/scale is motion too: when the user has asked for reduced
  // motion the hero must stay fully opaque and un-scaled.
  const heroOpacity = useTransform(pageScroll.scrollYProgress, [0, 0.15], [1, prefersReducedMotion ? 1 : 0]);
  const heroScale = useTransform(pageScroll.scrollYProgress, [0, 0.15], [1, prefersReducedMotion ? 1 : 0.95]);
  const heroHeight = heroRef.current?.offsetHeight || window.innerHeight * 0.9;
  const scrollProgress = useTransform(pageScroll.scrollY, [heroHeight, totalScroll || 1], [0, 1]);

  const isInBefore = activeIdx >= 0 && activeIdx < beforeStages.length;
  const pipelineStartIdx = beforeStages.length;
  const pipelineActiveIdx = activeIdx >= pipelineStartIdx ? activeIdx - pipelineStartIdx : -1;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-brand-lime z-50 origin-left"
        style={{ scaleX: scrollProgress }}
      />

      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center w-full">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 bg-surface-card border border-border-default/50 px-4 py-2 rounded-full mb-8"
          >
            <span className="relative flex h-2 w-2">
              {!prefersReducedMotion && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-lime opacity-75" />
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-lime" />
            </span>
            <span className="font-mono text-xs text-foreground">Live civic issue resolution · Navi Mumbai</span>
          </motion.div>

          {/* Headline — no serif */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl mb-4 text-balance"
          >
            From complaint{' '}
            <span className="relative inline-block">
              <span className="text-brand-lime">to resolution.</span>
              <span className="absolute -bottom-1.5 left-0 right-0 h-1 bg-brand-lime/25 rounded-full blur-sm" />
            </span>
            <br />
            Every step visible.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-text-secondary text-sm sm:text-base max-w-lg mb-8 leading-relaxed"
          >
            You reported it. Watch it get resolved.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-14"
          >
            <Link
              to="/public-map"
              className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-brand-lime text-background font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-brand-lime/20 text-sm"
            >
              <span>See the live city map</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-xl glow-lime opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              to="/auth/citizen-login"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-surface-card border border-border-default hover:border-brand-lime/30 text-text-primary hover:text-foreground font-medium px-7 py-3 rounded-xl transition-all duration-200 text-sm"
            >
              <span>Report an Issue</span>
            </Link>
          </motion.div>

          {/* Complaint Journey */}
          <div className="w-full max-w-3xl relative">
            <div className={`bg-surface-card border rounded-xl p-6 shadow-xl shadow-black/10 transition-colors duration-700 ${
              isConnected ? 'border-brand-lime/20' : 'border-border-default'
            }`}>
              {/* Header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Camera size={13} className="text-text-tertiary" />
                  <span className="text-xs font-medium text-foreground">Active Complaint · Ward 12, Navi Mumbai</span>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <AnimatePresence>
                    {isConnected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full px-2 py-0.5"
                      >
                        <Zap size={10} className="text-brand-lime" aria-hidden="true" />
                        <span className="text-[10px] font-mono text-brand-lime font-medium">Connected</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-[10px] font-mono text-text-quaternary">{formatDate()}</span>
                  {isComplete && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => runPipeline()}
                      aria-label="Replay the resolution journey"
                      className="-my-2 inline-flex h-11 items-center rounded-md px-2 text-[11px] font-mono text-brand-lime underline transition-colors hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                    >
                      Replay
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Track line */}
                <div className="absolute top-3 left-6 right-6 h-0.5 bg-border-default">
                  <motion.div
                    className="h-full"
                    initial={{ width: '0%' }}
                    animate={{
                      width: activeIdx >= 0 ? `${((activeIdx + 1) / allStages.length) * 100}%` : '0%',
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      background: isConnected
                        ? 'linear-gradient(90deg, rgb(75,75,75), #a3e635)'
                        : 'rgb(75, 75, 75)',
                    }}
                  />
                </div>

                {/* Stages — before (gray) */}
                <div className="flex relative mb-3">
                  {beforeStages.map((stage, i) => {
                    const isActive = i <= activeIdx;
                    const isCurrent = i === activeIdx;

                    return (
                      <div
                        key={stage.id}
                        className="flex flex-col items-center relative cursor-default"
                        style={{ width: `${(100 / allStages.length) * beforeStages.length}%` }}
                      >
                        <div className={`relative z-10 w-3 h-3 rounded-full transition-all duration-500 ${
                          isActive ? 'bg-text-quaternary' : 'bg-border-default'
                        } ${isCurrent ? 'ring-2 ring-text-quaternary ring-offset-2 ring-offset-surface-card' : ''}`}>
                          {isCurrent && stage.isWaiting && !prefersReducedMotion && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-text-quaternary/30" />
                          )}
                        </div>
                        <div className={`text-[10px] font-medium mt-2 transition-colors ${
                          isActive ? 'text-text-quaternary' : 'text-border-default'
                        }`}>
                          {stage.label}
                        </div>
                      </div>
                    );
                  })}

                  {/* UrbanPulse activates */}
                  <div className="absolute left-[25%] -right-[75%] top-0 flex items-center justify-center h-3">
                    {isConnected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-5 h-5 rounded-full bg-brand-lime flex items-center justify-center z-20"
                      >
                        <motion.svg
                          width="10" height="10" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="3"
                          strokeLinecap="round" strokeLinejoin="round"
                          className="text-background"
                        >
                          <motion.path
                            d="M20 6L9 17l-5-5"
                            variants={checkPath}
                            initial="hidden"
                            animate="visible"
                          />
                        </motion.svg>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Pipeline stages (bright) */}
                <div className="flex relative">
                  {pipelineStages.map((stage, i) => {
                    const isActive = i <= pipelineActiveIdx;
                    const isCurrent = i === pipelineActiveIdx;
                    const isHovered = hoveredStage === stage.id;

                    return (
                      <button
                        key={stage.id}
                        type="button"
                        className="flex flex-col items-center relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime rounded px-0.5"
                        style={{ width: `${100 / pipelineStages.length}%` }}
                        onMouseEnter={() => setHoveredStage(stage.id)}
                        onMouseLeave={() => setHoveredStage(null)}
                        onFocus={() => setHoveredStage(stage.id)}
                        onBlur={() => setHoveredStage(null)}
                        onClick={() => setHoveredStage(prev => (prev === stage.id ? null : stage.id))}
                        aria-expanded={isHovered}
                        aria-label={`${stage.label}${isActive ? `, ${stage.time}` : ', not reached yet'}. ${stage.evidence}`}
                      >
                        <div className={`relative z-10 w-3 h-3 rounded-full transition-all duration-500 ${
                          isActive ? 'bg-brand-lime' : 'bg-border-default'
                        } ${isCurrent ? 'shadow-lg shadow-brand-lime/30 scale-125' : ''}
                          ${stage.isClimax && isActive ? 'w-4 h-4' : ''}`}>
                          {isCurrent && !prefersReducedMotion && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-brand-lime/40" />
                          )}
                        </div>
                        <div className={`text-[10px] font-medium mt-2 transition-colors text-center ${
                          isActive ? 'text-foreground' : 'text-text-quaternary'
                        } ${stage.isClimax && isActive ? 'text-sm font-semibold' : ''}`}>
                          {stage.label}
                        </div>
                        {isActive && (
                          <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                            {stage.time}
                          </div>
                        )}

                        {/* Stage evidence: hover, focus, or tap */}
                        <AnimatePresence>
                          {isHovered && isActive && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="absolute -bottom-10 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-default bg-background px-2.5 py-1.5 shadow-md"
                            >
                              <span className="flex items-center gap-1.5 text-[10px] font-mono text-text-secondary">
                                <stage.icon size={10} className="text-text-tertiary" aria-hidden="true" />
                                {stage.evidence}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ticket card */}
              <div className="mt-8 relative min-h-[120px]">
                <AnimatePresence mode="wait">
                  {activeIdx >= 0 && (
                    <motion.div
                      key={activeIdx}
                      variants={ticketVariants}
                      initial="initial"
                      animate="enter"
                      exit="exit"
                      className="bg-background border border-border-default rounded-lg p-4"
                    >
                      {/* Before phase — gray, waiting */}
                      {isInBefore && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-text-quaternary/20 flex items-center justify-center shrink-0">
                            <Clock size={14} className="text-text-quaternary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text-quaternary">
                                Complaint Submitted
                              </span>
                            </div>
                            <p className="text-xs text-text-quaternary/70 mt-1">
                              Pothole · 5th Main Road, Sector 17, Navi Mumbai
                            </p>
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-text-quaternary/40 animate-pulse" />
                                <span className="text-[10px] font-mono text-text-quaternary/50">Waiting for department assignment...</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-text-quaternary/40 animate-pulse" />
                                <span className="text-[10px] font-mono text-text-quaternary/50">No status update available</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pipeline phase — bright, active */}
                      {!isInBefore && (
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            pipelineActiveIdx >= pipelineStages.length - 3
                              ? 'bg-brand-lime/20'
                              : 'bg-brand-lime/15'
                          }`}>
                            {pipelineActiveIdx >= pipelineStages.length - 2 ? (
                              <CheckCircle2 size={14} className="text-brand-lime" />
                            ) : (
                              <Search size={14} className="text-brand-lime" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                pipelineActiveIdx >= pipelineStages.length - 1
                                  ? 'text-status-resolved'
                                  : 'text-foreground'
                              }`}>
                                {pipelineActiveIdx === 0 && 'Connected to UrbanPulse'}
                                {pipelineActiveIdx === 1 && 'AI identified the issue'}
                                {pipelineActiveIdx === 2 && 'Assigned to Roads Department'}
                                {pipelineActiveIdx === 3 && 'Repair completed'}
                                {pipelineActiveIdx === 4 && 'AI verification complete'}
                                {pipelineActiveIdx >= 5 && 'Citizen notified ✓'}
                              </span>
                              {pipelineActiveIdx >= 5 && (
                                <span className="text-[10px] font-mono text-status-resolved bg-status-resolved/10 px-1.5 py-0.5 rounded">Resolved</span>
                              )}
                            </div>
                            <p className="text-xs text-text-tertiary mt-1">
                              {pipelineActiveIdx === 0 && 'Queue prioritized · Route: Roads Dept, Navi Mumbai'}
                              {pipelineActiveIdx === 1 && 'Vision: Pothole detected · Geo: Sector 17 confirmed'}
                              {pipelineActiveIdx === 2 && 'Officer notified · ETA: 45 min'}
                              {pipelineActiveIdx === 3 && 'Before/after photos uploaded'}
                              {pipelineActiveIdx === 4 && 'Cross-reference: Report photo matches repair photo'}
                              {pipelineActiveIdx >= 5 && 'SMS sent · Status: Closed'}
                            </p>

                            {/* Before/After SVGs */}
                            {showBeforeAfter && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="mt-4 flex gap-3"
                              >
                                <div className="flex-1 rounded-lg overflow-hidden border border-border-default bg-gray-800/50">
                                  <div className="h-20 flex items-center justify-center p-2">
                                    <PotholeSVG label="Before" />
                                  </div>
                                </div>
                                <div className="flex-1 rounded-lg overflow-hidden border border-border-default bg-gray-800/50">
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    className="h-20 flex items-center justify-center p-2"
                                  >
                                    <RepairedSVG label="After" />
                                  </motion.div>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Completion badge */}
                          {pipelineActiveIdx >= pipelineStages.length - 1 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1.5 bg-status-resolved/10 border border-status-resolved/30 rounded-lg px-2.5 py-1.5 shrink-0"
                            >
                              <CheckCircle2 size={12} className="text-status-resolved" />
                              <span className="text-[10px] font-mono text-status-resolved font-medium">1h 40m</span>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
};
