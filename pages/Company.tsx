import React from 'react';
import { Verified, Handshake, TrendingUp, Users } from 'lucide-react';

const Company: React.FC = () => {
  return (
    <>
      <div className="w-full">
        <div className="relative flex min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-8" style={{ backgroundImage: 'linear-gradient(rgba(16, 25, 34, 0.7) 0%, rgba(16, 25, 34, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCiIhSnG8yG3IyPUaS8Fgp1QyQtrPvkYdzCJZ79jEQPZYq6GMva9jCbi9Fdlq5xQR-8vc1pVvQJcJFJ8o2SeOmBWRD2mNuecX5Fec-x6C2o_2TxknMAcqb1ApQv2Q2dZ3eXqpGlFKnrelmNilZRH2COi6Zulxk0PdiDvf9T4u9B9UCgZe6z-cLYeYlBlY5SYB31zcKhnu7vI_eLf9O3QWc8bzul4mDMyctN0VXrCi1Ss-xyuUSY37gF-beqvN_XGAgEVA9XspA5tmg")' }}>
          <div className="flex flex-col gap-4 text-center max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-white text-5xl md:text-7xl font-black leading-tight tracking-tight drop-shadow-lg">
              Moving America Forward.
            </h1>
            <h2 className="text-slate-200 text-lg md:text-xl font-medium leading-normal max-w-2xl mx-auto">
              Logistics solutions born in the heart of the Midwest, driving the future of national supply chains.
            </h2>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-40 flex flex-1 justify-center py-16 md:py-24 bg-white">
        <div className="flex flex-col max-w-[960px] flex-1 items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide mb-6">
            Our Mission
          </div>
          <h1 className="text-slate-900 tracking-tight text-4xl md:text-6xl font-bold leading-tight px-4 text-center pb-6">
            Chicago-based. <span className="text-primary">Nationally Trusted.</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-normal leading-relaxed px-4 text-center max-w-3xl">
            FreightFlow started with a single truck in the windy city. Today, we are the pulse of national supply chains, delivering precision and grit in equal measure. We connect the industrial heartland to the coasts with unwavering efficiency.
          </p>
        </div>
      </div>

      <div className="bg-primary py-12 px-4 md:px-40">
        <div className="max-w-[1200px] mx-auto flex flex-wrap justify-between gap-8 text-center md:text-left">
          {[
            { label: 'Trucks in Fleet', val: '500+' },
            { label: 'States Covered', val: '50' },
            { label: 'On-Time Delivery', val: '99%' },
            { label: 'Years of Excellence', val: '9' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className="text-white text-5xl font-black tracking-tight">{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-40 py-20 bg-background-light">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-slate-900 text-3xl font-bold mb-4">Core Values</h2>
            <p className="text-slate-600">The principles that drive every mile we travel.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Verified, title: 'Reliability', desc: 'We deliver on our promises, every mile. When we say it will be there, it will be there. No excuses, just results.' },
              { icon: Handshake, title: 'Integrity', desc: 'Transparent pricing and honest communication. We believe in building long-term partnerships based on trust.' },
              { icon: TrendingUp, title: 'Scalability', desc: 'Tech-driven solutions that grow with your business. From LTL to full truckloads, we adapt to your volume needs instantly.' },
            ].map((card, i) => (
              <div key={i} className="flex flex-col p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <card.icon size={30} />
                </div>
                <h3 className="text-slate-900 text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-40 py-20 bg-white">
        <div className="max-w-[960px] mx-auto">
          <h2 className="text-slate-900 text-3xl font-bold mb-12 text-center">Our Journey</h2>
          <div className="relative border-l-2 border-primary/20 ml-6 space-y-12">
            {[
              { year: '2015', title: 'FreightFlow Founded', desc: 'Started operations in a small warehouse in South Chicago with a fleet of 5 trucks.' },
              { year: '2018', title: 'Regional Expansion', desc: 'Expanded service to cover the entire Midwest region. Opened secondary hubs in Detroit and Indianapolis.' },
              { year: '2021', title: 'Tech Integration', desc: 'Launched our proprietary real-time tracking dashboard, giving partners 100% visibility.' },
              { year: '2024', title: 'National Coverage', desc: 'Achieved full 50-state coverage with a network of over 500 trucks and strategic carrier partnerships.' },
            ].map((item, i) => (
              <div key={i} className="relative pl-12">
                <div className="absolute -left-[9px] top-0 size-5 rounded-full bg-primary border-4 border-white"></div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-start">
                  <span className="text-primary font-bold text-xl min-w-[60px]">{item.year}</span>
                  <div>
                    <h3 className="text-slate-900 text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Company;