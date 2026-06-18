import type { VercelRequest, VercelResponse } from '../server/http';
import { admin, broadcastToSession, supabaseConfigured } from '../server/supabaseAdmin';
import { sendToTopic } from '../server/telegram';

// Receives Telegram updates (admin replies inside per-visitor topics) and relays
// them back to the visitor's browser via a Realtime broadcast. Secured with the
// secret token configured on setWebhook.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!supabaseConfigured()) {
    return res.status(200).json({ ok: true }); // ack so Telegram stops retrying
  }

  const msg = req.body?.message;
  // Only handle human replies inside a topic; ignore bot echoes & service messages.
  const threadId = msg?.message_thread_id;
  const text: string | undefined = msg?.text;
  if (!msg || msg.from?.is_bot || threadId == null || !text) {
    return res.status(200).json({ ok: true });
  }

  try {
    const db = admin();
    const { data: session } = await db
      .from('ff_chat_sessions')
      .select('id, status')
      .eq('topic_id', threadId)
      .single();

    if (!session) return res.status(200).json({ ok: true });

    if (text.trim().toLowerCase() === '/close') {
      await db.from('ff_chat_sessions').update({ status: 'closed' }).eq('id', session.id);
      await broadcastToSession(session.id, 'closed', {});
      await sendToTopic(threadId, '🔴 Chat closed. The visitor has been disconnected.');
      return res.status(200).json({ ok: true });
    }

    await db.from('ff_chat_messages').insert({ session_id: session.id, sender: 'admin', content: text });
    await db.from('ff_chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', session.id);
    await broadcastToSession(session.id, 'admin_msg', { content: text, at: Date.now() });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telegram-webhook error:', err);
    return res.status(200).json({ ok: true }); // never make Telegram retry-storm
  }
}
