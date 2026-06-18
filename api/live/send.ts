import { createHmac } from 'node:crypto';

// Relays a visitor's message (while in live mode) into their Telegram topic. The
// channel acts as a capability token derived from the bot token, so only a browser
// that legitimately started the session can post here. Self-contained for bundling.
const GROUP_ID = process.env.TELEGRAM_GROUP_ID || '-1003961213794';
const token = () => process.env.TELEGRAM_BOT_TOKEN || '';
const channelFor = (t: number | string) =>
  'ff-' + createHmac('sha256', token()).update(`live:${t}`).digest('hex');

const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimited(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  const e = buckets.get(key);
  if (!e || now > e.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  e.count++;
  return e.count > limit;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(`send:${ip}`, 30)) {
    return res.status(429).json({ error: 'Too many messages. Please slow down.' });
  }
  if (!token()) return res.status(503).json({ error: 'Live chat is not configured.' });

  const { topicId, channel, content } = req.body || {};
  if (typeof topicId !== 'number' || !Number.isInteger(topicId) || channel !== channelFor(topicId)) {
    return res.status(403).json({ error: 'Invalid session.' });
  }
  const text = String(content || '').trim();
  if (!text || text.length > 2000) {
    return res.status(400).json({ error: 'Message is required (max 2000 chars).' });
  }

  try {
    await fetch(`https://api.telegram.org/bot${token()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: GROUP_ID, message_thread_id: topicId, text: `👤 ${text}`, disable_web_page_preview: true }),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('live/send error:', err);
    return res.status(502).json({ error: 'Message could not be delivered.' });
  }
}
