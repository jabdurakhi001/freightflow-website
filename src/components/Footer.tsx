import { Mail, MapPin, Linkedin, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary pt-20 pb-12 text-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="text-2xl font-black text-white tracking-tighter mb-6">FreightFlow</div>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
              Executive logistics and heavy infrastructure for the modern era. We engineer reliability through systems-driven transport.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Mail className="text-secondary w-4 h-4" />
                <span className="text-sm text-white/80">info@freightflow.group</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-secondary w-4 h-4" />
                <span className="text-sm text-white/80">Midwest Operations Center</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs font-bold tracking-widest text-secondary">
              <span>USDOT 4357973</span>
              <span>MC 1704871</span>
            </div>
            <div className="flex gap-4 mt-8">
              <a href="#" className="text-white/40 hover:text-secondary transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-secondary transition-colors" aria-label="X (Twitter)">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-secondary transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-secondary transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Company</h4>
            <nav className="flex flex-col gap-4">
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#compliance">About Us</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#fleet">Our Fleet</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#recruitment">Careers</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="mailto:info@freightflow.group">Contact</a>
            </nav>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Services</h4>
            <nav className="flex flex-col gap-4">
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#solutions">Full Truckload</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#solutions">Dedicated Freight</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#solutions">Regional Haul</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#solutions">Logistics</a>
            </nav>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Legal</h4>
            <nav className="flex flex-col gap-4">
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#">Privacy Policy</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#">Terms of Service</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#compliance">FMCSA Compliance</a>
              <a className="text-sm font-medium text-white/60 hover:text-secondary transition-colors" href="#">Carrier Login</a>
            </nav>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">
          <span>© {new Date().getFullYear()} FreightFlow Logistics. All Rights Reserved.</span>
          <div className="flex gap-8">
            <span>Engineered for Reliability</span>
            <span>Systems First Infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
