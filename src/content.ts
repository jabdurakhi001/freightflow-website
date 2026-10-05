/**
 * Facts the site states about FreightFlow, in one place. Everything here was
 * already published on the previous site; don't add claims (stats, testimonials,
 * coverage numbers) that the business hasn't confirmed.
 */
export const COMPANY = {
  name: 'FreightFlow Logistics',
  email: 'info@freightflow.group',
  usdot: '4357973',
  mc: '1704871',
  hub: 'Chicago',
  hours: 'Mon–Fri, 8 AM–5 PM CST',
  applyUrl: 'https://app.freightflow.group/apply',
  /** FMCSA SAFER company snapshot, so visitors can verify the authority themselves. */
  saferUrl:
    'https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=4357973',
};

export const NAV = [
  { href: '#services', label: 'Services' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#compliance', label: 'Compliance' },
  { href: '#fleet', label: 'Fleet' },
  { href: '#drivers', label: 'Drivers' },
  { href: '#faq', label: 'FAQ' },
] as const;

/** Opens the chat widget from anywhere on the page. */
export const openChat = () => window.dispatchEvent(new Event('ff:open-chat'));
