import React from 'react';
import { PlayCircle, Truck, Clock, Zap, Satellite, Activity, GitBranch, CheckCircle, Cloud, Terminal } from 'lucide-react';

const Technology: React.FC = () => {
  return (
    <>
      <div className="relative w-full bg-background-light py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Technology Stack v4.0
          </div>
          <h1 className="text-slate-900 text-5xl md:text-6xl font-black tracking-tight mb-6 max-w-4xl">
            Complete Visibility from <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Dock to Door</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Leveraging advanced telemetry for precision logistics. Monitor your fleet in real-time with our data-driven infrastructure and proprietary API.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="h-12 px-8 rounded-lg bg-primary text-white font-bold text-base shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5">
              Explore the Platform
            </button>
            <button className="h-12 px-8 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-base hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <PlayCircle size={20} />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-12 lg:-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white group">
          <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-6 w-1/3 bg-slate-200 rounded text-[10px] flex items-center justify-center text-slate-400 font-mono">
                app.freightflow.io/dashboard/fleet-monitor
              </div>
            </div>
          </div>
          <div className="relative aspect-[16/9] w-full bg-slate-50">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsrbeidIhYKoJeIXWsa-Unti8fDXxzgWASrGINgyPssWD9QdRyMapy88ZbeD_6dNEW_1FgGj0DKHZlnm9ooqdwdoys1B-EDTqn2xx_li5HnTzeyfNn4zQUo4VC8uag3lauD1YZ7zkl5VSUvsJANSww4pJpsNTadXvZ5jPjnWwwsqIuxHNMQEZ0h6qglPTFm_JTvm_qUk3pnbnNyL912d6craPSDNjVbmNyewM--T1P7WzV_Ar-w0xUzK9Z-iy2HxHAJu1Gw34gIk0')", opacity: 0.9 }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Active Fleet', value: '1,248', sub: '↑ 12% vs last week', icon: Truck, color: 'text-green-600' },
                { label: 'On-Time Rate', value: '99.4%', sub: 'Target exceeded', icon: Clock, color: 'text-green-600' },
                { label: 'System Status', value: 'Operational', sub: 'Latency: 24ms', icon: Zap, valueColor: 'text-green-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="text-primary" size={16} />
                    <span className="text-xs font-bold text-slate-500 uppercase">{stat.label}</span>
                  </div>
                  <div className={`text-2xl font-bold ${stat.valueColor || 'text-slate-900'}`}>{stat.value}</div>
                  <div className={`text-xs ${stat.color || 'text-slate-500'} font-medium mt-1`}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white border-y border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {[
              { val: '30s', label: 'GPS Refresh Rate' },
              { val: '99.9%', label: 'Platform Uptime' },
              { val: '12M+', label: 'Miles Tracked' },
              { val: '250ms', label: 'API Latency' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4">
                <span className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{stat.val}</span>
                <span className="text-sm font-medium text-slate-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Core Digital Infrastructure</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Built on a foundation of speed, accuracy, and reliability. Our tech stack ensures your logistics operations never miss a beat.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Satellite, title: 'Real-time GPS Tracking', desc: 'Satellite-backed precision with 30-second update intervals. We utilize multi-constellation GNSS receivers for granular location data in any terrain.' },
              { icon: Activity, title: 'KPI Dashboards', desc: 'Customizable reporting engines that visualize cost-per-mile, driver performance scores, and preventative maintenance schedules instantly.' },
              { icon: GitBranch, title: 'Data-Driven Routing', desc: 'AI-driven route optimization analyzing historical traffic patterns, weather forecasts, and road conditions to minimize delay and fuel waste.' },
            ].map((feature, i) => (
              <div key={i} className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 bg-background-light">
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

<span className="text-slate-500">// Response Payload</span>
{`{
  `}<span className="text-blue-300">"id"</span>: <span className="text-green-400">"TRK-88392"</span>,
  <span className="text-blue-300">"status"</span>: <span className="text-green-400">"in_transit"</span>,
  <span className="text-blue-300">"coordinates"</span>: {`{
    `}<span className="text-blue-300">"lat"</span>: <span className="text-orange-300">41.8781</span>,
    <span className="text-blue-300">"lng"</span>: <span className="text-orange-300">-87.6298</span>
  {`}`},
  <span className="text-blue-300">"eta"</span>: <span className="text-green-400">"2023-10-24T14:30:00Z"</span>,
  <span className="text-blue-300">"telemetry"</span>: {`{
    `}<span className="text-blue-300">"fuel_level"</span>: <span className="text-orange-300">82</span>,
    <span className="text-blue-300">"speed_mph"</span>: <span className="text-orange-300">65</span>
  {`}`}
{`}`}
                    </pre>
                </div>
                </div>
            </div>
            <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider">
                <Terminal size={14} />
                Developer First
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">Seamless API Integration</h2>
                <p className="text-lg text-slate-600">
                Connect FreightFlow directly to your ERP, TMS, or custom inventory management system. Our RESTful API provides secure, read/write access to your entire logistics dataset.
                </p>
                <div className="flex flex-wrap gap-3 pt-4">
                {['Webhook Events', 'OAuth 2.0', '99.99% Availability'].map(tag => (
                    <span key={tag} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm">{tag}</span>
                ))}
                </div>
            </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Technology;