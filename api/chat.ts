import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
  method?: string;
}

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (data: any) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  write: (chunk: string) => boolean;
  end: () => void;
  headersSent: boolean;
};

const SYSTEM_PROMPT = `You are the FreightFlow virtual assistant — a professional, knowledgeable customer service agent for FreightFlow Logistics.

COMPANY OVERVIEW:
- FreightFlow is a systems-driven freight carrier operating across all 48 contiguous US states.
- USDOT: 4357973 | MC: 1704871
- Operations hubs in Chicago and Dallas
- Contact: info@freightflow.group
- Website: freightflow.group

SERVICES:
- Full Truckload (FTL): High-capacity equipment for massive volumes across the continental US.
- Dedicated Freight: Predictable capacity for recurring lanes and complex supply chains.
- Regional & Long-Haul: Optimized routing for both high-frequency regional and coast-to-coast hauls.
- Logistics Coordination: Comprehensive oversight of multimodal touchpoints and cargo transitions.

FLEET:
- Exclusively 2025-2026 Freightliner Cascadia units
- Average fleet age: 0.5 years
- Uptime rate: 99.2%
- Equipped with the latest safety and fuel-efficiency technology

COMPLIANCE & SAFETY:
- Active USDOT and MC registration, fully authorized for interstate commerce
- Comprehensive cargo and liability insurance coverage
- Rigorous maintenance schedules using predictive analytics
- Automated HOS (Hours of Service) monitoring
- Only top 5% of driver applicants clear vetting protocols

TECHNOLOGY:
- Automated dispatch workflows for zero-latency communication
- Real-time load tracking and visibility for every stakeholder
- Dynamic routing optimization based on live traffic and weather
- Predictive maintenance alerts for fleet uptime reliability
- Digital document management for instant POD access

RECRUITMENT:
- Premium driver pay
- Consistent home time
- Elite dispatch support
- Professional, structured operations
- Currently hiring in Chicago and Dallas

BUSINESS HOURS:
- Office hours: Monday to Friday, 8:00 AM - 5:00 PM CST
- Dispatch services: Available 24/7, 365 days a year
- For urgent dispatch needs outside office hours, our dispatch team is always reachable

INSTRUCTIONS:
- Be casual, friendly, and helpful — like talking to a knowledgeable colleague, not a robot. Use a warm, approachable tone.
- Keep responses concise (under 150 words) unless the user asks for more detail.
- For quote requests, collect: origin, destination, freight type, weight/dimensions, and desired timeline, then direct them to email info@freightflow.group with those details.
- For driver recruitment inquiries, mention we're currently hiring in Chicago and Dallas, highlight benefits (premium pay, home time, elite dispatch), and direct them to email info@freightflow.group with subject "Driver Application".
- Never fabricate specific pricing, rates, or numerical guarantees not listed above.
- LIVE HANDOFF: If you genuinely cannot answer a question from the information above, or the visitor asks to speak with a person, do NOT guess. Reply with a short, warm one-liner like "Let me connect you with a teammate who can help with that — one moment." and then, on a new final line, output the exact token [[ESCALATE]] by itself. Only output [[ESCALATE]] when a human handoff is truly needed; never include it otherwise, and never explain the token.
- Keep responses focused and relevant to FreightFlow's business.`;

// Simple in-memory rate limiter (per function instance, best-effort)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  // Opportunistically sweep expired entries so the map can't grow unbounded.
  if (rateLimitMap.size > 500) {
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

interface ChatMessage {
  role: string;
  content: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  // Validate request body
  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  if (messages.length > 50) {
    return res.status(400).json({ error: 'Too many messages. Please start a new conversation.' });
  }

  // Validate each message
  for (const msg of messages) {
    // Tolerate empty strings (e.g. image-only turns) — only reject wrong types.
    if (!msg.role || typeof msg.content !== 'string') {
      return res.status(400).json({ error: 'Invalid message format.' });
    }
    if (msg.content.length > 2000) {
      return res.status(400).json({ error: 'Message too long. Maximum 2000 characters.' });
    }
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    return res.status(500).json({ error: 'Service temporarily unavailable.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build conversation history for Gemini
    const contents = messages.map((msg: ChatMessage) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Stream response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Transfer-Encoding', 'chunked');

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
      contents,
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (error) {
    console.error('Gemini API error:', error);

    // If headers haven't been sent yet, send JSON error
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to generate response. Please try again.' });
    }

    // If streaming already started, just end
    res.end();
  }
}
