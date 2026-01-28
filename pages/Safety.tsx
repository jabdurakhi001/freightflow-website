import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, FileCheck, Award, Lock, Eye, Activity, UserCheck, FileText, HeartPulse, GraduationCap } from 'lucide-react';

const Safety: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-[1280px] px-4 md:px-10 py-12 md:py-20">
        <div className="flex flex-col-reverse gap-10 md:gap-16 lg:flex-row items-center">
          <div className="flex flex-col gap-6 flex-1 text-center lg:text-left">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-center lg:self-start px-3 py-1 rounded-full bg-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} />
                DOT Certified
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900">
                Uncompromising Safety Standards
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Moving Chicago and the Nation with Integrity. We exceed federal requirements with our institutional-grade logistics protocols and rigorous fleet maintenance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary hover:bg-primary-dark text-white text-base font-bold transition-all shadow-lg shadow-blue-500/20">
                View Safety Records
              </button>
              <button className="flex items-center justify-center rounded-lg h-12 px-8 bg-white border border-slate-200 text-slate-900 text-base font-bold hover:bg-slate-50 transition-all">
                Request Certificate
              </button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 rounded-xl overflow-hidden shadow-2xl relative aspect-video lg:aspect-square max-h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent z-10"></div>
            <div className="w-full h-full bg-center bg-no-repeat bg-cover transform hover:scale-105 transition-transform duration-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBJFL9_ph0wLdDjthBWRj9zoxhQZSEq3bXE8dHp_1M3G2APRmVq9N5w6lYd_OPRSHF_s9-sWtOizfTiOpzuiCpYCm9pTGSSbNE5bYwCRJokyUO46MMlWH6vTAJEeU42Wqq7zQcwKqhJuAZMC1d3OViaqeLcwWGruca9nAoj9AcF4q7epZDv2CIWIKDNLQRJVWGinoC07796KWRmTLfTQmkEIc-LGXvyWzRRYbYCxxr6ZR26fdYhxDqZ5xWdQHpND-asakdHR4UXIv0")' }}>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full bg-white border-y border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: 'Safety Rating', value: 'Satisfactory' },
              { icon: Clock, label: 'On-Time Delivery', value: '99.9%' },
              { icon: AlertTriangle, label: 'Safety Violations', value: '0' },
              { icon: FileCheck, label: 'FMCSA Status', value: 'Active' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-2 p-6 rounded-lg bg-background-light border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className="text-primary" size={24} />
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Details */}
      <section className="w-full max-w-[1280px] px-4 md:px-10 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Regulatory Compliance</h2>
              <p className="text-slate-600">Our operational licenses and insurance details for verification.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: 'US DOT Number', value: '3928471' },
                { label: 'MC Number', value: '102938' },
                { label: 'Insurance Coverage', value: '$5,000,000 Liability' },
                { label: 'Cargo Insurance', value: '$250,000 All-Risk' },
                { label: 'SCAC Code', value: 'FFLW' },
                { label: 'Hazmat Certified', value: 'Yes', isBool: true },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1 border-t border-slate-200 pt-4">
                  <p className="text-slate-500 text-sm font-medium">{item.label}</p>
                  <p className="text-slate-900 text-base font-semibold flex items-center gap-1">
                    {item.isBool && <ShieldCheck className="text-green-500" size={16} />}
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-full">
              <h3 className="text-lg font-bold mb-6 text-slate-900">Official Certifications</h3>
              <div className="flex flex-col gap-4">
                {[
                  { title: 'FMCSA Compliant', sub: 'Federal Motor Carrier Safety Admin', icon: Award },
                  { title: 'CSA High Scorer', sub: 'Compliance, Safety, Accountability', icon: Lock },
                  { title: 'SmartWay Partner', sub: 'EPA Transport Partnership', icon: Activity },
                ].map((cert, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-background-light">
                    <div className="size-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <cert.icon className="text-slate-500" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{cert.title}</p>
                      <p className="text-xs text-slate-500">{cert.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driver Screening */}
      <section className="w-full max-w-[1280px] px-4 md:px-10 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Driver Screening Process</h2>
          <p className="text-slate-600">Our hiring standards are among the strictest in the industry. We only partner with professionals who share our values.</p>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 z-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {[
              { title: '1. Background Check', desc: 'Comprehensive criminal and employment history verification spanning 10 years.', icon: UserCheck },
              { title: '2. PSP & MVR Analysis', desc: 'Rigorous review of Pre-Employment Screening Program and Motor Vehicle Records.', icon: FileText },
              { title: '3. Drug & Alcohol Screen', desc: 'Pre-employment testing and random screening protocols exceeding DOT requirements.', icon: HeartPulse },
              { title: '4. Road Test & Training', desc: 'Practical skills assessment and mandatory safety onboarding before the first mile.', icon: GraduationCap },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="size-24 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center text-primary mb-6 shadow-sm">
                  <step.icon size={40} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Safety;