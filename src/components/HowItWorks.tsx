export default function HowItWorks() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-primary dark:text-white tracking-tighter mb-4">How It Works</h2>
          <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Clear process. No confusion. No surprises.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="relative">
            <span className="text-7xl font-black text-surface-container-high absolute -top-8 -left-4 z-0">01</span>
            <div className="relative z-10 pt-4">
              <h4 className="font-black text-primary dark:text-white mb-2">Request a Quote</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Provide lane details via our rapid response portal.</p>
            </div>
          </div>
          <div className="relative">
            <span className="text-7xl font-black text-surface-container-high absolute -top-8 -left-4 z-0">02</span>
            <div className="relative z-10 pt-4">
              <h4 className="font-black text-primary dark:text-white mb-2">Load Confirmation</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">System-verified capacity is assigned to your specific haul.</p>
            </div>
          </div>
          <div className="relative">
            <span className="text-7xl font-black text-surface-container-high absolute -top-8 -left-4 z-0">03</span>
            <div className="relative z-10 pt-4">
              <h4 className="font-black text-primary dark:text-white mb-2">Dispatch & Tracking</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Live GPS updates and milestone notifications commence.</p>
            </div>
          </div>
          <div className="relative">
            <span className="text-7xl font-black text-surface-container-high absolute -top-8 -left-4 z-0">04</span>
            <div className="relative z-10 pt-4">
              <h4 className="font-black text-primary dark:text-white mb-2">Delivery & Verification</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Immediate digital POD and status reconciliation.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
