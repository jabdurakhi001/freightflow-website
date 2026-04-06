export default function TrustStrip() {
  return (
    <section className="bg-surface-container-high py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col">
            <span className="text-secondary font-black text-2xl">48 States</span>
            <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Nationwide Coverage</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary dark:text-white font-black text-2xl">Midwest Hub</span>
            <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Operational Strength</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary dark:text-white font-black text-2xl">2024–2026 Fleet</span>
            <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Modern Equipment</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary dark:text-white font-black text-2xl">ISO-Ready</span>
            <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Process-Driven</span>
          </div>
        </div>
      </div>
    </section>
  );
}
