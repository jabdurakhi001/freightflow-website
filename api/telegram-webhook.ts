import type { VercelRequest, VercelResponse } from '../server/http';
import { channelFor, webhookSecret } from '../server/config';
import { broadcast } from '../server/realtime';
import { sendToTopic } from '../server/telegram';

// Receives Telegram updates (admin replies inside per-visitor topics) and relays
// them to the visitor's browser via a Realtime broadcast. Authenticated with the
// secret token derived from the bot token.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (req.headers['x-telegram-bot-api-secret-token'] !== webhookSecret()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const msg = req.body?.message;
  const threadId = msg?.message_thread_id;
  const text: string | undefined = msg?.text;
  // Only handle human replies inside a topic; ignore bot echoes & service messages.
  if (!msg || msg.from?.is_bot || threadId == null || !text) {
    return res.status(200).json({ ok: true });
  }

  try {
    const channel = channelFor(threadId);
    if (text.trim().toLowerCase() === '/close') {
      await broadcast(channel, 'closed', {});
      await sendToTopic(threadId, '🔴 Chat closed. The visitor has been disconnected.');
      return res.status(200).json({ ok: true });
    }
    await broadcast(channel, 'admin_msg', { content: text, at: Date.now() });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telegram-webhook error:', err);
    return res.status(200).json({ ok: true }); // never make Telegram retry-storm
  }
}
