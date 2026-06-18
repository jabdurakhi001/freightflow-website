import { createHmac } from 'node:crypto';

// Opens a live human-handoff session: creates a Telegram topic seeded with the AI
// transcript and returns the topic id + the private broadcast channel for the
// browser to subscribe to. Self-contained so Vercel bundles it reliably.
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

async function tg(method: string, body: Record<string, unknown>) {
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d: any = await r.json();
  if (!d.ok) throw new Error(`Telegram ${method}: ${d.description || r.status}`);
  return d.result;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(`start:${ip}`, 5)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }
  if (!token()) return res.status(503).json({ error: 'Live chat is not configured.' });

  const { name, contact, reason, transcript } = req.body || {};
  const visitorName = String(name || '').slice(0, 80).trim() || 'Website visitor';
  const visitorContact = String(contact || '').slice(0, 120).trim();
  const history: Array<{ role: string; content: string }> = Array.isArray(transcript) ? transcript.slice(-12) : [];

  try {
    const topic = await tg('createForumTopic', { chat_id: GROUP_ID, name: `💬 ${visitorName}`.slice(0, 128) });
    const topicId: number = topic.message_thread_id;

    const transcriptText = history.length
      ? history.map((m) => `${m.role === 'user' ? '👤' : '🤖'} ${m.content}`).join('\n')
      : '(no prior messages)';

    await tg('sendMessage', {
      chat_id: GROUP_ID,
      message_thread_id: topicId,
      disable_web_page_preview: true,
      text: [
        `🟢 New live chat — ${visitorName}`,
        visitorContact ? `📇 Contact: ${visitorContact}` : '📇 Contact: not provided',
        reason ? `❓ ${String(reason).slice(0, 300)}` : '',
        '',
        '— Conversation so far —',
        transcriptText,
        '',
        'ℹ️ Reply in this topic to talk to the visitor. Send /close to end the chat.',
      ]
        .filter(Boolean)
        .join('\n'),
    });

    return res.status(200).json({ topicId, channel: channelFor(topicId) });
  } catch (err) {
    console.error('live/start error:', err);
    return res.status(502).json({ error: 'Could not reach a live agent.' });
  }
}
