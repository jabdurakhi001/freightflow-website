import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center text-slate-900 dark:text-white">
              <span className="text-xl font-bold">FreightFlow</span>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Providing reliable, efficient, and transparent logistics solutions from our headquarters in Chicago to destinations nationwide.
            </p>
          </div>
          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Company</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/about" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">About Us</Link></li>
              <li><Link to="/about" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Services</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/services" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">Full Truckload</Link></li>
              <li><Link to="/services" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">LTL Shipping</Link></li>
              <li><Link to="/services" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">Expedited</Link></li>
              <li><Link to="/services" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">Warehousing</Link></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">123 Logistics Way, Suite 400<br />Chicago, IL 60601</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg">phone</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">+1 (312) 555-0123</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">dispatch@freightflow.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
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