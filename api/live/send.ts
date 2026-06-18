import { clientIp, rateLimited, type VercelRequest, type VercelResponse } from '../../server/http';
import { admin, supabaseConfigured } from '../../server/supabaseAdmin';
import { sendToTopic, telegramConfigured } from '../../server/telegram';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Relays a visitor's message (while in live mode) into their Telegram topic.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (rateLimited(`send:${clientIp(req)}`, 30)) {
    return res.status(429).json({ error: 'Too many messages. Please slow down.' });
  }
  if (!supabaseConfigured() || !telegramConfigured()) {
    return res.status(503).json({ error: 'Live chat is not configured.' });
  }

  const { sessionId, content } = (req.body || {}) as { sessionId?: string; content?: string };
  if (!sessionId || !UUID_RE.test(sessionId)) {
    return res.status(400).json({ error: 'Invalid session.' });
  }
  const text = (content || '').toString().trim();
  if (!text || text.length > 2000) {
    return res.status(400).json({ error: 'Message is required (max 2000 chars).' });
  }

  try {
    const db = admin();
    const { data: session } = await db
      .from('ff_chat_sessions')
      .select('topic_id, status')
      .eq('id', sessionId)
      .single();

    if (!session || session.topic_id == null) {
      return res.status(410).json({ error: 'This chat session is no longer active.' });
    }
    if (session.status === 'closed') {
      return res.status(410).json({ error: 'This chat has ended.' });
    }

    await db.from('ff_chat_messages').insert({ session_id: sessionId, sender: 'visitor', content: text });
    await db.from('ff_chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
    await sendToTopic(session.topic_id as number, `👤 ${text}`);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('live/send error:', err);
    return res.status(502).json({ error: 'Message could not be delivered.' });
  }
}
