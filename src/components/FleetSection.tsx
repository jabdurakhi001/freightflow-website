export default function FleetSection() {
  return (
    <section id="fleet" className="py-20 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-black text-primary dark:text-white tracking-tighter mb-6">Modern Equipment. <br/>Operational Readiness.</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Our fleet consists exclusively of <span className="font-black text-primary dark:text-white">2025–2026 Freightliner Cascadia units</span>. We invest in the newest technology to ensure peak performance, maximum fuel efficiency, and the lowest possible failure rate.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-high rounded-lg">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Avg. Fleet Age</span>
                <p className="text-xl font-black text-primary dark:text-white">0.5 Years</p>
              </div>
              <div className="p-4 bg-surface-container-high rounded-lg">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Uptime Rate</span>
                <p className="text-xl font-black text-primary dark:text-white">99.2%</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <img
              loading="lazy"
              className="w-full h-auto rounded-xl shadow-2xl"
              alt="Modern white semi truck fleet at loading dock"
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format"
            />
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-secondary text-white p-4 md:p-8 rounded-lg shadow-xl">
              <p className="text-sm font-black uppercase tracking-[0.2em]">Ready to Launch</p>
              <p className="text-4xl font-black">2026 Ready</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
