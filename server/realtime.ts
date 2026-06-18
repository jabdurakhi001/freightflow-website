import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Push a message to a public Realtime broadcast channel via the REST endpoint, so a
// stateless serverless function doesn't need to hold a websocket open. The anon key
// is sufficient for public-channel broadcast (verified against this project).
export async function broadcast(
  channel: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ messages: [{ topic: channel, event, payload, private: false }] }),
  });
  if (!res.ok) {
    throw new Error(`Realtime broadcast failed: ${res.status} ${await res.text()}`);
  }
}
