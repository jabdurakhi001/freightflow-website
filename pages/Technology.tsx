import React from 'react';
import { Link } from 'react-router-dom';

const Technology: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Hero */}
      <div className="relative w-full py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Technology Stack v4.0
          </div>
          <h1 className="text-slate-900 dark:text-white text-5xl md:text-6xl font-black tracking-tight mb-6 max-w-4xl">
            Complete Visibility from <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Dock to Door</span>
          </h1>
          <p className="text-steel-gray dark:text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Leveraging advanced telemetry for precision logistics. Monitor your fleet in real-time with our data-driven infrastructure and proprietary API.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="h-12 px-8 rounded-lg bg-primary text-white font-bold text-base shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5">
              Explore the Platform
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="relative z-20 -mt-12 lg:-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark group">
          <div className="h-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded text-[10px] flex items-center justify-center text-slate-400 dark:text-slate-500 font-mono">
                app.freightflow.io/dashboard/fleet-monitor
              </div>
            </div>
          </div>
          <div className="relative aspect-[16/9] w-full bg-slate-50 dark:bg-slate-900">
             <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDsrbeidIhYKoJeIXWsa-Unti8fDXxzgWASrGINgyPssWD9QdRyMapy88ZbeD_6dNEW_1FgGj0DKHZlnm9ooqdwdoys1B-EDTqn2xx_li5HnTzeyfNn4zQUo4VC8uag3lauD1YZ7zkl5VSUvsJANSww4pJpsNTadXvZ5jPjnWwwsqIuxHNMQEZ0h6qglPTFm_JTvm_qUk3pnbnNyL912d6craPSDNjVbmNyewM--T1P7WzV_Ar-w0xUzK9Z-iy2HxHAJu1Gw34gIk0")'}}></div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
             <div className="absolute bottom-6 left-6 right-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                         <span className="material-symbols-outlined text-primary">local_shipping</span>
                         <span className="text-xs font-bold text-slate-500 uppercase">Active Fleet</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">1,248</div>
                    <div className="text-xs text-green-600 font-medium mt-1">↑ 12% vs last week</div>
                </div>
                 <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                         <span className="material-symbols-outlined text-primary">schedule</span>
                         <span className="text-xs font-bold text-slate-500 uppercase">On-Time Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">99.4%</div>
                    <div className="text-xs text-green-600 font-medium mt-1">Target exceeded</div>
                </div>
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                         <span className="material-symbols-outlined text-primary">bolt</span>
                         <span className="text-xs font-bold text-slate-500 uppercase">System Status</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500">Operational</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">Latency: 24ms</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full bg-white dark:bg-surface-dark border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100 dark:divide-slate-800">
                <div className="flex flex-col items-center text-center px-4">
                    <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">30s</span>
                    <span className="text-sm font-medium text-steel-gray dark:text-slate-400">GPS Refresh Rate</span>
                </div>
                <div className="flex flex-col items-center text-center px-4">
                    <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">99.9%</span>
                    <span className="text-sm font-medium text-steel-gray dark:text-slate-400">Platform Uptime</span>
                </div>
                <div className="flex flex-col items-center text-center px-4">
                    <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">12M+</span>
                    <span className="text-sm font-medium text-steel-gray dark:text-slate-400">Miles Tracked</span>
                </div>
                 <div className="flex flex-col items-center text-center px-4">
                    <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">250ms</span>
                    <span className="text-sm font-medium text-steel-gray dark:text-slate-400">API Latency</span>
                </div>
            </div>
        </div>
      </div>

       {/* Features */}
       <div className="py-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {icon: 'satellite_alt', title: 'Real-time GPS Tracking', desc: 'Satellite-backed precision with 30-second update intervals. We utilize multi-constellation GNSS receivers for granular location data in any terrain.'},
                    {icon: 'monitoring', title: 'KPI Dashboards', desc: 'Customizable reporting engines that visualize cost-per-mile, driver performance scores, and preventative maintenance schedules instantly.'},
                    {icon: 'alt_route', title: 'Data-Driven Routing', desc: 'AI-driven route optimization analyzing historical traffic patterns, weather forecasts, and road conditions to minimize delay and fuel waste.'}
                ].map((feat, i) => (
                    <div key={i} className="group bg-surface-light dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                        <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">{feat.icon}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h3>
                        <p className="text-steel-gray dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
       </div>

       {/* API Section */}
       <div className="py-24 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
                     <div className="flex-1 w-full max-w-xl">
                        <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
                             <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                                 <div className="flex gap-2">
                                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                 </div>
                                 <span className="text-xs text-slate-400 font-mono">GET /api/v1/shipments/status</span>
                             </div>
                             <div className="p-6 overflow-x-auto">
<pre className="font-mono text-sm leading-relaxed text-slate-300">
<span className="text-purple-400">const</span> <span className="text-blue-400">response</span> = <span className="text-purple-400">await</span> <span className="text-yellow-300">freightFlow</span>.<span className="text-blue-400">getShipment</span>(<span className="text-green-400">'TRK-88392'</span>);

<span className="text-slate-500">{'// Response Payload'}</span>
{`{
  `}<span className="text-blue-300">"id"</span>: <span className="text-green-400">"TRK-88392"</span>,
  <span className="text-blue-300">"status"</span>: <span className="text-green-400">"in_transit"</span>,
  <span className="text-blue-300">"coordinates"</span>: {'{'}
    <span className="text-blue-300">"lat"</span>: <span className="text-orange-300">41.8781</span>,
    <span className="text-blue-300">"lng"</span>: <span className="text-orange-300">-87.6298</span>
  {'}'}
{`}`}
</pre>
                             </div>
                        </div>
                     </div>
                     <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">terminal</span>
                            Developer First
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Seamless API Integration</h2>
                        <p className="text-lg text-steel-gray dark:text-slate-400">
                            Connect FreightFlow directly to your ERP, TMS, or custom inventory management system. Our RESTful API provides secure, read/write access to your entire logistics dataset.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-4">
                            {['Webhook Events', 'OAuth 2.0', '99.99% Availability'].map(tag => (
                                <span key={tag} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">{tag}</span>
                            ))}
                        </div>
                     </div>
                </div>
            </div>
       </div>
    </div>
  );
};

export default Technology;