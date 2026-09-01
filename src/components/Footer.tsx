import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-primary pt-20 pb-12 max-xl:pb-28 text-white grain overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12 mb-16">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="text-2xl font-black tracking-tighter mb-6">Freight<span className="gradient-text">Flow</span></div>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
              A systems-driven freight carrier running new Freightliner Cascadias across the lower 48 — dispatched, tracked, and verified end to end.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Mail className="text-secondary w-4 h-4" />
                <span className="text-sm text-white/80">info@freightflow.group</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-secondary w-4 h-4" />
                <span className="text-sm text-white/80">Operations Hubs: Chicago &amp; Dallas</span>
              </div>
            </div>
            <div className="mono-label flex flex-col gap-2 !text-[0.6875rem] text-secondary">
              <span>USDOT 4357973</span>
              <span>MC 1704871</span>
            </div>
          </div>

          <div>
            <h3 className="mono-label text-white/50 mb-6">Company</h3>
            <nav className="flex flex-col">
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="#compliance">Compliance</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="#fleet">Our Fleet</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="#recruitment">Careers</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="mailto:info@freightflow.group">Contact</a>
            </nav>
          </div>

          <div>
            <h3 className="mono-label text-white/50 mb-6">Services</h3>
            <nav className="flex flex-col">
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="#solutions">Full Truckload</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="#solutions">Dedicated Freight</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="#solutions">Regional Haul</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="#solutions">Logistics</a>
            </nav>
          </div>

          <div>
            <h3 className="mono-label text-white/50 mb-6">Legal</h3>
            <nav className="flex flex-col">
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="/privacy.html">Privacy Policy</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="/terms.html">Terms of Service</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors py-2" href="#compliance">FMCSA Compliance</a>
            </nav>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between md:items-center gap-4 text-white/50 mono-label">
          <span>© {new Date().getFullYear()} FreightFlow Logistics. All Rights Reserved.</span>
          <span className="hidden md:inline">Engineered for Reliability · Systems First</span>
        </div>
      </div>
    </footer>
  );
}
