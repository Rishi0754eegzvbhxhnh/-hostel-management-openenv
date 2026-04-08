import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Terminal, Users, Clock, Box, ShieldCheck, MapPin, Zap, AlertCircle, CheckCircle2, Search, ArrowRight, Activity, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PodCard = ({ pod, onBook }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col justify-between hover:shadow-2xl hover:shadow-cyan-500/10 transition-all group overflow-hidden relative"
  >
     <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform -z-0" />
     
     <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pod.isAvailable ? 'bg-cyan-50 text-cyan-600' : 'bg-red-50 text-red-500'}`}>
              <Box className="w-6 h-6" />
           </div>
           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pod.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {pod.isAvailable ? 'Available' : 'Booked Until 4 PM'}
           </span>
        </div>

        <h3 className="text-xl font-headline font-black text-slate-900 mb-2 uppercase tracking-tighter">{pod.podName}</h3>
        <p className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-[0.1em] mb-4">
           <MapPin className="w-3.5 h-3.5" /> Block {pod.block} · Wing A
        </p>

        <div className="space-y-4">
           <div className="flex items-center justify-between py-3 border-y border-slate-50">
              <div className="flex items-center gap-2">
                 <Users className="w-4 h-4 text-slate-300" />
                 <span className="text-xs font-bold text-slate-700">{pod.capacity} Pax</span>
              </div>
              <div className="flex items-center gap-2">
                 <Zap className="w-4 h-4 text-cyan-500" />
                 <span className="text-xs font-bold text-slate-700">GigaFiber</span>
              </div>
           </div>
           
           <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{pod.amenities?.join(', ') || 'Smart Board, High-Speed Wi-Fi, Coffee Access'}"</p>
        </div>
     </div>

     <button 
       disabled={!pod.isAvailable}
       onClick={() => onBook(pod)}
       className={`mt-8 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all relative z-10 shadow-lg ${pod.isAvailable ? 'bg-slate-900 text-white hover:bg-cyan-600 shadow-cyan-900/10' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
     >
       {pod.isAvailable ? 'Secure Pod Now' : 'Pod Occupied'}
     </button>
  </motion.div>
);

