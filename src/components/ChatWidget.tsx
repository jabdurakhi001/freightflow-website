import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Headset } from 'lucide-react';
import {
  liveChatEnabled,
  startLiveSession,
  sendLiveMessage,
  subscribeToSession,
  type Transcript,
  type LiveSession,
} from '../lib/liveChat';

type Author = 'ai' | 'admin' | 'system';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  author?: Author; // assistant messages: 'ai' (default) or 'admin'; 'system' for notices
}

type Mode = 'ai' | 'live';

const ESCALATE_TOKEN = '[[ESCALATE]]';

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  author: 'ai',
  content:
    "Hey there! 👋 I'm FreightFlow's AI assistant. I can help with our freight services, fleet, compliance, quotes, or driver recruitment — and if I can't answer something, I'll connect you with a real teammate. What can I help you with?",
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showHandoffForm]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

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
      .filter((m) => m.author !== 'system')
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
      .filter((m) => m.author !== 'system')
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
          const display = raw.replace(ESCALATE_TOKEN, '').trimEnd();
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

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:brightness-110 transition-all"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
        whileHover={{ scale: 1.1 }}
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
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] flex flex-col rounded-xl shadow-2xl border border-outline-variant/30 overflow-hidden max-sm:inset-4 max-sm:bottom-20 max-sm:w-auto max-sm:max-h-none"
          >
            {/* Header */}
            <div className="bg-primary px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="text-sm font-black text-white tracking-tighter">
                  <span>Freight</span><span className="text-secondary">Flow</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  {isLive ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      <span className="text-emerald-300">Live with our team</span>
                    </>
                  ) : (
                    <span className="text-white/60">AI Assistant</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low dark:bg-surface-container min-h-[300px] max-h-[420px] max-sm:max-h-none">
              {messages.map((msg, i) => {
                if (msg.author === 'system') {
                  return (
                    <div key={i} className="flex justify-center">
                      <p className="text-[11px] text-on-surface-variant/80 bg-surface-container dark:bg-surface-container-high px-3 py-1.5 rounded-full text-center max-w-[90%]">
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
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1 ml-1">
                        FreightFlow Team
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-secondary text-white rounded-2xl rounded-br-sm'
                          : isAdmin
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-on-surface rounded-2xl rounded-bl-sm'
                            : 'bg-surface-container dark:bg-surface-container-high text-on-surface rounded-2xl rounded-bl-sm'
                      }`}
                    >
                      {msg.content || <LoadingDots />}
                    </div>
                  </div>
                );
              })}

              {error && (
                <div className="flex justify-center">
                  <p className="text-xs text-error bg-error/10 px-3 py-2 rounded-lg text-center">{error}</p>
                </div>
              )}

              {showHandoffForm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-container dark:bg-surface-container-high rounded-2xl rounded-bl-sm p-4 space-y-3"
                >
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Connect with our team</p>
                  <p className="text-[11px] text-on-surface-variant/80 -mt-1">Optional — helps us follow up if we get disconnected.</p>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-surface-container-low dark:bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Email or phone (optional)"
                    className="w-full bg-surface-container-low dark:bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={connectLive}
                      disabled={connecting}
                      className="flex-1 bg-secondary text-white rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-40"
                    >
                      {connecting ? 'Connecting…' : 'Connect me'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHandoffForm(false)}
                      className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-outline-variant/20 bg-surface dark:bg-surface-container-low shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLive ? 'Message the team…' : 'Ask about our services…'}
                  disabled={isLoading}
                  className="flex-1 bg-surface-container dark:bg-surface-container-high rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-secondary transition-all disabled:opacity-50"
                />
                {!isLive && (
                  <button
                    type="button"
                    onClick={beginHandoff}
                    disabled={isLoading || connecting}
                    className="text-on-surface-variant hover:text-secondary rounded-lg px-2 py-3 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
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
                  className="bg-secondary text-white rounded-lg px-4 py-3 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
          className="w-2 h-2 rounded-full bg-on-surface-variant/40"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
