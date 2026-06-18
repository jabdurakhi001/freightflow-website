import type { VercelRequest, VercelResponse } from '../server/http';

// One-time, secret-guarded helper so the site owner never has to handle the bot
// token or run curl. Uses the TELEGRAM_BOT_TOKEN already in the environment.
//   • /api/telegram-setup?secret=…&action=updates  → list recent chats (find group id)
//   • /api/telegram-setup?secret=…                  → register the webhook
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const provided = (req.query?.secret as string) || (req.body?.secret as string);

  if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is not set.' });
  if (!secret || provided !== secret) {
    return res.status(401).json({ error: 'Unauthorized — add ?secret=<TELEGRAM_WEBHOOK_SECRET>.' });
  }

  const api = (method: string) => `https://api.telegram.org/bot${token}/${method}`;
  const action = (req.query?.action as string) || 'webhook';

  try {
    if (action === 'updates') {
      const data = await (await fetch(api('getUpdates'))).json();
      const chats = new Map<number, { id: number; type: string; title: string }>();
      for (const u of data.result || []) {
        const c = u.message?.chat || u.my_chat_member?.chat || u.channel_post?.chat;
        if (c) chats.set(c.id, { id: c.id, type: c.type, title: c.title || c.username || '' });
      }
      return res.status(200).json({
        ok: data.ok,
        hint: 'Copy the negative -100… id of your group into the TELEGRAM_GROUP_ID env var. (If empty, send a message in the group first. If you see a 409 conflict, the webhook is already set — delete it to use this.)',
        chats: [...chats.values()],
        note: data.description,
      });
    }

    const webhookUrl = 'https://freightflow.group/api/telegram-webhook';
    const set = await (
      await fetch(api('setWebhook'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secret,
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
        ? `Webhook registered for @${me.result?.username}. Live chat is ready — send a test from the website.`
        : `Telegram rejected the webhook: ${set.description}`,
      setWebhook: set,
      webhookInfo: info.result,
      bot: me.result ? { id: me.result.id, username: me.result.username } : null,
    });
  } catch (err) {
    return res.status(502).json({ error: `Telegram request failed: ${String(err)}` });
  }
}
