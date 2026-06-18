import type { SupabaseClient } from '@supabase/supabase-js';

// Live human-handoff client. Admin replies arrive over a Realtime broadcast channel
// keyed by the session id; visitor messages are POSTed to the serverless relay.
// The feature self-disables if the Supabase env vars aren't configured at build time.
// supabase-js is loaded dynamically (only when a live session starts) to keep it
// out of the initial page bundle.

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const liveChatEnabled = Boolean(url && anon);

let clientPromise: Promise<SupabaseClient> | null = null;
function getClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url as string, anon as string, { auth: { persistSession: false } })
    );
  }
  return clientPromise;
}

export interface Transcript {
  role: 'user' | 'assistant';
  content: string;
}

export async function startLiveSession(payload: {
  name?: string;
  contact?: string;
  reason?: string;
  transcript: Transcript[];
}): Promise<string> {
  const res = await fetch('/api/live/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Could not connect to a live agent.');
  }
  return (await res.json()).sessionId as string;
}

export async function sendLiveMessage(sessionId: string, content: string): Promise<void> {
  const res = await fetch('/api/live/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, content }),
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
export function subscribeToSession(sessionId: string, handlers: LiveHandlers): () => void {
  let cancelled = false;
  let teardown: (() => void) | null = null;

  void getClient().then((supabase) => {
    if (cancelled) return;
    const channel = supabase.channel(`ff-live:${sessionId}`, {
      config: { broadcast: { self: false } },
    });
    channel
      .on('broadcast', { event: 'admin_msg' }, (m) => handlers.onAdminMessage((m.payload?.content as string) ?? ''))
      .on('broadcast', { event: 'closed' }, () => handlers.onClosed())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') handlers.onSubscribed?.();
      });
    teardown = () => void supabase.removeChannel(channel);
  });

  return () => {
    cancelled = true;
    teardown?.();
  };
}
