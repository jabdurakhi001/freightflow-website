import { clientIp, rateLimited, type VercelRequest, type VercelResponse } from '../../server/http';
import { admin, supabaseConfigured } from '../../server/supabaseAdmin';
import { createTopic, sendToTopic, telegramConfigured } from '../../server/telegram';

interface Transcript {
  role: 'user' | 'assistant';
  content: string;
}

// Opens a live human-handoff session: creates a Telegram topic for the visitor,
// records the session, and seeds the topic with the AI transcript so the admin
// has full context before replying.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (rateLimited(`start:${clientIp(req)}`, 5)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }
  if (!supabaseConfigured() || !telegramConfigured()) {
    return res.status(503).json({ error: 'Live chat is not configured.' });
  }

  const { name, contact, reason, transcript } = (req.body || {}) as {
    name?: string;
    contact?: string;
    reason?: string;
    transcript?: Transcript[];
  };

  const visitorName = (name || '').toString().slice(0, 80).trim() || 'Website visitor';
  const visitorContact = (contact || '').toString().slice(0, 120).trim();
  const history = Array.isArray(transcript) ? transcript.slice(-12) : [];

  try {
    const db = admin();

    const { data: session, error } = await db
      .from('ff_chat_sessions')
      .insert({
        name: visitorName,
        contact: visitorContact || null,
        reason: (reason || '').toString().slice(0, 300) || null,
      })
      .select('id')
      .single();
    if (error || !session) throw new Error(error?.message || 'Failed to create session');

    const shortId = session.id.slice(0, 8);
    const topicId = await createTopic(`💬 ${visitorName} · ${shortId}`);

    await db
      .from('ff_chat_sessions')
      .update({ topic_id: topicId, updated_at: new Date().toISOString() })
      .eq('id', session.id);

    // Persist the prior AI transcript for history/reconnect.
    if (history.length) {
      await db.from('ff_chat_messages').insert(
        history.map((m) => ({
          session_id: session.id,
          sender: m.role === 'user' ? 'visitor' : 'ai',
          content: (m.content || '').toString().slice(0, 2000),
        }))
      );
    }

    const transcriptText = history.length
      ? history.map((m) => `${m.role === 'user' ? '👤' : '🤖'} ${m.content}`).join('\n')
      : '(no prior messages)';

    await sendToTopic(
      topicId,
      [
        `🟢 New live chat — ${visitorName}`,
        visitorContact ? `📇 Contact: ${visitorContact}` : '📇 Contact: not provided',
        '',
        '— Conversation so far —',
        transcriptText,
        '',
        'ℹ️ Reply in this topic to talk to the visitor. Send /close to end the chat.',
      ].join('\n')
    );

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('live/start error:', err);
    return res.status(502).json({ error: 'Could not reach a live agent.' });
  }
}
