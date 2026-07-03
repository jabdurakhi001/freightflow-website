import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { useQuoteModal } from '../QuoteContext';
import ModalShell from './ModalShell';
import { inputClass, labelClass } from './formStyles';

const EQUIPMENT_OPTIONS = ['Dry Van', 'Reefer', 'Flatbed', 'Power Only', 'Not Sure'];

const INITIAL_FORM = {
  name: '',
  company: '',
  contact: '',
  origin: '',
  destination: '',
  equipment: 'Dry Van',
  details: '',
};

type Status = 'idle' | 'sending' | 'success' | 'error';

/**
 * Full quote-request form in a modal. Submissions are forwarded to the team
 * via the existing /api/notify endpoint (Telegram-backed). Falls back to a
 * mailto link if the request fails.
 */
export default function QuoteModal() {
  const { isQuoteOpen, closeQuote, quotePrefill } = useQuoteModal();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState<Status>('idle');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuoteOpen) {
      if (quotePrefill) {
        setForm((f) => ({
          ...f,
          origin: quotePrefill.origin ?? f.origin,
          destination: quotePrefill.destination ?? f.destination,
        }));
      }
      setTimeout(() => firstFieldRef.current?.focus(), 150);
    }
  }, [isQuoteOpen, quotePrefill]);

  const set = (field: keyof typeof INITIAL_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit = form.name.trim() && form.contact.trim() && status !== 'sending';

  const handleClose = () => {
    closeQuote();
    // Reset after the exit animation so a finished form doesn't flash back
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
      '🚛 QUOTE REQUEST (website form)',
      `Company: ${form.company.trim() || 'Not provided'}`,
      `Lane: ${form.origin.trim() || '?'} → ${form.destination.trim() || '?'}`,
      `Equipment: ${form.equipment}`,
      form.details.trim() ? `Details: ${form.details.trim()}` : null,
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
    <ModalShell open={isQuoteOpen} onClose={handleClose} label="Request a quote">
      {/* Header */}
      <div className="relative z-10 flex items-start justify-between px-7 pt-7 pb-2">
        <div>
          <span className="eyebrow mb-2">Rapid Response</span>
          <h3 className="text-2xl font-black text-white tracking-tighter">Request a Quote</h3>
          <p className="text-sm text-white/50 mt-1">Tell us about your lane — our team responds during business hours (Mon–Fri, 8AM–5PM CST).</p>
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
          <h4 className="text-xl font-black text-white tracking-tight mb-2">Request received</h4>
          <p className="text-sm text-white/60 max-w-sm mx-auto">
            Thanks, {form.name.trim()}. Your lane details are with our dispatch team — we'll get back to you shortly.
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
              <label className={labelClass} htmlFor="q-name">Name *</label>
              <input ref={firstFieldRef} id="q-name" type="text" required value={form.name} onChange={set('name')} placeholder="Jane Smith" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="q-company">Company</label>
              <input id="q-company" type="text" value={form.company} onChange={set('company')} placeholder="Acme Manufacturing" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="q-contact">Email or Phone *</label>
            <input id="q-contact" type="text" required value={form.contact} onChange={set('contact')} placeholder="jane@acme.com" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="q-origin">Origin</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70 pointer-events-none" />
                <input id="q-origin" type="text" value={form.origin} onChange={set('origin')} placeholder="Chicago, IL" className={`${inputClass} pl-9`} />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="q-destination">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary/70 pointer-events-none" />
                <input id="q-destination" type="text" value={form.destination} onChange={set('destination')} placeholder="Dallas, TX" className={`${inputClass} pl-9`} />
              </div>
            </div>
          </div>

          <div role="group" aria-label="Equipment type">
            <span className={labelClass}>Equipment</span>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, equipment: option }))}
                  aria-pressed={form.equipment === option}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                    form.equipment === option
                      ? 'bg-secondary border-secondary text-white glow-secondary'
                      : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="q-details">Load Details</label>
            <textarea id="q-details" rows={3} value={form.details} onChange={set('details')} placeholder="Weight, commodity, frequency, target dates…" className={`${inputClass} resize-none`} />
          </div>

          {status === 'error' && (
            <p className="text-xs text-error bg-error/10 border border-error/20 px-4 py-3 rounded-lg">
              Couldn't send your request. Please try again, or email us directly at{' '}
              <a className="underline font-bold" href="mailto:info@freightflow.group?subject=Quote%20Request">info@freightflow.group</a>.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-premium group w-full inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest disabled:opacity-40 disabled:pointer-events-none"
          >
            {status === 'sending' ? 'Sending…' : 'Send Quote Request'}
            {status !== 'sending' && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
          <p className="text-[10px] text-white/30 text-center">No spam, no obligations — your details go straight to our dispatch team.</p>
        </form>
      )}
    </ModalShell>
  );
}
