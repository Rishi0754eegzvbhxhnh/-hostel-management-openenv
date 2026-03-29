import React, { useState } from 'react';
import { Zap, Thermometer, Droplets, Fan, Lightbulb, Wind, Leaf, Activity, Globe, Trophy, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeviceControl = ({ icon: Icon, label, status, onToggle, color }) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all group relative overflow-hidden">
     <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[3rem] opacity-5 group-hover:scale-110 transition-transform ${color}`} />
     <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.replace('bg-', 'bg-').replace('-500', '-50')} ${color.replace('bg-', 'text-')}`}>
           <Icon className="w-6 h-6" />
        </div>
        <button 
           onClick={onToggle}
           className={`w-12 h-6 rounded-full relative transition-all ${status ? color : 'bg-slate-200'}`}
        >
           <motion.div 
             animate={{ x: status ? 24 : 4 }}
             className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
           />
        </button>
     </div>
     <div className="relative z-10">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">{label}</h4>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${status ? color.replace('bg-', 'text-') : 'text-slate-400'}`}>
           {status ? 'Status: Active' : 'Status: Off'}
        </p>
     </div>
  </div>
);

const SmartLiving = () => {
  const [devices, setDevices] = useState({ light: true, fan: false, ac: true, heater: false });
  const [ecoStats, setEcoStats] = useState({ carbonSaved: 12.5, rank: 4, ecoPoints: 450 });

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-body text-slate-950 pb-20">
      
      {/* Header HUD */}
      <section className="bg-slate-900 pt-32 pb-48 px-8 relative overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-10">
            <Globe className="absolute -right-20 -bottom-20 w-[400px] h-[400px] text-emerald-500 animate-spin-slow" />
         </div>
         
         <div className="max-w-6xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <div className="flex items-center gap-2 mb-6">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Green Protocol Enabled</p>
               </div>
               <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter leading-[0.85] uppercase text-white mb-8">AI Smart <br /> <span className="text-emerald-400">Habitat</span></h1>
               
               <div className="flex flex-wrap gap-4">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-4">
                     <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                        <Leaf className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Carbon Saved</p>
                        <p className="text-xl font-headline font-black text-white">{ecoStats.carbonSaved} KG</p>
                     </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-4">
                     <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
                        <Trophy className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Eco Rank</p>
                        <p className="text-xl font-headline font-black text-white">Top 5%</p>
                     </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-6 -mt-24 relative z-20">
         
         {/* Live Telemetry HUD */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Energy Optimization Card */}
            <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 flex flex-col md:flex-row gap-12 items-center">
               <div className="shrink-0 w-48 h-48 bg-slate-950 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border-8 border-emerald-500/20 rounded-full" />
                  <div className="absolute inset-0 border-t-8 border-emerald-500 rounded-full animate-spin-slow" />
                  <div className="text-center">
                     <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Efficiency</p>
                     <h3 className="text-4xl font-headline font-black text-white">98.2<span className="text-sm opacity-60 font-normal">%</span></h3>
                  </div>
               </div>
               
               <div className="flex-1 space-y-6">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-headline font-black text-slate-900 uppercase tracking-tighter">Energy Optimization</h3>
                     <p className="text-sm text-slate-400 font-medium">IoT sensors detect room occupancy and thermal loads, adjusting AC and lighting automatically.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 pt-4">
                     <div className="flex items-center gap-3">
                        <Thermometer className="w-5 h-5 text-rose-500" />
                        <div>
                           <p className="text-[10px] text-slate-400 uppercase font-bold">Safe Temp</p>
                           <p className="text-sm font-black">22°C ~ 24°C</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        <div>
                           <p className="text-[10px] text-slate-400 uppercase font-bold">Water Flow</p>
                           <p className="text-sm font-black text-emerald-500">Optimized</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Reward Points */}
            <div className="lg:col-span-4 bg-emerald-600 rounded-[3rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-emerald-900/10">
               <div>
                  <Zap className="w-8 h-8 mb-6" />
                  <h4 className="text-xl font-headline font-black uppercase tracking-tighter mb-2">Sustainability Rewards</h4>
                  <p className="text-emerald-100/70 text-sm font-medium">You've earned 450 points this month for saving energy! Redeem these in the hostel cafe.</p>
               </div>
               <button className="mt-8 py-4 bg-white text-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all">
                  Redeem Rewards
               </button>
            </div>
         </div>

         {/* Smart Room Controls */}
         <div className="space-y-8">
            <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-6 mb-8">
               <div>
                  <h2 className="text-3xl font-headline font-black text-slate-950 uppercase tracking-tighter">Smart Room Terminal</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Room 302 Protocol Override</p>
               </div>
               <div className="flex gap-2 text-emerald-600 font-bold text-sm items-center">
                  <ShieldCheck className="w-5 h-5" /> AI Autopilot Active
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <DeviceControl icon={Lightbulb} label="Primary Lights" status={devices.light} onToggle={() => setDevices({...devices, light: !devices.light})} color="bg-amber-500" />
               <DeviceControl icon={Fan} label="Ceiling Fan" status={devices.fan} onToggle={() => setDevices({...devices, fan: !devices.fan})} color="bg-blue-400" />
               <DeviceControl icon={Wind} label="Air Conditioner" status={devices.ac} onToggle={() => setDevices({...devices, ac: !devices.ac})} color="bg-cyan-500" />
               <DeviceControl icon={Zap} label="Geyser / Heater" status={devices.heater} onToggle={() => setDevices({...devices, heater: !devices.heater})} color="bg-rose-500" />
            </div>
         </div>

         {/* Carbon Tracker Visualization */}
         <div className="mt-24 bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-emerald-900/5 border border-slate-100 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6 text-center lg:text-left">
               <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Sustainability Analytics</p>
               </div>
               <h3 className="text-4xl font-headline font-black text-slate-950 uppercase tracking-tighter leading-none">Your Eco Impact</h3>
               <p className="text-slate-500 text-lg font-medium leading-relaxed italic">"Our carbon tracker gamifies sustainability. By reducing energy peaks, you directly contribute to the hostel's Net-Zero goal. Compete with Floor 3 for the title of 'Greenest Sanctuary'."</p>
               
               <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
                  <div className="text-center">
                     <p className="text-3xl font-headline font-black text-emerald-600">12.5KG</p>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">CO2 OFFSET</p>
                  </div>
                  <div className="w-px h-12 bg-slate-100" />
                  <div className="text-center">
                     <p className="text-3xl font-headline font-black text-slate-900">4th</p>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">FLOOR RANK</p>
                  </div>
                  <div className="w-px h-12 bg-slate-100" />
                  <div className="text-center">
                     <p className="text-3xl font-headline font-black text-slate-900">920</p>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">ECO-POINTS</p>
                  </div>
               </div>
            </div>
            
            <div className="shrink-0 w-full lg:w-[400px] h-[300px] bg-slate-50 rounded-[2.5rem] relative overflow-hidden group">
               {/* Simulated Chart */}
               <div className="absolute inset-x-8 bottom-8 flex items-end justify-between gap-4 h-32">
                  {[40, 70, 50, 90, 60, 80, 55].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1 }}
                      className={`w-full rounded-full ${i === 3 ? 'bg-emerald-500' : 'bg-slate-200'} group-hover:scale-y-110 transition-transform`}
                    />
                  ))}
               </div>
               <div className="p-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weekly Energy Peak Load</p>
               </div>
            </div>
         </div>

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default SmartLiving;
