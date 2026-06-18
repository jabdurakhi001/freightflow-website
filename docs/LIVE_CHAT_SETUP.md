# Live Chat (AI → human handoff via Telegram)

The chat widget answers with AI and, when it can't help (or the visitor taps
"Talk to a human"), opens a live session: a per-visitor **topic** is created in a
Telegram group, the admin replies from Telegram, and those replies stream back to
the visitor's browser over Supabase Realtime.

## Required environment variables (Vercel → Settings → Environment Variables, Production)

| Name | Purpose |
|------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot API token (already set for the notify feature) |
| `TELEGRAM_GROUP_ID` | The `-100…` id of the Telegram **supergroup** (Topics enabled) |
| `TELEGRAM_WEBHOOK_SECRET` | Random string; also passed to `setWebhook` |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role secret (Supabase → Settings → API) — server only |
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL`, exposed to the browser at build time |
| `VITE_SUPABASE_ANON_KEY` | Public anon key (Supabase → Settings → API) |

> Env-var changes only apply to **new** deployments — redeploy after editing them.

## Telegram group requirements

- A **supergroup** with **Topics** enabled.
- The bot added as an **Admin** with **Manage Topics**.

## One-time webhook registration

After the env vars are set and the site is redeployed, open once in a browser:

```
https://freightflow.group/api/telegram-setup?secret=<TELEGRAM_WEBHOOK_SECRET>
```

This registers the Telegram webhook (`/api/telegram-webhook`) using the bot token
from the environment. Use `…&action=updates` to list recent chats when looking up
the group id.

## Data

Conversations are stored in the RLS-locked `ff_chat_sessions` / `ff_chat_messages`
tables. All runtime access is server-side via the service-role key; the browser
only subscribes to an unguessable Realtime broadcast channel.
