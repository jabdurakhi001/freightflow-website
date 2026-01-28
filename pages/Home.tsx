import React from 'react';
import { ArrowRight, Truck, Package, Timer, Warehouse, Shield, Leaf, CheckCircle, Award, Map, Radar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full -mt-20">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-cover bg-center bg-no-repeat object-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDiDm_waCMlE9sRAGeepcV6zV88LvP3A1tmqTMQwKuXXN20OCslY9FKsJu2ikLc75WzkfCpMDSEDcU67Ib-RzeSE5P3bV85k6h1CmH_6Fa6SyaKY8lZpRDIRVZ8Q_UNB1J6SMkOsTLwtCugHvUvqZJRXSXyqaOYHGWEecxhAe5Y65GlAlU5YqJLkSQAz_k22ZUOZSGcUSfQys3L7-9KbaHR3s_GRl7qpjzqkdsEwowW4V1LjZDKMgfbNvuzUV--M_RpuzUP3YZd6yQ")' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30"></div>
          {/* Abstract Grid Overlay */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#137fec_1px,transparent_1px)] [background-size:24px_24px]"></div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[700px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
              Based in Chicago, IL
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Moving Freight. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-200">Powering Supply Chains.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-300 sm:text-xl leading-relaxed">
              Chicago’s premier logistics partner for reliable nationwide transport. Efficiency, transparency, and speed at the core of your business.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/quote" className="flex h-12 min-w-[160px] items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:scale-[1.02]">
                Get a Quote
              </Link>
              <Link to="/services" className="flex h-12 min-w-[160px] items-center justify-center rounded-lg bg-white/10 px-6 text-base font-bold text-white backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              { label: 'Loads Delivered', value: '10K+' },
              { label: 'On-Time Performance', value: '99.8%' },
              { label: 'States Covered', value: '50' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center px-4 text-center sm:items-start sm:text-left">
                <p className="font-display text-4xl font-bold tracking-tight text-primary tabular-nums">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Our Services</h2>
              <p className="mt-4 text-lg text-slate-600">Comprehensive logistics solutions tailored to the needs of modern industry.</p>
            </div>
            <Link to="/services" className="group flex items-center gap-1 font-semibold text-primary hover:text-primary-dark">
              View all services
              <ArrowRight className="text-lg transition-transform group-hover:translate-x-1" size={18} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: 'Full Truckload (FTL)', desc: 'Dedicated capacity for your large shipments. Direct routes with minimized handling.' },
              { icon: Package, title: 'Less Than Truckload', desc: 'Cost-effective solutions for smaller loads. Optimized consolidation network.' },
              { icon: Timer, title: 'Expedited Shipping', desc: 'Time-critical delivery when speed matters. 24/7 tracking and priority handling.' },
              { icon: Warehouse, title: 'Warehousing', desc: 'Secure storage and inventory management in our Midwest hub.' },
            ].map((service, i) => (
              <div key={i} className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-md">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <service.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
                <div className="aspect-video w-full bg-cover bg-center opacity-80 mix-blend-multiply" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBfCT08Pyg6QDdrfTpKrlj1uPqlRZEjdflEi2NmGRyCZTWJ_fGkV35L5Gr8bLAPuCXvGyrPq0IYT0ZAYAo1NyCDdOKGldpT94XbDOxYbK6xUFS1-VMQZHgY0Et44FDXBIWhFP0COswFx0TNPbUBy6k2yWKKcBili7dMAyWPcd-eRnx4ZhdIKgO9LyjoMRgrxj0gUfmNLuGPNT1nO69qc0o0zfEgzIuHrMvuEtOshDxDgCNx-Uu8x5G_k7901EflC_G7-qRIpEKPTWE")' }}></div>
                {/* Simulated Location Marker */}
                <div className="absolute top-1/3 left-2/3 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <div className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                  </div>
                  <div className="mt-2 rounded bg-white px-2 py-1 text-xs font-bold text-slate-900 shadow-lg">Chicago Hub</div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
                Nationwide Coverage
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                From Chicago to Coast-to-Coast
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Our strategic Midwest location allows us to optimize routes across North America. We operate a vast network of carrier partners ensuring your freight is never out of reach.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Radar size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Centralized Hub</h4>
                    <p className="text-sm text-slate-500">Efficient distribution from the heart of the Midwest.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Map size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Real-time Visibility</h4>
                    <p className="text-sm text-slate-500">Track your shipment across all 50 states.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Badge Strip */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-8 text-sm font-semibold uppercase tracking-wider text-slate-500">Trusted by Industry Leaders & Certified for Safety</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100">
            <div className="flex items-center gap-2">
              <Shield size={32} className="text-slate-600" />
              <span className="text-xl font-bold text-slate-700">DOT Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf size={32} className="text-slate-600" />
              <span className="text-xl font-bold text-slate-700">SmartWay</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={32} className="text-slate-600" />
              <span className="text-xl font-bold text-slate-700">FMCSA</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={32} className="text-slate-600" />
              <span className="text-xl font-bold text-slate-700">ISO 9001</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to move your freight?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Get a competitive quote today and experience the FreightFlow difference.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/quote">
                <button className="rounded-lg bg-white px-8 py-3 text-base font-bold text-primary shadow-sm hover:bg-slate-50 transition-colors">
                Start a Quote
                </button>
            </Link>
            <Link to="/contact">
                <button className="rounded-lg border border-white/30 bg-primary-dark/20 px-8 py-3 text-base font-bold text-white backdrop-blur-sm hover:bg-primary-dark/40 transition-colors">
                Contact Sales
                </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;