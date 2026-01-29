import React from 'react';
import { Link } from 'react-router-dom';

const Safety: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Hero */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 md:py-20">
        <div className="flex flex-col-reverse gap-10 md:gap-16 lg:flex-row items-center">
          <div className="flex flex-col gap-6 flex-1 text-center lg:text-left">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-center lg:self-start px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined !text-sm">verified</span>
                DOT Certified
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                Uncompromising Safety Standards
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Moving Chicago and the Nation with Integrity. We exceed federal requirements with our institutional-grade logistics protocols and rigorous fleet maintenance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary hover:bg-primary/90 text-white text-base font-bold transition-all shadow-lg shadow-blue-500/20">
                View Safety Records
              </button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 rounded-xl overflow-hidden shadow-2xl relative aspect-video lg:aspect-square max-h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent z-10"></div>
            <div className="w-full h-full bg-center bg-no-repeat bg-cover transform hover:scale-105 transition-transform duration-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBJFL9_ph0wLdDjthBWRj9zoxhQZSEq3bXE8dHp_1M3G2APRmVq9N5w6lYd_OPRSHF_s9-sWtOizfTiOpzuiCpYCm9pTGSSbNE5bYwCRJokyUO46MMlWH6vTAJEeU42Wqq7zQcwKqhJuAZMC1d3OViaqeLcwWGruca9nAoj9AcF4q7epZDv2CIWIKDNLQRJVWGinoC07796KWRmTLfTQmkEIc-LGXvyWzRRYbYCxxr6ZR26fdYhxDqZ5xWdQHpND-asakdHR4UXIv0")' }}></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'verified_user', label: 'Safety Rating', val: 'Satisfactory' },
              { icon: 'schedule', label: 'On-Time Delivery', val: '99.9%' },
              { icon: 'gavel', label: 'Safety Violations', val: '0' },
              { icon: 'fact_check', label: 'FMCSA Status', val: 'Active' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-2 p-6 rounded-lg bg-background-light dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary">{stat.icon}</span>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Regulatory Compliance</h2>
              <p className="text-slate-600 dark:text-slate-400">Our operational licenses and insurance details for verification.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { l: 'US DOT Number', v: '3928471' },
                { l: 'MC Number', v: '102938' },
                { l: 'Insurance Coverage', v: '$5,000,000 Liability' },
                { l: 'Cargo Insurance', v: '$250,000 All-Risk' },
                { l: 'SCAC Code', v: 'FFLW' },
                { l: 'Hazmat Certified', v: 'Yes', icon: 'check_circle' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.l}</p>
                  <p className="text-slate-900 dark:text-white text-base font-semibold flex items-center gap-1">
                    {item.icon && <span className="material-symbols-outlined text-green-500 text-sm">{item.icon}</span>} {item.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full">
              <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Official Certifications</h3>
              <div className="flex flex-col gap-4">
                {[
                  { t: 'FMCSA Compliant', s: 'Federal Motor Carrier Safety Admin', i: 'local_police' },
                  { t: 'CSA High Scorer', s: 'Compliance, Safety, Accountability', i: 'security' },
                  { t: 'SmartWay Partner', s: 'EPA Transport Partnership', i: 'smart_toy' }
                ].map((cert, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-background-light dark:bg-slate-900">
                    <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">{cert.i}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{cert.t}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cert.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driver Process */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Driver Screening Process</h2>
          <p className="text-slate-600 dark:text-slate-400">Our hiring standards are among the strictest in the industry. We only partner with professionals who share our values.</p>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {[
              { t: '1. Background Check', d: 'Comprehensive criminal and employment history verification spanning 10 years.', i: 'person_search' },
              { t: '2. PSP & MVR Analysis', d: 'Rigorous review of Pre-Employment Screening Program and Motor Vehicle Records.', i: 'folder_shared' },
              { t: '3. Drug & Alcohol Screen', d: 'Pre-employment testing and random screening protocols exceeding DOT requirements.', i: 'medical_services' },
              { t: '4. Road Test & Training', d: 'Practical skills assessment and mandatory safety onboarding before the first mile.', i: 'school' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center bg-background-light dark:bg-background-dark p-4 rounded-xl">
                <div className="size-24 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary mb-6 shadow-sm">
                  <span className="material-symbols-outlined !text-4xl">{step.i}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.t}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Safety;