import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Headset, Paperclip } from 'lucide-react';
import {
  liveChatEnabled,
  startLiveSession,
  sendLiveMessage,
  endLiveSession,
  subscribeToSession,
  type Transcript,
  type LiveSession,
} from '../lib/liveChat';

type Author = 'ai' | 'admin' | 'system';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  author?: Author; // assistant messages: 'ai' (default) or 'admin'; 'system' for notices
  image?: string; // proxy URL for an admin-sent image
  file?: { url: string; name: string }; // admin-sent file
}

type Mode = 'ai' | 'live';

const ESCALATE_TOKEN = '[[ESCALATE]]';

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  author: 'ai',
  content:
    "Dispatch here. Ask about lanes, equipment, compliance or driving for us. I'm an AI assistant; if I can't answer, I'll pass you to a dispatcher.",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>('ai');
  const [session, setSession] = useState<LiveSession | null>(null);
  const [connecting, setConnecting] = useState(false);

  const [showHandoffForm, setShowHandoffForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  // On phones the launcher waits until the hero lane picker has scrolled away, so it never
  // sits on top of the Delivery select.
  const [laneInView, setLaneInView] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showHandoffForm]);

  // Focus the input on open, except on touch screens where that would throw up the keyboard.
  useEffect(() => {
    if (!isOpen || window.matchMedia('(pointer: coarse)').matches) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  // Escape closes the chat and hands focus back to the launcher.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.querySelector('[aria-label="Request a quote"]')) return;
      setIsOpen(false);
      window.setTimeout(() => launcherRef.current?.focus(), 0);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useEffect(() => {
    const lane = document.getElementById('lane-estimate');
    if (!lane) return;
    // ignore the strip under the sticky header
    const io = new IntersectionObserver(([e]) => setLaneInView(e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
    io.observe(lane);
    return () => io.disconnect();
  }, []);

  // Lets CTAs elsewhere on the page ("Speak With Our Team") pop the widget open.
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener('ff:open-chat', open);
    return () => window.removeEventListener('ff:open-chat', open);
  }, []);

  const addSystem = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: 'assistant', author: 'system', content }]);
  }, []);

  // ---- Live session subscription ----
  useEffect(() => {
    if (!session) return;
    const unsubscribe = subscribeToSession(session.channel, {
      onAdminMessage: (content) => {
        if (content) setMessages((prev) => [...prev, { role: 'assistant', author: 'admin', content }]);
      },
      onAdminImage: (url) => {
        setMessages((prev) => [...prev, { role: 'assistant', author: 'admin', content: '', image: url }]);
      },
      onAdminFile: (url, name) => {
        setMessages((prev) => [...prev, { role: 'assistant', author: 'admin', content: '', file: { url, name } }]);
      },
      onClosed: () => {
        addSystem("A teammate has wrapped up this chat. I'm still here if you need anything else! 🤖");
        setMode('ai');
        setSession(null);
      },
    });
    return unsubscribe;
  }, [session, addSystem]);

  const recentTranscript = (): Transcript[] =>
    messages
      // Skip system notices and image/file-only messages (empty content).
      .filter((m) => m.author !== 'system' && m.content.trim().length > 0)
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));

  // ---- Escalation to a human ----
  const beginHandoff = () => {
    setError(null);
    setShowHandoffForm(true);
  };

  const connectLive = async () => {
    setConnecting(true);
    setError(null);
    setShowHandoffForm(false);

    const name = contactName.trim();
    const contact = contactInfo.trim();
    const reason = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    addSystem('Connecting you with our team…');

    try {
      if (!liveChatEnabled) throw new Error('live-disabled');
      const s = await startLiveSession({ name, contact, reason, transcript: recentTranscript() });
      setSession(s);
      setMode('live');
      addSystem("✅ You're connected. A FreightFlow specialist will reply right here — feel free to keep typing.");
    } catch {
      // Fall back to the one-way notify so the lead is never lost.
      try {
        const recent = recentTranscript()
          .map((m) => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`)
          .join('\n');
        const res = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name || 'Website visitor', contact: contact || 'Not provided', question: recent }),
        });
        if (!res.ok) throw new Error();
        addSystem(
          `Thanks${name ? ' ' + name : ''}! I've forwarded your conversation to our team. Someone will reach out shortly during business hours (Mon–Fri 8AM–5PM CST).`
        );
      } catch {
        setError('Could not reach the team right now. Please email info@freightflow.group.');
      }
    } finally {
      setConnecting(false);
      setContactName('');
      setContactInfo('');
    }
  };

  const endChat = () => {
    if (session) void endLiveSession(session);
    setSession(null);
    setMode('ai');
    addSystem("You ended the chat. I'm here if you need anything else! 🤖");
  };

  // ---- Sending messages ----
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || connecting) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setError(null);

    if (mode === 'live' && session) {
      try {
        await sendLiveMessage(session, text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Message could not be delivered.');
      }
      return;
    }

    await sendToAI(text);
  };

  const sendToAI = async (text: string) => {
    setIsLoading(true);
    const history = [...messages, { role: 'user' as const, content: text }]
      // The AI history must exclude system notices, admin turns from a previous
      // live session, and image/file-only messages (empty content) — the API
      // rejects empty-content messages, which would brick the chat permanently.
      .filter((m) => m.author !== 'system' && m.author !== 'admin' && m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.error ||
            (response.status === 429 ? 'Too many requests. Please wait a moment.' : 'Something went wrong. Please try again.')
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let raw = '';

      setMessages((prev) => [...prev, { role: 'assistant', author: 'ai', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          // Strip every complete control token, plus any partially-streamed one
          // at the tail so "[[", "[[ESCAL", … never flash in the UI.
          const display = raw
            .replace(/\[\[ESCALATE\]\]/g, '')
            .replace(/\[+\[?E?S?C?A?L?A?T?E?\]?\]*\s*$/, '')
            .trimEnd();
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', author: 'ai', content: display };
            return updated;
          });
        }
      }

      // Auto-escalate if the model signalled it can't help.
      if (raw.includes(ESCALATE_TOKEN) && mode === 'ai') {
        setTimeout(() => beginHandoff(), 400);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isLive = mode === 'live';
  // Require a first name + a usable contact (email or phone) before connecting.
  const canConnect =
    contactName.trim().length >= 2 &&
    (/\S+@\S+\.\S+/.test(contactInfo.trim()) || contactInfo.replace(/\D/g, '').length >= 7);

  return (
    <>
      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`chat-launcher${isOpen ? ' is-open' : ''}${laneInView && !isOpen ? ' is-tucked' : ''} fixed z-50 flex h-14 w-14 items-center justify-center rounded-full border border-line-2 bg-paper text-ink shadow-[0_14px_30px_-10px_rgba(0,0,0,0.6)] transition-colors hover:bg-white`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Chat with FreightFlow dispatch"
            className="chat-panel fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-ink-2 text-paper shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-line bg-ink px-5 py-3.5">
              <div>
                <div className="font-display text-lg font-normal text-white">FreightFlow dispatch</div>
                <p className="flex items-center gap-1.5 text-[13px] font-medium">
                  {isLive ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warm opacity-75 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-warm" />
                      </span>
                      <span className="text-warm">Live with a dispatcher</span>
                    </>
                  ) : (
                    <span className="text-dim">AI assistant</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {isLive && (
                  <button
                    type="button"
                    onClick={endChat}
                    className="min-h-9 rounded-full border border-line-2 px-3 text-[13px] font-semibold text-muted transition-colors hover:border-paper hover:text-white"
                  >
                    End chat
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
              className="chat-log min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4"
            >
              {messages.map((msg, i) => {
                if (msg.author === 'system') {
                  return (
                    <div key={i} className="flex justify-center">
                      <p className="max-w-[90%] rounded-full bg-white/[0.06] px-3 py-1.5 text-center text-[13px] text-dim">
                        {msg.content}
                      </p>
                    </div>
                  );
                }
                const isUser = msg.role === 'user';
                const isAdmin = msg.author === 'admin';
                return (
                  <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {isAdmin && (
                      <span className="mb-1 ml-1 text-[13px] font-semibold text-warm">
                        FreightFlow Team
                      </span>
                    )}
                    <div
                      className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed ${
                        isUser
                          ? 'rounded-2xl rounded-br-sm bg-paper text-ink'
                          : isAdmin
                            ? 'rounded-2xl rounded-bl-sm border border-warm/40 bg-warm/10 text-paper'
                            : 'rounded-2xl rounded-bl-sm bg-white/[0.07] text-paper'
                      }`}
                    >
                      {msg.image ? (
                        <a href={msg.image} target="_blank" rel="noreferrer">
                          <img src={msg.image} alt="Shared by team" className="rounded-lg max-w-full max-h-60 object-contain" />
                        </a>
                      ) : msg.file ? (
                        <a
                          href={msg.file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-semibold underline break-all"
                        >
                          <Paperclip className="w-4 h-4 shrink-0" /> {msg.file.name}
                        </a>
                      ) : (
                        msg.content || <LoadingDots />
                      )}
                    </div>
                  </div>
                );
              })}

              {error && (
                <div className="flex justify-center">
                  <p role="alert" className="rounded-lg bg-[#5a1d14]/70 px-3 py-2 text-center text-[13px] text-white">{error}</p>
                </div>
              )}

              {showHandoffForm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 rounded-2xl rounded-bl-sm bg-white/[0.07] p-4"
                >
                  <p className="text-[15px] font-semibold text-white">Connect with our team</p>
                  <p className="-mt-1 text-[13px] text-dim">Quick intro so we can help and follow up.</p>
                  <div>
                    <label htmlFor="ff-handoff-name" className="mb-1 block text-[13px] font-medium text-muted">
                      First name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="ff-handoff-name"
                      type="text"
                      required
                      autoComplete="given-name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Jane"
                      className="min-h-11 w-full rounded-lg border border-line-2 bg-ink/70 px-3 py-2 text-base text-paper placeholder:text-dim outline-none focus:border-warm focus:ring-2 focus:ring-warm/60"
                    />
                  </div>
                  <div>
                    <label htmlFor="ff-handoff-contact" className="mb-1 block text-[13px] font-medium text-muted">
                      Email or phone <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="ff-handoff-contact"
                      type="text"
                      required
                      aria-describedby="ff-handoff-hint"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="jane@acme.com"
                      className="min-h-11 w-full rounded-lg border border-line-2 bg-ink/70 px-3 py-2 text-base text-paper placeholder:text-dim outline-none focus:border-warm focus:ring-2 focus:ring-warm/60"
                    />
                  </div>
                  {!canConnect && (contactName.trim() !== '' || contactInfo.trim() !== '') && (
                    <p id="ff-handoff-hint" className="text-[13px] text-dim">
                      Please enter your first name and a valid email address or phone number so we can follow up.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={connectLive}
                      disabled={connecting || !canConnect}
                      className="min-h-11 flex-1 rounded-full bg-paper px-4 py-2 text-[15px] font-semibold text-ink transition-colors hover:bg-white disabled:opacity-40"
                    >
                      {connecting ? 'Connecting…' : 'Connect me'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHandoffForm(false)}
                      className="min-h-11 px-4 py-2 text-[15px] font-medium text-muted transition-colors hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-line bg-ink p-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLive ? 'Message the team…' : 'Ask about our services…'}
                  disabled={isLoading}
                  aria-label={isLive ? 'Message the team' : 'Ask about our services'}
                  className="min-h-11 min-w-0 flex-1 rounded-full border border-line-2 bg-ink-2 px-4 py-2.5 text-base text-paper placeholder:text-dim outline-none transition-colors focus:border-warm focus:ring-2 focus:ring-warm/60 disabled:opacity-50"
                />
                {!isLive && (
                  <button
                    type="button"
                    onClick={beginHandoff}
                    disabled={isLoading || connecting}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-warm disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Talk to a human"
                    title="Talk to a human"
                  >
                    <Headset className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={isLoading || connecting || !input.trim()}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-ink transition-colors hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-paper/40"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
