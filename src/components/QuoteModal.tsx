import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, MapPin } from 'lucide-react';
import { useQuoteModal } from '../QuoteContext';
import ModalShell from './ModalShell';
import { inputClass, labelClass } from './formStyles';
import { COMPANY } from '../content';

/** The fleet is 53′ dry vans only, so that's the only equipment we offer to quote. */
const EQUIPMENT_OPTIONS = ['53′ dry van', 'Not sure'];

const INITIAL_FORM = {
  name: '',
  company: '',
  contact: '',
  origin: '',
  destination: '',
  equipment: EQUIPMENT_OPTIONS[0],
  details: '',
};

type Status = 'idle' | 'sending' | 'success' | 'error';

/**
 * Full quote-request form in a modal. Submissions are forwarded to the team
 * via the existing /api/notify endpoint (Telegram-backed). Falls back to a
 * mailto link if the request fails.
 */
export default function QuoteModal() {
  const { isQuoteOpen, closeQuote, prefill } = useQuoteModal();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState<Status>('idle');
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  // Announce the success state by moving focus to its heading.
  useEffect(() => {
    if (status === 'success') successHeadingRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (!isQuoteOpen) return;
    // A lane picked in the hero arrives as a prefill; don't overwrite what the visitor typed otherwise.
    if (prefill) {
      setForm((f) => ({
        ...f,
        origin: prefill.origin ?? f.origin,
        destination: prefill.destination ?? f.destination,
      }));
    }
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 150);
    return () => window.clearTimeout(id);
  }, [isQuoteOpen, prefill]);

  const set = (field: keyof typeof INITIAL_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // The button stays enabled so submitting with empty required fields surfaces
  // the native validation messages instead of failing silently.
  const sending = status === 'sending';

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
    if (sending || !form.name.trim() || !form.contact.trim()) return;
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
      <div className="relative z-10 flex items-start justify-between gap-4 px-5 pt-5 pb-1 sm:px-7 sm:pt-6">
        <div>
          <h2 className="font-display text-[clamp(1.75rem,5vw,2.25rem)] font-light leading-tight text-white">Get a quote</h2>
          <p className="mt-1.5 text-[15px] text-muted">Tell us about your lane. Our team responds during business hours ({COMPANY.hours}).</p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-5 pb-8 pt-6 text-center sm:px-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-paper"
          >
            <CheckCircle2 className="h-8 w-8 text-orange" />
          </motion.div>
          <h4 ref={successHeadingRef} tabIndex={-1} className="mb-2 font-display text-2xl font-normal text-white outline-none">Request received</h4>
          <p className="mx-auto max-w-sm text-[15px] text-muted">
            Thanks, {form.name.trim()}. Your lane details are with our dispatch team. We reply during business hours ({COMPANY.hours}).
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="btn solid mt-7"
          >
            Done
          </button>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="relative z-10 space-y-3.5 px-5 pb-6 pt-3 sm:px-7 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="q-name">Name *</label>
              <input ref={firstFieldRef} id="q-name" type="text" required autoComplete="name" value={form.name} onChange={set('name')} placeholder="Jane Smith" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="q-company">Company</label>
              <input id="q-company" type="text" autoComplete="organization" value={form.company} onChange={set('company')} placeholder="Acme Manufacturing" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="q-contact">Email or phone *</label>
            <input id="q-contact" type="text" required value={form.contact} onChange={set('contact')} placeholder="jane@acme.com" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="q-origin">Pickup</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper" />
                <input id="q-origin" type="text" value={form.origin} onChange={set('origin')} placeholder="Chicago, IL" className={`${inputClass} pl-9`} />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="q-destination">Delivery</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange" />
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
                  className={`min-h-11 rounded-full border px-4 py-2 text-[15px] font-semibold transition-colors ${
                    form.equipment === option
                      ? 'border-paper bg-paper text-ink'
                      : 'border-line-2 text-muted hover:border-paper hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="q-details">Load details</label>
            <textarea id="q-details" rows={2} value={form.details} onChange={set('details')} placeholder="Weight, commodity, frequency, target dates…" className={`${inputClass} resize-none`} />
          </div>

          {status === 'error' && (
            <p role="alert" className="rounded-xl border border-[#ff9d5c]/50 bg-[#5a1d14]/60 px-4 py-3 text-[15px] text-white">
              Couldn't send your request. Please try again, or email us directly at{' '}
              <a className="font-semibold underline" href={`mailto:${COMPANY.email}?subject=Quote%20Request`}>{COMPANY.email}</a>.
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="btn solid group w-full justify-center disabled:pointer-events-none disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send quote request'}
          </button>
          <p className="text-center text-sm text-dim">No spam, no obligations. Your details go straight to our dispatch team.</p>
        </form>
      )}
    </ModalShell>
  );
}
