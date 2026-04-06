import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body?: any;
  method?: string;
}

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (data: any) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  headersSent: boolean;
};

// Rate limit: max 5 notifications per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 5;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait.' });
  }

  const { name, contact, question } = req.body || {};

  if (!question || typeof question !== 'string' || question.length > 2000) {
    return res.status(400).json({ error: 'A question is required (max 2000 chars).' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Telegram credentials not configured');
    return res.status(500).json({ error: 'Notification service unavailable.' });
  }

  const message = [
    '📩 *New FreightFlow Website Inquiry*',
    '',
    `*From:* ${name || 'Not provided'}`,
    `*Contact:* ${contact || 'Not provided'}`,
    '',
    `*Question:*`,
    question,
    '',
    `_Sent from FreightFlow AI Chat_`,
  ].join('\n');

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!telegramResponse.ok) {
      const err = await telegramResponse.text();
      console.error('Telegram API error:', err);
      return res.status(500).json({ error: 'Failed to send notification.' });
    }

    return res.status(200).json({ success: true, message: 'Your question has been forwarded to our team.' });
  } catch (error) {
    console.error('Telegram send error:', error);
    return res.status(500).json({ error: 'Failed to send notification.' });
  }
}
