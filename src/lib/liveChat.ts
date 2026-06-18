import type { SupabaseClient } from '@supabase/supabase-js';

// Live human-handoff client. Admin replies arrive over a Realtime broadcast channel
// whose name is returned by /api/live/start; visitor messages are POSTed to the
// serverless relay. supabase-js is loaded dynamically (only when a live session
// starts) to keep it out of the initial page bundle.
//
// The URL + anon key are public values with safe built-in defaults, so the feature
// works without any build-time configuration.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://wzadveihdtlboymltjkh.supabase.co';
const anon =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6YWR2ZWloZHRsYm95bWx0amtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTk1MzMsImV4cCI6MjA4NjQzNTUzM30.SBpTABNgcyYqXbqHLqIHzb9BQ6W2f9MAFv3IoylPsCo';

export const liveChatEnabled = Boolean(url && anon);

let clientPromise: Promise<SupabaseClient> | null = null;
function getClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, anon, { auth: { persistSession: false } })
    );
  }
  return clientPromise;
}

export interface Transcript {
  role: 'user' | 'assistant';
  content: string;
}

export interface LiveSession {
  topicId: number;
  channel: string;
}

export async function startLiveSession(payload: {
  name?: string;
  contact?: string;
  reason?: string;
  transcript: Transcript[];
}): Promise<LiveSession> {
  const res = await fetch('/api/live/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Could not connect to a live agent.');
  }
  return (await res.json()) as LiveSession;
}

export async function sendLiveMessage(session: LiveSession, content: string): Promise<void> {
  const res = await fetch('/api/live/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId: session.topicId, channel: session.channel, content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Message could not be delivered.');
  }
}

export interface LiveHandlers {
  onAdminMessage: (content: string) => void;
  onClosed: () => void;
  onSubscribed?: () => void;
}

/** Subscribe to a session's broadcast channel. Returns an unsubscribe function. */
export function subscribeToSession(channel: string, handlers: LiveHandlers): () => void {
  let cancelled = false;
  let teardown: (() => void) | null = null;

  void getClient().then((supabase) => {
    if (cancelled) return;
    const ch = supabase.channel(channel, { config: { broadcast: { self: false } } });
    ch.on('broadcast', { event: 'admin_msg' }, (m) => handlers.onAdminMessage((m.payload?.content as string) ?? ''))
      .on('broadcast', { event: 'closed' }, () => handlers.onClosed())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') handlers.onSubscribed?.();
      });
    teardown = () => void supabase.removeChannel(ch);
  });

  return () => {
    cancelled = true;
    teardown?.();
  };
}
