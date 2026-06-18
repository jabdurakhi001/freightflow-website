import { createHash } from 'node:crypto';

// One-time, secret-guarded helper to register the Telegram webhook from the browser
// without handling the bot token or running curl. The required ?secret is derived
// from the bot token: sha256(token + ':ff-webhook').
const webhookSecret = () =>
  createHash('sha256').update(`${process.env.TELEGRAM_BOT_TOKEN || ''}:ff-webhook`).digest('hex');

export default async function handler(req: any, res: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is not set.' });

  const expected = webhookSecret();
  const provided = (req.query?.secret as string) || (req.body?.secret as string);
  if (provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized — wrong or missing ?secret.' });
  }

  const api = (method: string) => `https://api.telegram.org/bot${token}/${method}`;
  const action = (req.query?.action as string) || 'webhook';
  const GROUP_ID = process.env.TELEGRAM_GROUP_ID || '-1003961213794';

  try {
    if (action === 'chatinfo') {
      const chat = (req.query?.chat as string) || GROUP_ID;
      const data = await (await fetch(api('getChat') + `?chat_id=${encodeURIComponent(chat)}`)).json();
      return res.status(200).json({
        ok: data.ok,
        checked: chat,
        id: data.result?.id,
        title: data.result?.title,
        type: data.result?.type,
        is_forum: data.result?.is_forum ?? false,
        error: data.description,
      });
    }

    if (action === 'updates') {
      const data = await (await fetch(api('getUpdates'))).json();
      const chats = new Map<number, { id: number; type: string; title: string }>();
      for (const u of data.result || []) {
        const c = u.message?.chat || u.my_chat_member?.chat || u.channel_post?.chat;
        if (c) chats.set(c.id, { id: c.id, type: c.type, title: c.title || c.username || '' });
      }
      return res.status(200).json({ ok: data.ok, chats: [...chats.values()], note: data.description });
    }

    const set = await (
      await fetch(api('setWebhook'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://freightflow.group/api/telegram-webhook',
          secret_token: expected,
          allowed_updates: ['message'],
          drop_pending_updates: true,
        }),
      })
    ).json();
    const info = await (await fetch(api('getWebhookInfo'))).json();
    const me = await (await fetch(api('getMe'))).json();

    return res.status(200).json({
      done: set.ok === true,
      message: set.ok
        ? `Webhook registered for @${me.result?.username}. Live chat is ready.`
        : `Telegram rejected the webhook: ${set.description}`,
      webhookInfo: info.result,
      bot: me.result ? { id: me.result.id, username: me.result.username } : null,
    });
  } catch (err) {
    return res.status(502).json({ error: `Telegram request failed: ${String(err)}` });
  }
}
