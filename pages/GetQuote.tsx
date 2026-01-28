import React from 'react';
import { User, Building, Mail, Phone, ArrowRight, CheckCircle, Shield, Headset, PhoneCall, MapPin } from 'lucide-react';

const GetQuote: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative bg-mesh-pattern">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight">Request a Freight Quote</h1>
            <p className="text-slate-500 text-lg">Get a competitive rate for your shipment within 2 hours.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl shadow-xl overflow-hidden p-6 md:p-8">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-primary">Step 1: Contact Details</span>
                <span className="text-xs font-medium text-slate-400">Step 1 of 3</span>
              </div>
              <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full"></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                <span className="text-primary font-semibold">Contact</span>
                <span>Shipment</span>
                <span>Details</span>
              </div>
            </div>

            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: 'Full Name', icon: User, type: 'text', placeholder: 'Enter your full name' },
                    { label: 'Company Name', icon: Building, type: 'text', placeholder: 'Enter company name' },
                    { label: 'Work Email', icon: Mail, type: 'email', placeholder: 'name@company.com' },
                    { label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '(555) 000-0000' }
                ].map((field, i) => (
                    <label key={i} className="flex flex-col gap-1.5 group">
                        <span className="text-slate-700 text-xs font-bold uppercase tracking-wide">{field.label}</span>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <field.icon size={20} />
                            </div>
                            <input className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder={field.placeholder} type={field.type} />
                        </div>
                    </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-slate-100">
                <button className="group relative flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98]" type="button">
                  <span className="font-bold text-sm">Next Step</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              Why Choose FreightFlow?
            </h3>
            <ul className="space-y-4">
              {[
                { title: 'FMCSA Compliant & Bonded', sub: 'Licensed broker MC# 123456', icon: CheckCircle },
                { title: 'Fully Insured', sub: 'Cargo coverage up to $250k per load', icon: Shield },
                { title: '24/7 Live Support', sub: 'Real humans, no robots.', icon: Headset },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 min-w-5 text-green-500">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-slate-800 text-sm font-semibold">{item.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 shadow-lg text-white overflow-hidden relative group">
             {/* Map BG simulation */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1577086664693-894553052523?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
            
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Need Help?</p>
              <h3 className="text-xl font-bold mb-4">Chicago HQ</h3>
              <div className="space-y-3">
                <a href="tel:3142520803" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group/link">
                  <PhoneCall size={20} className="text-primary group-hover/link:text-white transition-colors" />
                  <span className="text-sm font-medium">(314) 252-0803</span>
                </a>
                <div className="flex items-start gap-3 text-slate-300">
                  <MapPin size={20} className="text-primary mt-0.5" />
                  <span className="text-sm font-medium leading-relaxed">
                    220 N Green St<br />
                    Chicago, IL 60607
                  </span>
                </div>
              </div>
              <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetQuote;