import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header Image */}
      <div className="w-full relative flex min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-8" style={{ backgroundImage: 'linear-gradient(rgba(16, 25, 34, 0.7) 0%, rgba(16, 25, 34, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCiIhSnG8yG3IyPUaS8Fgp1QyQtrPvkYdzCJZ79jEQPZYq6GMva9jCbi9Fdlq5xQR-8vc1pVvQJcJFJ8o2SeOmBWRD2mNuecX5Fec-x6C2o_2TxknMAcqb1ApQv2Q2dZ3eXqpGlFKnrelmNilZRH2COi6Zulxk0PdiDvf9T4u9B9UCgZe6z-cLYeYlBlY5SYB31zcKhnu7vI_eLf9O3QWc8bzul4mDMyctN0VXrCi1Ss-xyuUSY37gF-beqvN_XGAgEVA9XspA5tmg")' }}>
        <div className="flex flex-col gap-4 text-center max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-white text-5xl md:text-6xl font-black leading-tight drop-shadow-lg">Moving America Forward.</h1>
            <p className="text-slate-200 text-lg">Logistics solutions born in the heart of the Midwest.</p>
        </div>
      </div>

      {/* Mission */}
      <div className="px-4 md:px-40 flex flex-1 justify-center py-16 md:py-24 bg-white dark:bg-[#101922]">
        <div className="flex flex-col max-w-[960px] flex-1 items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide mb-6">Our Mission</div>
            <h1 className="text-[#0d141b] dark:text-white tracking-tight text-4xl md:text-6xl font-bold leading-tight px-4 pb-6">
                Chicago-based. <span className="text-primary">Nationally Trusted.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-normal leading-relaxed px-4 max-w-3xl">
                FreightFlow started with a single truck in the windy city. Today, we are the pulse of national supply chains, delivering precision and grit in equal measure.
            </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 md:px-40 py-20 bg-background-light dark:bg-background-dark">
        <div className="max-w-[960px] mx-auto">
            <h2 className="text-[#0d141b] dark:text-white text-3xl font-bold mb-12 text-center">Our Journey</h2>
            <div className="relative border-l-2 border-primary/20 ml-6 space-y-12">
                {[
                    {y: '2015', t: 'FreightFlow Founded', d: 'Started operations in a small warehouse in South Chicago with a fleet of 5 trucks.'},
                    {y: '2018', t: 'Regional Expansion', d: 'Expanded service to cover the entire Midwest region. Opened secondary hubs in Detroit and Indianapolis.'},
                    {y: '2021', t: 'Tech Integration', d: 'Launched our proprietary real-time tracking dashboard, giving partners 100% visibility.'},
                    {y: '2024', t: 'National Coverage', d: 'Achieved full 50-state coverage with a network of over 500 trucks and strategic carrier partnerships.'}
                ].map((item, i) => (
                    <div key={i} className="relative pl-12">
                        <div className="absolute -left-[9px] top-0 size-5 rounded-full bg-primary border-4 border-white dark:border-[#101922]"></div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-start">
                            <span className="text-primary font-bold text-xl min-w-[60px]">{item.y}</span>
                            <div>
                                <h3 className="text-[#0d141b] dark:text-white text-lg font-bold mb-2">{item.t}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{item.d}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

       {/* Leadership */}
       <div className="px-4 md:px-40 py-20 bg-white dark:bg-[#101922]">
        <div className="max-w-[1200px] mx-auto">
            <h2 className="text-[#0d141b] dark:text-white text-3xl font-bold mb-12 text-center">Executive Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {n: 'Michael Ross', r: 'Chief Executive Officer', d: 'Former logistics director with 20+ years steering supply chains.', i: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK4xUzwB3gdMB9nnKom5J6VwyQJOuk1aSoImz0vIm_jE_4UmeR23HuDmaIkiJrQu2CMPArGYzODf9ADmfmH8AUzSqG772W_UXWWxy7RfjjDzDMjRi_PTYbZM13Uph5Gc09Cfn-whbw5RjINX1U53444o012yHW9bHxZyfAr4KL8uUJkEjcH3RAetDN3AW41DaJ7HOXaMLTah2PotEns1KZ0xNdmPRYCkCVSp54mIHIRR-fgAWTMa9HGu4rtGWf5ozarH-E4y7x0lo'},
                    {n: 'Sarah Jenkins', r: 'Chief Operations Officer', d: 'The architect behind our operational efficiency strategies.', i: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeVIjeh1GrS9-0C2HSEN5FCHXhzpjyAR1iuNvcUtQD4vdJYeDybHYJ8KbFSaupaUM8TU2gBNWTmXwCNga2BBY4yOOPFTIn6b_VOU551JNIhXqp4m9G9OwHjxyHlQEWTE1CrFrmF8-CRL2KaE29nd-2egBZVuA4JHfZ_U-MGuJfARxxUoKGZP9uSWMewmL-fEX6mWYSbiCLBTtBpOCJ6qFt5lPo3KuJN-nj1dBEycHzUXLzXfGXZyIaczGqDmWAiEW7JxmhQLTdX4'},
                    {n: 'David Chen', r: 'Head of Logistics', d: 'Expert in route optimization and fleet technology integration.', i: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqN6yIRoWkwYZgLEgnVW2vPl447mpisD6qRbKFHm-NeqUtcf8krWKPBPVi2BDN4UXY-qr_WZ8pgagMdkgg4JjMM6I6YSJSXMtjZo06z6kXIpU-zoK2sgg4WJROxycGABtT_hGiXdjV2D1JhSR03t6jSlhEch1W6DN91dwtSJbkCEsVzDcAHGLG1_Q7uvSEY5DNQ_KjOzr59vS4YeRMLpnBkANZm5b_WFe9_B1eUfBmSxYbvO_zGW2NDqSczKqNEpI7pnJKnxUb-y8'}
                ].map((l, i) => (
                    <div key={i} className="group flex flex-col items-center text-center">
                        <div className="w-full aspect-[4/5] overflow-hidden rounded-lg mb-6 bg-slate-200">
                             <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={l.i} alt={l.n} />
                        </div>
                        <h3 className="text-[#0d141b] dark:text-white text-xl font-bold">{l.n}</h3>
                        <p className="text-primary font-medium mb-3">{l.r}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{l.d}</p>
                    </div>
                ))}
            </div>
        </div>
       </div>
    </div>
  );
};

export default About;