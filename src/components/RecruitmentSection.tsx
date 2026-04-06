import { Banknote, Home, Headset } from 'lucide-react';

export default function RecruitmentSection() {
  return (
    <section id="recruitment" className="py-24 bg-primary text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary-container to-primary opacity-50"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-8">
        <h2 className="text-4xl font-black tracking-tighter mb-4">Drive With a Carrier That Runs Like a Business</h2>
        <p className="text-xl text-on-primary-container mb-12">Consistent loads. Structured operations. Professional support. We respect your time and your expertise.</p>
        <div className="flex justify-center gap-8 mb-16">
          <div className="flex flex-col items-center">
            <Banknote className="text-secondary w-10 h-10 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Premium Pay</span>
          </div>
          <div className="flex flex-col items-center">
            <Home className="text-secondary w-10 h-10 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Home Time</span>
          </div>
          <div className="flex flex-col items-center">
            <Headset className="text-secondary w-10 h-10 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Elite Dispatch</span>
          </div>
        </div>
        <a href="mailto:info@freightflow.group?subject=Driver%20Application" className="inline-block bg-secondary text-white px-12 py-5 rounded-md font-bold text-lg uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-xl">
          Apply Now
        </a>
      </div>
    </section>
  );
}
