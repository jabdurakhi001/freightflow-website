// Scheduled keep-alive: pings the Supabase database on a cron so the project never
// idles out and pauses (which silently breaks the live-chat admin->visitor relay).
// It issues one cheap read via the existing ff_live_poll RPC — no data is written.
// Wired to a daily Vercel cron in vercel.json; also callable manually for a health check.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wzadveihdtlboymltjkh.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6YWR2ZWloZHRsYm95bWx0amtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTk1MzMsImV4cCI6MjA4NjQzNTUzM30.SBpTABNgcyYqXbqHLqIHzb9BQ6W2f9MAFv3IoylPsCo';

export default async function handler(_req: any, res: any) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ff_live_poll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      // Dummy channel with no rows — the point is only to touch Postgres so it stays warm.
      body: JSON.stringify({ p_channel: 'keepalive', p_after: 0 }),
    });
    return res.status(200).json({ ok: r.ok, db: r.status });
  } catch (err) {
    return res.status(200).json({ ok: false, error: String(err) });
  }
}
