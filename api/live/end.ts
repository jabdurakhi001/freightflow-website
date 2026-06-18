import { createHmac } from 'node:crypto';

// Lets the visitor end the live session: notifies and closes the Telegram topic.
const GROUP_ID = process.env.TELEGRAM_GROUP_ID || '-1003961213794';
const token = () => process.env.TELEGRAM_BOT_TOKEN || '';
const channelFor = (t: number | string) =>
  'ff-' + createHmac('sha256', token()).update(`live:${t}`).digest('hex');

async function tg(method: string, body: Record<string, unknown>) {
  await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { topicId, channel } = req.body || {};
  if (typeof topicId !== 'number' || !Number.isInteger(topicId) || channel !== channelFor(topicId)) {
    return res.status(403).json({ error: 'Invalid session.' });
  }
  try {
    await tg('sendMessage', {
      chat_id: GROUP_ID,
      message_thread_id: topicId,
      text: '🔴 The visitor ended the chat.',
    });
    await tg('closeForumTopic', { chat_id: GROUP_ID, message_thread_id: topicId });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('live/end error:', err);
    return res.status(200).json({ ok: true });
  }
}
