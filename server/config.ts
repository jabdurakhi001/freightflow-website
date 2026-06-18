import { createHash, createHmac } from 'node:crypto';

// Non-secret, public configuration. The anon key is designed to be public, and the
// group id / project URL are not sensitive — safe to keep in source. The bot token
// is read from the environment (never committed) and is used to DERIVE the webhook
// secret and per-topic channel names at runtime, so no extra secrets are needed.
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wzadveihdtlboymltjkh.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6YWR2ZWloZHRsYm95bWx0amtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTk1MzMsImV4cCI6MjA4NjQzNTUzM30.SBpTABNgcyYqXbqHLqIHzb9BQ6W2f9MAFv3IoylPsCo';
export const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID || '-1003961213794';

function botToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || '';
}

export function telegramReady(): boolean {
  return botToken().length > 0;
}

/** Telegram webhook secret_token, derived from the bot token (never stored). */
export function webhookSecret(): string {
  return createHash('sha256').update(`${botToken()}:ff-webhook`).digest('hex');
}

/**
 * Per-topic broadcast channel name. Keyed by the bot token via HMAC, so it can't be
 * guessed from the (small-integer) topic id alone — preventing eavesdropping on a
 * visitor's live chat.
 */
export function channelFor(topicId: number | string): string {
  return 'ff-' + createHmac('sha256', botToken()).update(`live:${topicId}`).digest('hex');
}
