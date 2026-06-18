import { clientIp, rateLimited, type VercelRequest, type VercelResponse } from '../../server/http';
import { channelFor, telegramReady } from '../../server/config';
import { sendToTopic } from '../../server/telegram';

// Relays a visitor's message (while in live mode) into their Telegram topic. The
// channel acts as a capability token: it's derived from the bot token, so only a
// browser that legitimately started the session (and received it) can post here.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (rateLimited(`send:${clientIp(req)}`, 30)) {
    return res.status(429).json({ error: 'Too many messages. Please slow down.' });
  }
  if (!telegramReady()) {
    return res.status(503).json({ error: 'Live chat is not configured.' });
  }

  const { topicId, channel, content } = (req.body || {}) as {
    topicId?: number;
    channel?: string;
    content?: string;
  };

  if (typeof topicId !== 'number' || !Number.isInteger(topicId) || channel !== channelFor(topicId)) {
    return res.status(403).json({ error: 'Invalid session.' });
  }
  const text = String(content || '').trim();
  if (!text || text.length > 2000) {
    return res.status(400).json({ error: 'Message is required (max 2000 chars).' });
  }

  try {
    await sendToTopic(topicId, `👤 ${text}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('live/send error:', err);
    return res.status(502).json({ error: 'Message could not be delivered.' });
  }
}
