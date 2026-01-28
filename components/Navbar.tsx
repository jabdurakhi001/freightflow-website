import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Network', path: '/company' }, // Mapping Network to Company for demo structure
    { name: 'Technology', path: '/technology' },
    { name: 'Safety', path: '/safety' },
    { name: 'Careers', path: '#' },
  ];

  const isTransparent = location.pathname === '/' && !scrolled && !isOpen;

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled || isOpen || location.pathname !== '/' 
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' 
          : 'bg-transparent border-b border-white/10'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className={`text-2xl font-black tracking-tighter transition-colors ${isTransparent ? 'text-white' : 'text-slate-900'}`}>
              FreightFlow
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isTransparent ? 'text-slate-200 hover:text-white' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <button className={`h-10 px-4 rounded-lg text-sm font-semibold transition-colors ${
               isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
            }`}>
              Track Shipment
            </button>
            <Link to="/quote">
                <button className="flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all hover:shadow-lg active:scale-95">
                Get Quote
                </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden p-2 rounded-md ${isTransparent ? 'text-white' : 'text-slate-900'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 absolute w-full shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block text-base font-medium text-slate-700 hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-3">
               <button className="w-full h-10 rounded-lg border border-slate-200 text-slate-700 font-semibold">
                  Track Shipment
               </button>
               <Link to="/quote" className="w-full">
                <button className="w-full h-10 rounded-lg bg-primary text-white font-bold">
                    Get Quote
                </button>
               </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;