import React from 'react';
import { Phone, Mail, MapPin, Clock, Send, Plus, Minus } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col">
      <section className="w-full bg-background-light pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-slate-900 text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
              Contact FreightFlow
            </h1>
            <p className="text-slate-500 text-lg sm:text-xl font-normal leading-relaxed">
              Get in touch with our team for logistics solutions. We're here to help move your business forward.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5 space-y-10">
              <p className="text-slate-600">
                Whether you have a question about our services, pricing, or need support with an active shipment, our team is ready to answer all your questions.
              </p>
              <div className="space-y-6">
                {[
                    { icon: Phone, title: 'Phone', val: '(314) 252-0803' },
                    { icon: Mail, title: 'Email', val: 'info@FreightFlow.group' },
                    { icon: MapPin, title: 'Headquarters', val: 'Chicago, IL', sub: 'Strategic Hub & Operations Center' },
                    { icon: Clock, title: 'Business Hours', val: 'Mon-Fri: 08:00 - 18:00 CST', sub: '24/7 Support for Active Carriers' }
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
                        <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary shrink-0">
                            <item.icon size={20} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">{item.title}</p>
                            <p className="text-slate-900 text-lg font-semibold">{item.val}</p>
                            {item.sub && <p className="text-slate-500 text-sm mt-1">{item.sub}</p>}
                        </div>
                    </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 lg:p-10">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900">Send us a message</h3>
                  <p className="text-slate-500 mt-2 text-sm">Fill out the form below and our team will get back to you within 2 business hours.</p>
                </div>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-slate-700 text-sm font-medium">Full Name</span>
                      <input className="w-full h-12 px-4 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Jane Doe" type="text" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-slate-700 text-sm font-medium">Email Address</span>
                      <input className="w-full h-12 px-4 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="jane@company.com" type="email" />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-slate-700 text-sm font-medium">Company <span className="text-slate-400 font-normal">(Optional)</span></span>
                    <input className="w-full h-12 px-4 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="FreightFlow Logistics" type="text" />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-slate-700 text-sm font-medium">Message</span>
                    <textarea className="w-full min-h-[140px] px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all" placeholder="How can we help you today?"></textarea>
                  </label>
                  <button className="w-full sm:w-auto px-8 h-12 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group" type="submit">
                    <span>Send Message</span>
                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-full h-[450px] bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <img alt="Map of Chicago" className="w-full h-full object-cover opacity-60 hover:opacity-70 transition-opacity duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApTIQfMJXw8X78EfU6e2SM2KgcdkM3LqfITIGoW90pcwJDsVwPBOzaaXt9Vz96JC2x5D_PIrGdbGiM18YuqqomMVdqDVb13JXdfjtspduQLNsEd-u8F1D8wVG8JP53YSGFthOLlp_dxApLrhYGq0L4Etbs7TjUFJayCEavC7I7CqJo_rBzC5mUEcS_9Sds0MjKKNT2PEPjYsp1bNI86oPdby0jnpy3atD4vAIEnUxMK3BmUy5xBDGmMfBSp6ZJL5RPsPoqZfNCiWI" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative">
                <span className="relative flex size-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-6 bg-primary border-2 border-white"></span>
                </span>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
                  <p className="font-bold text-sm">FreightFlow HQ</p>
                  <p className="text-xs text-slate-500">Chicago, IL</p>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 bg-white rotate-45 transform"></div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
              <button className="bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 text-slate-700">
                <Plus size={20} />
              </button>
              <button className="bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 text-slate-700">
                <Minus size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;