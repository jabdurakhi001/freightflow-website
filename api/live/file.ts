// Streams a Telegram file (admin-sent photo/document) to the visitor's browser
// without ever exposing the bot token (Telegram's file URLs embed it). Validates
// that the file_id actually belongs to the requesting channel.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wzadveihdtlboymltjkh.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6YWR2ZWloZHRsYm95bWx0amtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTk1MzMsImV4cCI6MjA4NjQzNTUzM30.SBpTABNgcyYqXbqHLqIHzb9BQ6W2f9MAFv3IoylPsCo';
const token = () => process.env.TELEGRAM_BOT_TOKEN || '';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', heic: 'image/heic', pdf: 'application/pdf',
};

export default async function handler(req: any, res: any) {
  const channel = String(req.query?.channel || '');
  const fileId = String(req.query?.id || '');
  if (!/^ff-[0-9a-f]{16,}$/.test(channel) || !fileId) {
    return res.status(400).json({ error: 'Bad request' });
  }

  try {
    // Verify this file belongs to this channel.
    const check = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ff_live_has_file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ p_channel: channel, p_file: fileId }),
    });
    // Fail closed: an RPC error body is truthy JSON, so it must never pass the gate.
    if (!check.ok) return res.status(502).json({ error: 'Could not verify file' });
    const allowed = await check.json();
    if (allowed !== true) return res.status(404).json({ error: 'Not found' });

    const info = await (await fetch(`https://api.telegram.org/bot${token()}/getFile?file_id=${encodeURIComponent(fileId)}`)).json();
    const filePath: string | undefined = info?.result?.file_path;
    if (!filePath) return res.status(404).json({ error: 'Not found' });

    const fileRes = await fetch(`https://api.telegram.org/file/bot${token()}/${filePath}`);
    if (!fileRes.ok) return res.status(502).json({ error: 'Fetch failed' });

    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const buf = Buffer.from(await fileRes.arrayBuffer());
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.end(buf);
  } catch (err) {
    console.error('live/file error:', err);
    return res.status(502).json({ error: 'Could not load file' });
  }
}
