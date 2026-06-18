import { createHash, createHmac } from 'node:crypto';

// Receives Telegram updates (admin replies inside per-visitor topics) and relays
// them to the visitor's browser via a Realtime broadcast. Self-contained so Vercel
// bundles it reliably.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wzadveihdtlboymltjkh.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6YWR2ZWloZHRsYm95bWx0amtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTk1MzMsImV4cCI6MjA4NjQzNTUzM30.SBpTABNgcyYqXbqHLqIHzb9BQ6W2f9MAFv3IoylPsCo';
const GROUP_ID = process.env.TELEGRAM_GROUP_ID || '-1003961213794';
const token = () => process.env.TELEGRAM_BOT_TOKEN || '';
const webhookSecret = () => createHash('sha256').update(`${token()}:ff-webhook`).digest('hex');
const channelFor = (t: number | string) =>
  'ff-' + createHmac('sha256', token()).update(`live:${t}`).digest('hex');

async function tgSend(threadId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${token()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: GROUP_ID, message_thread_id: threadId, text, disable_web_page_preview: true }),
  });
}

async function broadcast(channel: string, event: string, payload: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ messages: [{ topic: channel, event, payload, private: false }] }),
  });
  if (!res.ok) throw new Error(`broadcast ${res.status}`);
}

export default async function handler(req: any, res: any) {
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
  if (!msg || msg.from?.is_bot || threadId == null || !text) {
    return res.status(200).json({ ok: true });
  }

  try {
    const channel = channelFor(threadId);
    console.log('FFLIVE_HOOK', JSON.stringify({ threadId, channel, text: text.slice(0, 24) }));
    if (text.trim().toLowerCase() === '/close') {
      await broadcast(channel, 'closed', {});
      await tgSend(threadId, '🔴 Chat closed. The visitor has been disconnected.');
      return res.status(200).json({ ok: true });
    }
    await broadcast(channel, 'admin_msg', { content: text, at: Date.now() });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telegram-webhook error:', err);
    return res.status(200).json({ ok: true });
  }
}
