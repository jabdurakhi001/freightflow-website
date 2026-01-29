import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    origin: '',
    destination: '',
    weight: '',
    freightType: 'FTL'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep(); // Move to success step
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative bg-background-light dark:bg-background-dark min-h-screen">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none bg-mesh-pattern">
         <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Section */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">Request a Freight Quote</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Get a competitive rate for your shipment within 2 hours.</p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-xl shadow-xl overflow-hidden p-6 md:p-8">
            {/* Stepper */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-primary">
                    {step === 1 && "Step 1: Contact Details"}
                    {step === 2 && "Step 2: Shipment Details"}
                    {step === 3 && "Step 3: Confirmation"}
                </span>
                <span className="text-xs font-medium text-slate-400">Step {step} of 3</span>
              </div>
              <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-1.5 group">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">Full Name</span>
                      <div className="relative">
                         <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">person</span>
                         <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="Enter your full name" required type="text" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1.5 group">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">Company Name</span>
                       <div className="relative">
                         <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">business</span>
                         <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="Enter company name" type="text" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1.5 group">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">Work Email</span>
                       <div className="relative">
                         <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">mail</span>
                         <input name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="name@company.com" required type="email" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1.5 group">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">Phone Number</span>
                       <div className="relative">
                         <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">call</span>
                         <input name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="(555) 000-0000" required type="tel" />
                      </div>
                    </label>
                  </div>
                  <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700/50">
                    <button type="button" onClick={nextStep} className="group flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg shadow-primary/30 transition-all">
                      <span className="font-bold text-sm">Next Step</span>
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-1.5 group">
                            <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">Origin Zip/City</span>
                             <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">trip_origin</span>
                                <input name="origin" value={formData.origin} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="e.g. Chicago, IL" required type="text" />
                            </div>
                        </label>
                        <label className="flex flex-col gap-1.5 group">
                            <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">Destination Zip/City</span>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">flag</span>
                                <input name="destination" value={formData.destination} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="e.g. Dallas, TX" required type="text" />
                            </div>
                        </label>
                        <label className="flex flex-col gap-1.5 group">
                            <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">Estimated Weight (lbs)</span>
                             <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">scale</span>
                                <input name="weight" value={formData.weight} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="e.g. 42000" type="number" />
                            </div>
                        </label>
                        <label className="flex flex-col gap-1.5 group">
                            <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">Freight Type</span>
                             <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">category</span>
                                <select name="freightType" value={formData.freightType} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none">
                                    <option value="FTL">Full Truckload (FTL)</option>
                                    <option value="LTL">Less Than Truckload (LTL)</option>
                                    <option value="Expedited">Expedited</option>
                                    <option value="Intermodal">Intermodal</option>
                                </select>
                            </div>
                        </label>
                    </div>
                    <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-700/50">
                        <button type="button" onClick={prevStep} className="px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium text-sm">Back</button>
                        <button type="submit" className="group flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg shadow-primary/30 transition-all">
                            <span className="font-bold text-sm">Submit Request</span>
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center text-center gap-4 py-8 animate-fade-in">
                    <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-2">
                        <span className="material-symbols-outlined text-5xl">check_circle</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Request Received!</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        Thank you, {formData.fullName}. Our team is reviewing your request for a {formData.freightType} shipment from {formData.origin} to {formData.destination}. We will contact you at {formData.email} within 2 hours.
                    </p>
                    <button type="button" onClick={() => window.location.reload()} className="mt-4 px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Start New Quote
                    </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
           {/* Trust Card */}
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <h3 className="text-slate-900 dark:text-white font-bold text-base mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">verified_user</span>
                    Why Choose FreightFlow?
                </h3>
                <ul className="space-y-4">
                    {[
                        {t: 'FMCSA Compliant & Bonded', d: 'Licensed broker MC# 123456', i: 'check_circle'},
                        {t: 'Fully Insured', d: 'Cargo coverage up to $250k per load', i: 'shield'},
                        {t: '24/7 Live Support', d: 'Real humans, no robots.', i: 'support_agent'}
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <div className="mt-0.5 min-w-5 text-green-500"><span className="material-symbols-outlined text-xl">{item.i}</span></div>
                            <div>
                                <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold">{item.t}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{item.d}</p>
                            </div>
                        </li>
                    ))}
                </ul>
           </div>

           {/* HQ Card */}
           <div className="bg-slate-900 dark:bg-black rounded-xl p-6 shadow-lg text-white overflow-hidden relative group">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1577086664693-894553052523?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")'}}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Need Help?</p>
                    <h3 className="text-xl font-bold mb-4">Chicago HQ</h3>
                    <div className="space-y-3">
                        <a href="tel:3125550198" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group/link">
                            <span className="material-symbols-outlined text-primary group-hover/link:text-white transition-colors">phone_in_talk</span>
                            <span className="text-sm font-medium">(312) 555-0198</span>
                        </a>
                        <div className="flex items-start gap-3 text-slate-300">
                             <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                             <span className="text-sm font-medium leading-relaxed">220 N Green St<br/>Chicago, IL 60607</span>
                        </div>
                    </div>
                    <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">Contact Support</button>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;