import { motion } from 'framer-motion';
import { Camera, Cpu, MapPin, Wrench, Bell, CheckCircle2 } from 'lucide-react';

const timeline = [
  {
    time: '8:43 AM',
    icon: Camera,
    title: 'Citizen reports a streetlight',
    detail: 'Ward 12, Navi Mumbai — snapped after last night\'s storm',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
  },
  {
    time: '8:44 AM',
    icon: Cpu,
    title: 'AI verifies & routes to department',
    detail: 'Damage confirmed · 98% confidence · Priority: High',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
  },
  {
    time: '9:02 AM',
    icon: MapPin,
    title: 'Officer assigned',
    detail: 'Electrical team · ETA: 12 minutes',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
  },
  {
    time: '10:21 AM',
    icon: Wrench,
    title: 'Repair completed',
    detail: 'Streetlight replaced · Before/after photo verified',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/25',
  },
  {
    time: '10:23 AM',
    icon: Bell,
    title: 'Citizen notified',
    detail: 'SMS sent · "Your issue has been resolved"',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
  },
];

export function PipelineSection() {
  return (
    <section data-pipeline="true" className="relative py-28 px-6 border-t border-border-default overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-brand-lime/[0.01] to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-lime mb-4 block">A Day With UrbanPulse</span>
          <h2 className="text-3xl sm:text-4xl font-serif italic font-bold leading-tight">
            One complaint.{' '}
            <span className="text-text-tertiary">Start to finish.</span>
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {timeline.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === timeline.length - 1;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className="flex gap-5"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${step.bg} ${step.border} border flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={step.color} />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 min-h-[3rem] bg-gradient-to-b from-border-default to-transparent" />
                  )}
                </div>
                <div className="pb-10 flex-1">
                  <span className="text-[11px] font-mono text-text-tertiary block mb-1">{step.time}</span>
                  <h3 className="text-sm font-medium text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-text-tertiary">{step.detail}</p>
                </div>
              </motion.div>
            );
          })}

          {/* Resolution badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-3 justify-center pt-6 border-t border-border-default mt-2"
          >
            <div className="w-8 h-8 rounded-full bg-brand-lime text-background flex items-center justify-center">
              <CheckCircle2 size={14} />
            </div>
            <div>
              <span className="text-sm font-medium text-brand-lime">Resolved in 2h 31m</span>
              <span className="text-xs text-text-tertiary block">Citizen notified · Ticket closed</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}