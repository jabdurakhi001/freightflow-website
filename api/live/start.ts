import { clientIp, rateLimited, type VercelRequest, type VercelResponse } from '../../server/http';
import { channelFor, telegramReady } from '../../server/config';
import { createTopic, sendToTopic } from '../../server/telegram';

interface Transcript {
  role: 'user' | 'assistant';
  content: string;
}

// Opens a live human-handoff session: creates a Telegram topic for the visitor,
// seeded with the AI transcript, and returns the topic id + the private broadcast
// channel the browser should subscribe to. No database — the Telegram topic is the
// conversation record.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (rateLimited(`start:${clientIp(req)}`, 5)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }
  if (!telegramReady()) {
    return res.status(503).json({ error: 'Live chat is not configured.' });
  }

  const { name, contact, reason, transcript } = (req.body || {}) as {
    name?: string;
    contact?: string;
    reason?: string;
    transcript?: Transcript[];
  };

  const visitorName = String(name || '').slice(0, 80).trim() || 'Website visitor';
  const visitorContact = String(contact || '').slice(0, 120).trim();
  const history = Array.isArray(transcript) ? transcript.slice(-12) : [];

  try {
    const topicId = await createTopic(`💬 ${visitorName}`);

    const transcriptText = history.length
      ? history.map((m) => `${m.role === 'user' ? '👤' : '🤖'} ${m.content}`).join('\n')
      : '(no prior messages)';

    await sendToTopic(
      topicId,
      [
        `🟢 New live chat — ${visitorName}`,
        visitorContact ? `📇 Contact: ${visitorContact}` : '📇 Contact: not provided',
        reason ? `❓ ${String(reason).slice(0, 300)}` : '',
        '',
        '— Conversation so far —',
        transcriptText,
        '',
        'ℹ️ Reply in this topic to talk to the visitor. Send /close to end the chat.',
      ]
        .filter(Boolean)
        .join('\n')
    );

    return res.status(200).json({ topicId, channel: channelFor(topicId) });
  } catch (err) {
    console.error('live/start error:', err);
    return res.status(502).json({ error: 'Could not reach a live agent.' });
  }
}