const StudyPods = () => {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPod, setSelectedPod] = useState(null);

  useEffect(() => {
    const fetchPods = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/studypods`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setPods(response.data.pods.map(pod => ({
            ...pod,
            isAvailable: pod.availableSeats > 0
          })));
        }
      } catch (error) {
        console.error('Failed to fetch study pods:', error);
        // Fallback to demo data
        setPods([
          { _id: 1, podName: 'The Nexus', block: 'A', capacity: 4, isAvailable: true, amenities: ['Smart Board', 'Coffee Access'] },
          { _id: 2, podName: 'Deep Focus', block: 'B', capacity: 2, isAvailable: true, amenities: ['Acoustic Foam', 'Soft Lighting'] },
          { _id: 3, podName: 'Orbit Hub', block: 'C', capacity: 8, isAvailable: false, amenities: ['Dual Monitors', 'Whiteboard'] },
          { _id: 4, podName: 'Quiet Shell', block: 'A', capacity: 1, isAvailable: true, amenities: ['Noise Cancellation', 'Ergo Chair'] },
          { _id: 5, podName: 'Collab Zone', block: 'D', capacity: 6, isAvailable: true, amenities: ['VR Ready', 'Projector'] }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPods();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-body text-slate-950 pb-20">
      
      {/* Header HUD */}
      <section className="bg-slate-950 text-white pt-32 pb-48 px-8 relative overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-500/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-indigo-500/20 blur-[100px] rounded-full" />
         </div>
         
         <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div className="flex-1 space-y-6">
               <div className="flex items-center gap-2 justify-center md:justify-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Environment Node Active</p>
               </div>
               <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter leading-[0.9] uppercase">Space <br /> Protocol: <span className="text-cyan-400 uppercase">Study</span></h1>
               <p className="text-slate-400 max-w-lg mx-auto md:mx-0 text-lg font-medium">Smart reservation system for on-demand deep focus pods and collaborative environments.</p>
            </div>
            
            <div className="w-full md:w-[400px] bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 space-y-6">
               <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Loadout</p>
                  <Activity className="w-4 h-4 text-cyan-400" />
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-bold opacity-60">Total Capacity</span>
                     <span className="text-sm font-black">24 Slots</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-cyan-500" />
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-bold opacity-60">Usage Intensity</span>
                     <span className="text-sm font-black text-cyan-400">92%</span>
                  </div>
               </div>
               <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-cyan-400 transition-all">Schedule Override</button>
            </div>
         </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-6 -mt-24 relative z-20">
         
         {/* Filter HUD */}
         <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 p-8 mb-12 flex flex-wrap gap-6 items-center border border-slate-100">
            <div className="flex-1 min-w-[200px] space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Target Block</p>
               <select className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-xs font-black uppercase cursor-pointer focus:ring-2 focus:ring-cyan-500/20">
                  <option>Strategic Block A</option>
                  <option>Strategic Block B</option>
                  <option>Strategic Block C</option>
               </select>
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Duration Cycle</p>
               <select className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-xs font-black uppercase cursor-pointer focus:ring-2 focus:ring-cyan-500/20">
                  <option>90 Min Hyperfocus</option>
                  <option>4 Hour Collab</option>
                  <option>All Day Marathon</option>
               </select>
            </div>
            <button className="h-[60px] px-10 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-950/10">
               Update Matrix
            </button>
         </div>

         {/* Grid Body */}
         <div className="space-y-8">
            <div className="flex items-center justify-between border-l-4 border-cyan-500 pl-6">
               <div>
                  <h2 className="text-2xl font-headline font-black text-slate-950 uppercase tracking-tighter">Available Nodes</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Found {pods.length} pods in your vicinity</p>
               </div>
               <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-all">
                     <Search className="w-4 h-4" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-all">
                     <Calendar className="w-4 h-4" />
                  </div>
               </div>
            </div>

            {loading ? (
               <div className="py-20 text-center space-y-4">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-20 h-20 bg-cyan-500/10 rounded-[2rem] mx-auto flex items-center justify-center">
                     <Box className="w-8 h-8 text-cyan-600" />
                  </motion.div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600 animate-pulse">Scanning Grid...</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pods.map(p => (
                     <PodCard key={p._id || p.id} pod={p} onBook={(pod) => setSelectedPod(pod)} />
                  ))}
               </div>
            )}
         </div>

         {/* Recommendations Section */}
         <div className="mt-24 bg-gradient-to-br from-cyan-600 to-indigo-700 rounded-[3.5rem] p-12 text-white relative overflow-hidden group">
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="relative z-10 max-w-2xl">
               <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-cyan-300" />
                  <p className="text-xs font-black uppercase tracking-[0.4em]">AI Intelligent Routing</p>
               </div>
               <h3 className="text-4xl font-headline font-black mb-6 uppercase tracking-tighter">Optimized Study Route Found</h3>
               <p className="text-cyan-100 text-lg mb-10 leading-relaxed font-medium">Based on your sleep habits (Wakes at 7 AM) and study cycle, we recommend booking <span className="text-white font-black underline decoration-cyan-400">'The Nexus'</span> at Block A tomorrow morning at 8:30 AM.</p>
               <div className="flex gap-4">
                  <button className="px-10 py-5 bg-white text-cyan-900 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-2xl hover:scale-105 active:scale-95 transition-all">Accept Optimization</button>
                  <button className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-tighter hover:bg-white/20 transition-all">View Analytics</button>
               </div>
            </div>
         </div>

      </main>

      {/* Booking Drawer Placeholder */}
      <AnimatePresence>
         {selectedPod && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-4" onClick={() => setSelectedPod(null)}>
               <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-10">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600">Booking Reservation</span>
                        <h4 className="text-3xl font-headline font-black uppercase tracking-tighter">{selectedPod.podName}</h4>
                     </div>
                     <button onClick={() => setSelectedPod(null)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 rotate-45" />
                     </button>
                  </div>
                  
                  <div className="space-y-8 mb-10">
                     <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem]">
                        <div className="flex items-center gap-4">
                           <Clock className="w-5 h-5 text-slate-400" />
                           <p className="text-sm font-bold">Standard 90-Min Slot</p>
                        </div>
                        <p className="text-xs font-black text-cyan-600 uppercase">Confirmed</p>
                     </div>
                     <p className="text-slate-400 text-sm font-medium text-center italic">"Your unique biological study rhythm has been factored into this reservation."</p>
                  </div>

                  <button className="w-full py-5 bg-cyan-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-cyan-900/10 hover:bg-slate-900 transition-all">Finalize Reservation</button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
      `}} />
    </div>
  );
};

export default StudyPods;
