import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Forward } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: "Hey there! 👋 I'm FreightFlow's AI assistant. I can help you with info about our freight services, fleet, compliance, quote requests, or driver recruitment. What can I help you with?",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [notifySending, setNotifySending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showContactForm]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.error ||
            (response.status === 429
              ? 'Too many requests. Please wait a moment.'
              : 'Something went wrong. Please try again.')
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
            return updated;
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const forwardToTeam = async () => {
    if (!contactName.trim()) return;
    setNotifySending(true);

    // Collect the last few messages as context
    const recentMessages = messages
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`)
      .join('\n');

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim(),
          contact: contactInfo.trim() || 'Not provided',
          question: recentMessages,
        }),
      });

      if (!response.ok) throw new Error('Failed to send');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Thanks ${contactName}! 🎉 I've forwarded your conversation to our team. Someone will get back to you shortly during business hours (Mon-Fri 8AM-5PM CST). Is there anything else I can help with?`,
        },
      ]);
      setShowContactForm(false);
      setContactName('');
      setContactInfo('');
    } catch {
      setError('Could not forward your message. Please email us at info@freightflow.group');
    } finally {
      setNotifySending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
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

      {/* Chat Panel */}
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
                <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">AI Assistant</p>
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
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-secondary text-white rounded-2xl rounded-br-sm'
                        : 'bg-surface-container dark:bg-surface-container-high text-on-surface rounded-2xl rounded-bl-sm'
                    }`}
                  >
                    {msg.content || <LoadingDots />}
                  </div>
                </div>
              ))}

              {error && (
                <div className="flex justify-center">
                  <p className="text-xs text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>
                </div>
              )}

              {/* Contact Form (for forwarding to team) */}
              {showContactForm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-container dark:bg-surface-container-high rounded-2xl rounded-bl-sm p-4 space-y-3"
                >
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Connect with our team</p>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your name *"
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
                      onClick={forwardToTeam}
                      disabled={!contactName.trim() || notifySending}
                      className="flex-1 bg-secondary text-white rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-40"
                    >
                      {notifySending ? 'Sending...' : 'Send to team'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
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
                  placeholder="Ask about our services..."
                  disabled={isLoading}
                  className="flex-1 bg-surface-container dark:bg-surface-container-high rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-secondary transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowContactForm(true)}
                  disabled={isLoading || messages.length < 2}
                  className="text-on-surface-variant hover:text-secondary rounded-lg px-2 py-3 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="Forward to team"
                  title="Talk to a human"
                >
                  <Forward className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
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
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </span>
  );
}
