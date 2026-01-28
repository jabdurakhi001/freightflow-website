import React from 'react';
import { Truck, Box, Zap, Warehouse, Train, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

const Services: React.FC = () => {
  return (
    <>
      <section className="relative bg-slate-900 py-24 sm:py-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40 z-10"></div>
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBvDznVIWcDr1EZ2P93O2PPZbho05_w7PSUoAOULIQUp5L1pqlhcy5mDvgIZY39P3x7oj0TV3F5ap14-Dygm3a6E9YHheld9vQkU_Mwq7G9FKd9vwT5NnXyEgDcfLFGugkyl-TXjFYZN5FFhve_d3LPJRijFMiUrwG235Rtk3RqZCiZ8KULquWPV9abCpsMhHRZIiOiIr7tHed39KPdW0m9CbgLzY3zkvhzGaX_AhNiXKrLwe8tP9L7FBb_thTbCU2hkmoUAEAWLR4")' }}></div>
        </div>
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
              Reliable Freight Solutions for a Complex World
            </h1>
            <p className="text-lg leading-8 text-slate-300 mb-8">
              Nationwide capacity with dedicated support for all your transportation needs. We simplify logistics so you can focus on growth.
            </p>
            <div className="flex gap-4">
              <button className="h-12 rounded-lg bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-blue-600">
                View Services
              </button>
              <button className="h-12 rounded-lg border border-slate-600 bg-transparent px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-20 pb-10 bg-background-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">Our Expertise</h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Comprehensive Logistics Services
            </h3>
            <p className="mt-4 text-lg text-slate-600">
              From single pallet shipments to complex dedicated fleets, we have the infrastructure and technology to move your business forward.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24 bg-background-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Full Truckload (FTL)',
                icon: Truck,
                desc: 'Nationwide capacity with dedicated support. We match your freight with the perfect carrier for optimal routing and cost.',
                tags: ['Real-time visibility', '24/7 Support'],
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Dt4LZn4KA8RfxhIQx9LX6dXEMRlwtn8WnnHqwBJj2DfyQ37KDZEZArhAEniOlqVIgckizinEugVO9tDp-39XbwMGJXgHcim_KdIYHzYzW2GfnO-wkGNV-oiBPY-LmGFxdHjIjXf0JFUoXwzV4G3F6USEA2opm5EtRAk2EpUYA3r1f2X_6te22f9qEIwifjKUo5JUcwF3WtaLFov8-tiJadhh48NmzPnGhmDY-aq2kegj6PIPZOKSEoehOvBBoUkcRQ9tukvx0ss'
              },
              {
                title: 'Dedicated Fleets',
                icon: ShieldCheck, // Using ShieldCheck as a proxy for "RV Hookup/Dedicated"
                desc: 'Your private fleet without the overhead. Guaranteed capacity and consistent drivers familiar with your routes.',
                tags: ['Cost-efficient', 'Custom Branding'],
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP4NhnDsQ3nRD4sR-v675M29glrev_SlC0h5Roo412nRHoANDCrcS7SBNu6NFfVKvMTaP3LzFbgUaMUlwK33QGXitv-lyNUby5YjkQuVWgGJewb3g63pHZc2Yby6gSv3tkE3PPeZLCr-3FqTkbQ6ZvpPnVUeRJpUkExFY78Zv-gYFfUe0gGYRm3JJ6QJiy07-dCSblz0hn_oH_O2PiqMwXo50pmxVrQdPrS4yAYAsCKTd-Q_UQcba5ACuI2jRdaVoZxWf2GeVrJPI'
              },
              {
                title: 'Expedited Shipping',
                icon: Zap,
                desc: 'Time-critical delivery when every minute counts. Team drivers and non-stop routing for your most urgent cargo.',
                tags: ['Team Drivers', 'GPS Monitoring'],
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnOiyIzrvyL8xuq7rnvfcrHyd-M8Pcq6zjlbTCu-gJiwGsYocoZ2MqVURB6ttWIXZpWPnkiBd6dnD2Pd6g6zuhJAXDHXrCro4WrJe1IpjF5oLuzBV3FG0boxcXeP29xURUnc5hbBjrcoYSvzHdxHAJ1kjDw1Nd2mA7oF9fxAeUpzo2iMJQFNqEVeKpQ0qDQgov16Gcta-AsiEBaCfGx1ezek1k7IF9xNIyFGY2emYGm3stEIR2VSuB1G-pjrFqLwvPnGpL4O6ZESg'
              },
              {
                title: 'Asset-Based Ops',
                icon: Warehouse,
                desc: 'Owned equipment ensuring maximum control. We leverage our own assets to provide guaranteed capacity when the market is tight.',
                tags: ['Owned Assets', 'Direct Control'],
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2dEhjB8OqZnzGBc6WYQAKo3xg00CW2DYmGQosLdaGzPGZR3VwKGxCxekOTiaaNxWKVLOTqUiHQ-lXG7eTa_kTNkrN46aLBPctl_Eg0_iiCVI-X_-_zkM89X2NYDK1ydHmQ2H3oKUm-20ttjULOPWzsM9TTqZ8Hyw8WGcRtq4gmFqWai2ORMYFnxUUomnEO83kb1nWq3yNyF4gsbSdSGd6hDKA6QNPmbWuvb6b8NrSZC6KmZxYENMBeLBGu8oy2JnOaciHas9d6CQ'
              },
              {
                title: 'Intermodal',
                icon: Train,
                desc: 'Combine rail and truck for cost-effective long-haul shipping. A sustainable option for non-urgent freight.',
                tags: ['Eco-friendly', 'Long Haul'],
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj-Xboxpm2EhSdwbnrJrmCoP8Rl3BKqbuYnFZuGfmYh8GfUyDNDUDIHaP0zhZ5W5nTvbLQmN0XJ1uYT0HfTgzuB0hsvXhuKWsTe-6LZsLSTJ73pehiNQc9Nvp5xjb2IXi-Lb7eSjkxX7g8s-3k-LLeKBA9KOB6rZl4D4uoNF4R3ABZFV1xKPZ39Gt_G7Xfjs6jdWLPh3LaH7hq1PXIxUfmr_GAtSSSF8rsjHZtO2XrUHTRZG4oShObBDUMhn3y38YnEgGAlwBuSK8'
              },
              {
                title: 'Warehousing',
                icon: Box,
                desc: 'Strategic storage solutions with inventory management. Cross-docking and fulfillment services available.',
                tags: ['Storage', 'Distribution'],
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIPom_Kav7t5BL2F3GYIT5jWr1F9lZOlJNm5_MrU8o753p3I5Zria668y0IrRIeCoZp59cPHs0_0i8KJ9FbfAb1lqsOvD3K7SO8oriQYOV6f2tH3MScR53EkQSZE7XuPTKFcI5ehMNMPxcRcmvPwGMKgElWgwAboNiU3epqfLUVRmvfwtSacol_wxd-4oQWZibWziuQ0BBfhYGMn3H4Utex-oBJOEx1xDL1LF1bYPtFuzbrPOkkpJ3tOVYkaYGEXjwNEGbfexwGP4'
              }
            ].map((card, i) => (
              <div key={i} className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg border border-slate-200">
                <div className="h-48 w-full overflow-hidden">
                  <div className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url("${card.img}")` }}></div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <card.icon className="text-primary" size={28} />
                    <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                  </div>
                  <p className="mb-6 text-base text-slate-600">
                    {card.desc}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 mb-6">
                    {card.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a href="#" className="group/link flex items-center text-sm font-bold text-primary">
                    Learn more <ArrowRight className="ml-1 transition-transform group-hover/link:translate-x-1" size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;