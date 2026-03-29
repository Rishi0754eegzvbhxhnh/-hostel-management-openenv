import React, { useState } from 'react';
import { Activity, Wind, AlertCircle, ShoppingCart, Users, Zap, Search, Bell, Map, Calendar, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InventoryCard = ({ name, stock, threshold, status }) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
     <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 opacity-5 rounded-bl-[4rem] group-hover:scale-110 mb-6" />
     <div>
        <div className="flex justify-between items-start mb-4">
           <h4 className="text-xl font-headline font-black text-slate-900 uppercase tracking-tighter">{name}</h4>
           <div className={`w-3 h-3 rounded-full ${status === 'low' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
        </div>
        <div className="flex items-center justify-between mb-4">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">In Stock</p>
           <p className="text-lg font-black text-indigo-600">{stock} Units</p>
        </div>
        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
           <motion.div initial={{ width: 0 }} animate={{ width: `${(stock / (threshold * 2)) * 100}%` }} className={`h-full ${status === 'low' ? 'bg-red-500' : 'bg-indigo-600'}`} />
        </div>
     </div>
     <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">
        {status === 'low' ? 'Auto-Reorder Initiated' : 'Check Inventory'}
     </button>
  </div>
);

const PredictionCard = ({ label, value, trend, icon: Icon, color }) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all group">
     <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-indigo-100`}>
           <Icon className="w-8 h-8" />
        </div>
        <div className="text-right">
           <p className={`text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% Predicted
           </p>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">For Next 30 Days</p>
        </div>
     </div>
     <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">{label}</h4>
        <p className="text-4xl font-headline font-black text-slate-900 tracking-tighter">{value}</p>
     </div>
  </div>
);

const PredictiveDashboard = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'emergency', msg: 'Neural Pattern Spike: Unusual Electricity Surge Block B 4th Floor', time: '2m ago' },
    { id: 2, type: 'inventory', msg: 'Stock Alert: Cleaning Supplies below strategy threshold', time: '10m ago' },
    { id: 3, type: 'forecast', msg: 'Food Demand: Mess load predicted to spike by 15% on Friday night', time: '40m ago' }
  ]);

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-body text-slate-950 pb-20 pt-20">
      <main className="max-w-7xl mx-auto px-8 py-12">
         
         {/* HUD Hero */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
            <div className="lg:col-span-8 flex flex-col justify-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Hostel AI Strategy Core Active</p>
               </div>
               <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter leading-[0.85] uppercase text-slate-900">Predictive <br /> <span className="text-indigo-600">Forecaster</span></h1>
               <p className="text-slate-400 max-w-lg text-lg font-medium leading-relaxed italic">"Admin Neural Engine: Predicting trends, managing inventory automation, and detecting infrastructure anomalies before they occur."</p>
            </div>
            
            <div className="lg:col-span-4 bg-slate-950 rounded-[3.5rem] p-10 text-white relative flex flex-col justify-between shadow-2xl shadow-indigo-950/20 overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 blur-[60px] group-hover:scale-125 transition-transform" />
               <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total System Confidence</p>
                     <Cpu className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-5xl font-headline font-black">99.8<span className="text-sm opacity-40 font-normal">%</span></h3>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: '99.8%' }} className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]" />
                  </div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Active Predictive Nodes: 1,420</p>
               </div>
            </div>
         </div>

         {/* Alerts HUD */}
         <div className="mb-16">
            <div className="flex items-center justify-between mb-8 pl-4">
               <h3 className="text-xl font-headline font-black uppercase tracking-tight flex items-center gap-2">
                  <Bell className="w-6 h-6 text-red-500" /> Neural Alerts Matrix
               </h3>
               <button className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Clear Signal</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <AnimatePresence>
                  {alerts.map(a => (
                    <motion.div 
                      key={a.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-6 bg-white border-l-4 rounded-3xl border border-slate-100 flex gap-4 items-start ${a.type === 'emergency' ? 'border-l-red-500' : a.type === 'inventory' ? 'border-l-amber-500' : 'border-l-indigo-600'}`}
                    >
                       <AlertCircle className={`w-6 h-6 shrink-0 ${a.type === 'emergency' ? 'text-red-500' : a.type === 'inventory' ? 'text-amber-500' : 'text-indigo-500'}`} />
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{a.time}</p>
                          <p className="text-sm font-bold text-slate-800 leading-snug">{a.msg}</p>
                       </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>

         {/* Forecasting Grid */}
         <div className="space-y-8 mb-16">
            <div className="flex items-center justify-between pl-4">
               <div>
                  <h3 className="text-3xl font-headline font-black uppercase tracking-tighter">Strategic Forecaster</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">AI Inferred Trends</p>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <PredictionCard label="Occupancy Trend" value="94.2%" trend={+3.5} icon={Users} color="bg-indigo-50 text-indigo-600" />
               <PredictionCard label="Electricity Demand" value="1,240kW" trend={-2.1} icon={Zap} color="bg-emerald-50 text-emerald-600" />
               <PredictionCard label="Mess Food Demand" value="1,840" trend={+12.4} icon={ShoppingCart} color="bg-cyan-50 text-cyan-600" />
               <PredictionCard label="Water Consumed" value="12,450L" trend={+0.5} icon={Activity} color="bg-blue-50 text-blue-600" />
            </div>
         </div>

         {/* Smart Inventory Terminal */}
         <div className="space-y-8">
            <div className="flex items-center justify-between border-l-4 border-indigo-600 pl-6 mb-8">
               <div>
                  <h2 className="text-3xl font-headline font-black text-slate-950 uppercase tracking-tighter">Smart Inventory Loop</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Hostel Automated Logistics Terminal</p>
               </div>
               <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-indigo-600 hover:text-white transition-all">
                     <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
                     <ArrowRight className="w-5 h-5" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               <InventoryCard name="Cleaning Kit" stock={42} threshold={50} status="low" />
               <InventoryCard name="Bedsheets" stock={145} threshold={80} status="normal" />
               <InventoryCard name="Sanitizers" stock={320} threshold={100} status="normal" />
               <InventoryCard name="Cutlery Sets" stock={12} threshold={40} status="low" />
            </div>
         </div>

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
      `}} />
    </div>
  );
};

export default PredictiveDashboard;
