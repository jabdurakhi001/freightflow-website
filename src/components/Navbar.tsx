import { Sun, Moon, X, Menu } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navbar({ isDark, toggleTheme, mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  return (
    <>
      <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-4 backdrop-blur-md bg-opacity-90 bg-primary z-50 shadow-2xl">
        <div className="text-xl font-black text-white tracking-tighter">
          <span>Freight</span><span className="text-secondary">Flow</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a className="font-body tracking-tight font-bold uppercase text-xs text-secondary border-b-2 border-secondary pb-1" href="#solutions">Solutions</a>
          <a className="font-body tracking-tight font-bold uppercase text-xs text-white/80 hover:text-white transition-colors" href="#compliance">Compliance</a>
          <a className="font-body tracking-tight font-bold uppercase text-xs text-white/80 hover:text-white transition-colors" href="#ai-systems">AI Systems</a>
          <a className="font-body tracking-tight font-bold uppercase text-xs text-white/80 hover:text-white transition-colors" href="#fleet">Fleet</a>
          <a className="font-body tracking-tight font-bold uppercase text-xs text-white/80 hover:text-white transition-colors" href="#recruitment">Recruitment</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Toggle dark mode" type="button">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <a href="mailto:info@freightflow.group?subject=Quote%20Request" className="hidden md:inline-flex bg-secondary-container text-on-secondary-container px-6 py-2 rounded-md font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
            Request a Quote
          </a>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Toggle menu" type="button">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[45] pt-20 bg-primary backdrop-blur-lg flex flex-col items-center justify-center gap-8 md:hidden">
          <a className="text-2xl font-black uppercase tracking-widest text-white hover:text-secondary transition-colors" href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
          <a className="text-2xl font-black uppercase tracking-widest text-white hover:text-secondary transition-colors" href="#compliance" onClick={() => setMobileMenuOpen(false)}>Compliance</a>
          <a className="text-2xl font-black uppercase tracking-widest text-white hover:text-secondary transition-colors" href="#ai-systems" onClick={() => setMobileMenuOpen(false)}>AI Systems</a>
          <a className="text-2xl font-black uppercase tracking-widest text-white hover:text-secondary transition-colors" href="#fleet" onClick={() => setMobileMenuOpen(false)}>Fleet</a>
          <a className="text-2xl font-black uppercase tracking-widest text-white hover:text-secondary transition-colors" href="#recruitment" onClick={() => setMobileMenuOpen(false)}>Recruitment</a>
          <a className="mt-4 bg-secondary-container text-on-secondary-container px-10 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all" href="mailto:info@freightflow.group" onClick={() => setMobileMenuOpen(false)}>Request a Quote</a>
        </div>
      )}
    </>
  );
}
