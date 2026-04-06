export default function AISystemsSection() {
  return (
    <section id="ai-systems" className="py-20 bg-primary text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter mb-6">Powered by Intelligent Logistics Systems</h2>
          <p className="text-on-primary-container text-lg mb-10">
            We differentiate ourselves through <span className="text-white font-bold">structured workflows, automation, and real-time tracking</span>. We don't just drive; we compute the most efficient path.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm border-b border-white/5 pb-4">
              <span className="w-2 h-2 bg-secondary rounded-full shrink-0"></span>
              Automated dispatch workflows for zero-latency communication.
            </li>
            <li className="flex items-center gap-3 text-sm border-b border-white/5 pb-4">
              <span className="w-2 h-2 bg-secondary rounded-full shrink-0"></span>
              Real-time load tracking & visibility for every stakeholder.
            </li>
            <li className="flex items-center gap-3 text-sm border-b border-white/5 pb-4">
              <span className="w-2 h-2 bg-secondary rounded-full shrink-0"></span>
              Dynamic routing optimization based on live traffic and weather.
            </li>
            <li className="flex items-center gap-3 text-sm border-b border-white/5 pb-4">
              <span className="w-2 h-2 bg-secondary rounded-full shrink-0"></span>
              Predictive maintenance alerts for fleet uptime reliability.
            </li>
            <li className="flex items-center gap-3 text-sm pb-4">
              <span className="w-2 h-2 bg-secondary rounded-full shrink-0"></span>
              Digital document management for instant POD access.
            </li>
          </ul>
          <div className="mt-12 p-6 bg-white/5 border-l-4 border-secondary">
            <p className="text-xs uppercase tracking-widest font-black opacity-60 mb-2">System Outcome</p>
            <p className="text-2xl font-black">More control. Fewer delays. Predictable execution.</p>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-primary-container to-secondary/20 rounded-xl flex items-center justify-center border border-white/10 relative">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <img
              loading="lazy"
              className="w-4/5 h-4/5 object-cover rounded-lg shadow-2xl grayscale contrast-125"
              alt="Abstract macro shot of a circuit board"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKzajrTvw_CNB8vSsePSFr-8P52IIY9adZT1rbwbU6PxFhDceYCDvKpRK3HRb3o3Y61XhHo_3wpJnvg_bAvjqRmAU8LUNIkaCHRgSn8NLFkvRjurDYyxJu-a5lg7oGdzXRsBga-fD3YMz0tpy2nR0OuO1Bnpq-4_UNVdkov8udGiWkqQn629hsEPWYRRQRlK4PYS59neQkYIB4P-YDtLMaZEg8zRYNvMn4F2gNSBqtUtXKVo1ElVzR7rOCFWyc9vgsY_pWw-JaAOg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
