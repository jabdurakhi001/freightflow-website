import React from 'react';
import { MapPin, Phone, Mail, Linkedin, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 mb-4">
              <span className="text-2xl font-black tracking-tighter">FreightFlow</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Providing reliable, efficient, and transparent logistics solutions from our headquarters in Chicago to destinations nationwide.
            </p>
            <div className="flex gap-4">
               <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Linkedin size={20} /></a>
               <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Facebook size={20} /></a>
               <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/company" className="text-sm text-slate-500 hover:text-primary">About Us</Link></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-primary">Careers</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-primary">News & Media</a></li>
              <li><Link to="/contact" className="text-sm text-slate-500 hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Services</h3>
            <ul className="space-y-3">
              <li><Link to="/services" className="text-sm text-slate-500 hover:text-primary">Full Truckload</Link></li>
              <li><Link to="/services" className="text-sm text-slate-500 hover:text-primary">LTL Shipping</Link></li>
              <li><Link to="/services" className="text-sm text-slate-500 hover:text-primary">Expedited</Link></li>
              <li><Link to="/services" className="text-sm text-slate-500 hover:text-primary">Warehousing</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="text-slate-400 mt-0.5" size={16} />
                <span className="text-sm text-slate-500">123 Logistics Way, Suite 400<br />Chicago, IL 60601</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="text-slate-400" size={16} />
                <span className="text-sm text-slate-500">(314) 252-0803</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="text-slate-400" size={16} />
                <span className="text-sm text-slate-500">dispatch@freightflow.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">© 2024 FreightFlow LLC. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-400 hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-400 hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;