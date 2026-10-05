import { Mail, MapPin } from 'lucide-react';
import { COMPANY, NAV } from '../../content';
import { ShieldMark } from '../ui/Signs';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-sign-ink text-white">
      {/* Ground line the final sign's posts stand on */}
      <div aria-hidden="true" className="h-2 bg-[#0f1512]" />
      <div className="mx-auto max-w-7xl px-5 pb-28 pt-16 sm:px-8 lg:pb-12">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <a href="#top" className="inline-flex items-center gap-3" aria-label="FreightFlow — back to top">
              <ShieldMark className="h-12 w-11" />
              <span className="text-2xl font-black tracking-[-0.03em]">FreightFlow</span>
            </a>
            <p className="mt-5 max-w-sm leading-relaxed text-white/70">
              Full-truckload carrier running new Freightliner Cascadias across the lower 48 — dispatched, tracked and
              verified end to end.
            </p>
            <ul className="mt-6 space-y-3 text-white/85">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-cone" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-white hover:underline">
                  {COMPANY.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-cone" />
                Dispatch hub: {COMPANY.hub}
              </li>
            </ul>
          </div>

          <nav aria-label="Footer">
            <h2 className="legend text-white/55">Site</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 md:grid-cols-1">
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="font-semibold text-white/80 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="legend text-white/55">Authority</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-baseline gap-3">
                <dt className="legend w-16 text-cone">USDOT</dt>
                <dd className="text-xl font-black tabular-nums">{COMPANY.usdot}</dd>
              </div>
              <div className="flex items-baseline gap-3">
                <dt className="legend w-16 text-cone">MC</dt>
                <dd className="text-xl font-black tabular-nums">{COMPANY.mc}</dd>
              </div>
            </dl>
            <a
              href={COMPANY.saferUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-bold text-white/75 underline underline-offset-4 hover:text-white"
            >
              Verify on FMCSA SAFER
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-7 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {COMPANY.name}. All rights reserved.</p>
          <ul className="flex gap-6">
            <li><a href="/privacy.html" className="hover:text-white">Privacy</a></li>
            <li><a href="/terms.html" className="hover:text-white">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
