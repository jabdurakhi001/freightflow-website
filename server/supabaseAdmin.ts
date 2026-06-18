import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-only Supabase client using the service-role key. This bypasses RLS, so it
// must never be imported into browser code. The live-chat tables have RLS enabled
// with no policies, so this is the only way they are read or written at runtime.
let cached: SupabaseClient | null = null;

export function supabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function admin(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return cached;
}

/**
 * Push an admin reply to the visitor's browser over a Realtime broadcast channel
 * keyed by the (unguessable) session id. Uses the broadcast REST endpoint so the
 * stateless function doesn't need to hold a websocket open.
 */
export async function broadcastToSession(
  sessionId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${process.env.SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      messages: [{ topic: `ff-live:${sessionId}`, event, payload, private: false }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Realtime broadcast failed: ${res.status} ${await res.text()}`);
  }
}
