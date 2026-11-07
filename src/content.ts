/**
 * Facts and copy the site states about FreightFlow, in one place. Everything here was
 * already published on the previous site or approved with the Flow redesign; don't add
 * claims (stats, testimonials, coverage numbers) that the business hasn't confirmed.
 *
 * How the AI works, stated the same way everywhere: AI agents match loads to trucks and
 * drivers and propose the assignment; a dispatcher reviews and approves every one.
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
  { href: '#platform', label: 'Platform' },
  { href: '#compliance', label: 'Compliance' },
  { href: '#fleet', label: 'Fleet' },
  { href: '#drivers', label: 'Drivers' },
  { href: '#faq', label: 'FAQ' },
] as const;

/** Opens the chat widget from anywhere on the page. */
export const openChat = () => window.dispatchEvent(new Event('ff:open-chat'));

export const HERO = {
  lede: '53′ dry vans behind 2025–2027 Freightliner Cascadias, dispatched from our Chicago hub on a platform we built and run ourselves.',
  laneQuestion: 'How far is your lane?',
  method:
    'An estimate, not a quote: straight-line distance times 1.2 for roads, at about 500 miles a day for one driver within hours-of-service limits.',
};

export const SERVICES = [
  { title: 'Full truckload', tag: '53′ dry van', body: 'One shipper, one trailer, dock to dock. Your freight rides alone from pickup to delivery.' },
  { title: 'Dedicated capacity', tag: 'Recurring lanes', body: 'Committed trucks on the lanes you run every week, so capacity is planned, not hunted for.' },
  { title: 'Regional and long-haul', tag: 'Coast to coast', body: 'High-frequency regional runs and cross-country hauls, routed out of our Chicago hub.' },
  { title: 'Logistics coordination', tag: 'One desk', body: 'Appointments, multi-stop loads and multimodal handoffs coordinated from a single dispatch desk.' },
];

export const HOW = {
  title: 'Software proposes. A dispatcher approves.',
  lede: 'Our AI agents match each load to an available truck and driver and propose the assignment. A dispatcher reviews and approves every one before the truck moves.',
  steps: [
    { title: 'Request a quote', body: 'Send the lane, dates and equipment. The dispatch desk answers during business hours.' },
    { title: 'Matched by AI agents', body: 'Our AI agents match your load to an available truck and driver and propose the assignment.' },
    { title: 'Approved by a dispatcher', body: 'A dispatcher reviews and approves every assignment before the truck rolls.', human: true },
    { title: 'Dispatched and tracked', body: 'GPS tracking and milestone updates from the moment the truck checks in at pickup.' },
    { title: 'Delivered, POD in hand', body: 'Digital proof of delivery as soon as the consignee signs. No chasing paperwork.' },
  ],
};

export const PLATFORM = [
  { title: 'AI agents that match and assign', body: 'Agents match each load to the right truck and driver and propose the assignment. A dispatcher approves every one before it moves.' },
  { title: 'Live GPS tracking', body: 'Live GPS and milestone updates for everyone who needs to know where the freight is.' },
  { title: 'Digital proof of delivery', body: 'Load documents and proof of delivery stored digitally and available the moment you need them.' },
  { title: 'Routing for conditions', body: 'Routes planned around live traffic and weather, not last year’s map.' },
  { title: 'Maintenance on schedule', body: 'Data-driven service intervals that protect uptime on every truck.' },
  { title: 'Our own dispatch platform', body: 'Loads, trucks, drivers and documents in one system we run ourselves. No phone tag, no waiting on callbacks.' },
];

export const PRACTICES = [
  { title: 'Fully insured', body: 'Cargo and liability coverage on every load we haul.' },
  { title: 'Qualified drivers', body: 'Every driver clears safety and qualification vetting before a first dispatch.' },
  { title: 'Hours of service watched', body: 'Dispatch monitors HOS on every run to head off violations before they happen.' },
  { title: 'Maintained on schedule', body: 'Preventive, data-driven maintenance keeps trucks on the road and off the shoulder.' },
];

export const FLEET_SPECS = [
  { k: 'Tractor', v: 'Freightliner Cascadia' },
  { k: 'Model years', v: '2025–2027 only' },
  { k: 'Trailer', v: '53′ dry van' },
  { k: 'Telematics', v: 'GPS and ELD on every unit' },
  { k: 'Maintenance', v: 'Preventive, on a data-driven schedule' },
];

export const DRIVER_BENEFITS = [
  { title: 'Premium pay', body: 'Competitive per-mile rates that respect professional experience.' },
  { title: 'Planned home time', body: 'Structured scheduling out of Chicago. Planned, not promised.' },
  { title: 'One dispatcher', body: 'A dedicated dispatcher who answers, plans ahead and has your back.' },
  { title: 'New equipment', body: '2025–2027 Freightliner Cascadias only. No worn-out trucks.' },
];

export const FAQS = [
  {
    q: 'Where do you run?',
    a: 'All 48 contiguous states. Trucks are dispatched from our Chicago hub, covering high-frequency regional lanes and coast-to-coast long-haul.',
  },
  {
    q: 'What equipment do you operate?',
    a: '2025–2027 Freightliner Cascadia tractors pulling 53′ dry vans, maintained on a preventive, data-driven schedule.',
  },
  {
    q: 'Can I track my load?',
    a: 'Yes. Every load has live GPS tracking with automated milestone updates from pickup to delivery, and digital proof of delivery as soon as it is signed.',
  },
  {
    q: 'How do your AI agents work?',
    a: 'Our agents match each load to an available truck and driver and propose the assignment. A dispatcher reviews and approves every assignment before the truck moves.',
  },
  {
    q: 'Are you licensed and insured?',
    a: `Yes. We hold active USDOT (${COMPANY.usdot}) and MC (${COMPANY.mc}) authority for interstate commerce, with cargo and liability coverage. You can verify our authority on FMCSA SAFER.`,
    link: { href: COMPANY.saferUrl, label: 'Open the SAFER snapshot', external: true },
  },
  {
    q: 'How fast will I get a quote?',
    a: `Send your lane through the quote form and our dispatch desk will respond during business hours (${COMPANY.hours}). Our systems support active loads around the clock.`,
  },
  {
    q: 'Are you hiring drivers?',
    a: 'Yes. CDL-A drivers around Chicago. We offer competitive per-mile pay, planned home time, a dedicated dispatcher and new equipment.',
    link: { href: COMPANY.applyUrl, label: 'Apply to drive', external: false },
  },
];
