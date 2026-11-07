import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPANY, FAQS } from './content';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');

describe('index.html (works without JavaScript)', () => {
  it('ships FAQPage JSON-LD that matches the FAQs on the page', () => {
    const m = html.match(/<script type="application\/ld\+json" id="faq-jsonld">([\s\S]*?)<\/script>/);
    expect(m).not.toBeNull();
    const ld = JSON.parse(m![1]);
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity.map((e: { name: string; acceptedAnswer: { text: string } }) => [e.name, e.acceptedAnswer.text])).toEqual(
      FAQS.map((f) => [f.q, f.a]),
    );
  });

  it('has a noscript fallback with the contact and authority facts', () => {
    const ns = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? '';
    for (const fact of [COMPANY.email, COMPANY.usdot, COMPANY.mc, COMPANY.applyUrl, '/privacy.html', '/terms.html']) {
      expect(ns).toContain(fact);
    }
  });
});
