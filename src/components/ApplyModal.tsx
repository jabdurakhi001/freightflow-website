import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useQuoteModal } from '../QuoteContext';
import ModalShell from './ModalShell';
import { inputClass, labelClass } from './formStyles';

const CDL_OPTIONS = ['CDL-A', 'CDL-B', 'In Training'];
const EXPERIENCE_OPTIONS = ['< 1 yr', '1–3 yrs', '3–5 yrs', '5+ yrs'];
const HUB_OPTIONS = ['Chicago', 'Dallas', 'Other'];

const INITIAL_FORM = {
  name: '',
  contact: '',
  cdl: 'CDL-A',
  experience: '1–3 yrs',
  hub: 'Chicago',
  notes: '',
};

type Status = 'idle' | 'sending' | 'success' | 'error';

interface ChipGroupProps {
  label: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}

function ChipGroup({ label, options, value, onSelect }: ChipGroupProps) {
  return (
    <div role="group" aria-label={label}>
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={value === option}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
              value === option
                ? 'bg-secondary border-secondary text-white glow-secondary'
                : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Driver application form in a modal. Submissions are forwarded to the team
 * via the existing /api/notify endpoint (Telegram-backed). Falls back to a
 * mailto link if the request fails.
 */
export default function ApplyModal() {
  const { isApplyOpen, closeApply } = useQuoteModal();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState<Status>('idle');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isApplyOpen) setTimeout(() => firstFieldRef.current?.focus(), 150);
  }, [isApplyOpen]);

  const canSubmit = form.name.trim() && form.contact.trim() && status !== 'sending';

  const handleClose = () => {
    closeApply();
    setTimeout(() => {
      if (status === 'success') {
        setForm(INITIAL_FORM);
        setStatus('idle');
      }
    }, 300);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('sending');

    const question = [
      '👤 DRIVER APPLICATION (website form)',
      `CDL: ${form.cdl}`,
      `Experience: ${form.experience}`,
      `Preferred hub: ${form.hub}`,
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), contact: form.contact.trim(), question }),
      });
      if (!res.ok) throw new Error('send failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <ModalShell open={isApplyOpen} onClose={handleClose} label="Apply to drive with FreightFlow">
      {/* Header */}
      <div className="relative z-10 flex items-start justify-between px-7 pt-7 pb-2">
        <div>
          <span className="eyebrow mb-2">Now Hiring · Chicago & Dallas</span>
          <h3 className="text-2xl font-black text-white tracking-tighter">Drive With FreightFlow</h3>
          <p className="text-sm text-white/50 mt-1">Tell us about yourself — our recruiting team reaches out during business hours (Mon–Fri, 8AM–5PM CST).</p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-7 pb-10 pt-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
            className="mx-auto mb-4 w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center"
          >
            <CheckCircle2 className="w-8 h-8 text-secondary" />
          </motion.div>
          <h4 className="text-xl font-black text-white tracking-tight mb-2">Application received</h4>
          <p className="text-sm text-white/60 max-w-sm mx-auto">
            Thanks, {form.name.trim()}. Our recruiting team has your application and will reach out soon.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="btn-premium mt-7 inline-flex items-center gap-2 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest"
          >
            Done
          </button>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="relative z-10 px-7 pb-7 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="a-name">Name *</label>
              <input ref={firstFieldRef} id="a-name" type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="John Carter" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="a-contact">Phone or Email *</label>
              <input id="a-contact" type="text" required value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="(312) 555-0148" className={inputClass} />
            </div>
          </div>

          <ChipGroup label="CDL Class" options={CDL_OPTIONS} value={form.cdl} onSelect={(cdl) => setForm((f) => ({ ...f, cdl }))} />
          <ChipGroup label="OTR Experience" options={EXPERIENCE_OPTIONS} value={form.experience} onSelect={(experience) => setForm((f) => ({ ...f, experience }))} />
          <ChipGroup label="Preferred Hub" options={HUB_OPTIONS} value={form.hub} onSelect={(hub) => setForm((f) => ({ ...f, hub }))} />

          <div>
            <label className={labelClass} htmlFor="a-notes">Anything Else</label>
            <textarea id="a-notes" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Endorsements, availability, current situation…" className={`${inputClass} resize-none`} />
          </div>

          {status === 'error' && (
            <p className="text-xs text-error bg-error/10 border border-error/20 px-4 py-3 rounded-lg">
              Couldn't send your application. Please try again, or email us directly at{' '}
              <a className="underline font-bold" href="mailto:info@freightflow.group?subject=Driver%20Application">info@freightflow.group</a>.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-premium group w-full inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest disabled:opacity-40 disabled:pointer-events-none"
          >
            {status === 'sending' ? 'Sending…' : 'Submit Application'}
            {status !== 'sending' && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
          <p className="text-[10px] text-white/30 text-center">Your details go straight to our recruiting team — no job boards, no middlemen.</p>
        </form>
      )}
    </ModalShell>
  );
}
