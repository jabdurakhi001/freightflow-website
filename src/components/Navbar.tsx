import { useState, useEffect } from 'react';
import { Sun, Moon, X, Menu } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const NAV_LINKS = [
  { href: '#solutions', label: 'Solutions' },
  { href: '#compliance', label: 'Compliance' },
  { href: '#ai-systems', label: 'AI Systems' },
  { href: '#fleet', label: 'Fleet' },
  { href: '#recruitment', label: 'Recruitment' },
];

export default function Navbar({ isDark, toggleTheme, mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sectionIds = NAV_LINKS.map((link) => link.href.replace('#', ''));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-4 backdrop-blur-md bg-opacity-90 bg-primary z-50 shadow-2xl">
        <div className="text-xl font-black text-white tracking-tighter">
          <span>Freight</span><span className="text-secondary">Flow</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.href}
                href={link.href}
                className={`font-body tracking-tight font-bold uppercase text-xs transition-colors ${
                  isActive
                    ? 'text-secondary border-b-2 border-secondary pb-1'
                    : 'text-white/80 hover:text-white pb-1'
                }`}
              >
                {link.label}
              </a>
            );
          })}
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
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              className="text-2xl font-black uppercase tracking-widest text-white hover:text-secondary transition-colors"
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a className="mt-4 bg-secondary-container text-on-secondary-container px-10 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all" href="mailto:info@freightflow.group" onClick={() => setMobileMenuOpen(false)}>Request a Quote</a>
        </div>
      )}
    </>
  );
}
