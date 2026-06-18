// Thin Telegram Bot API helpers shared by the live-chat serverless functions.

const API = (method: string) =>
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

export function telegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_GROUP_ID);
}

async function call<T = any>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API(method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!data.ok) {
    throw new Error(`Telegram ${method} failed: ${data.description || res.status}`);
  }
  return data.result as T;
}

/** Create a forum topic in the configured group; returns its message_thread_id. */
export async function createTopic(name: string): Promise<number> {
  const result = await call<{ message_thread_id: number }>('createForumTopic', {
    chat_id: process.env.TELEGRAM_GROUP_ID,
    name: name.slice(0, 128),
  });
  return result.message_thread_id;
}

/** Post a message into a specific forum topic. */
export async function sendToTopic(threadId: number, text: string): Promise<void> {
  await call('sendMessage', {
    chat_id: process.env.TELEGRAM_GROUP_ID,
    message_thread_id: threadId,
    text,
    disable_web_page_preview: true,
  });
}
