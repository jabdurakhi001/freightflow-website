import { createHash, createHmac } from 'node:crypto';

// Receives Telegram updates (admin replies inside per-visitor topics) and stores
// them keyed by the visitor's channel; the browser polls for them. Handles text,
// photos and documents. Self-contained so Vercel bundles it reliably.
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

async function postLive(channel: string, kind: 'msg' | 'closed' | 'image' | 'file', content: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ff_live_post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ p_channel: channel, p_kind: kind, p_content: content }),
  });
  if (!res.ok) throw new Error(`ff_live_post ${res.status} ${await res.text()}`);
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
  if (!msg || msg.from?.is_bot || threadId == null) {
    return res.status(200).json({ ok: true });
  }

  const text: string | undefined = msg.text;
  const caption: string | undefined = msg.caption;
  const photo: Array<{ file_id: string }> | undefined = msg.photo;
  const doc: { file_id: string; file_name?: string; mime_type?: string } | undefined = msg.document;

  try {
    const channel = channelFor(threadId);

    if (text && text.trim().toLowerCase() === '/close') {
      await postLive(channel, 'closed', '');
      await tgSend(threadId, '🔴 Chat closed. The visitor has been disconnected.');
      return res.status(200).json({ ok: true });
    }

    if (photo && photo.length) {
      await postLive(channel, 'image', photo[photo.length - 1].file_id);
      if (caption) await postLive(channel, 'msg', caption);
      return res.status(200).json({ ok: true });
    }

    if (doc) {
      const isImage = (doc.mime_type || '').startsWith('image/');
      await postLive(channel, isImage ? 'image' : 'file', `${doc.file_id}|${(doc.file_name || 'file').replace(/\|/g, ' ')}`);
      if (caption) await postLive(channel, 'msg', caption);
      return res.status(200).json({ ok: true });
    }

    if (text) {
      await postLive(channel, 'msg', text);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telegram-webhook error:', err);
    return res.status(200).json({ ok: true });
  }
}
