import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Heart, Clock, Volume2, Search, Filter, Sparkles, CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND = 'http://localhost:5000';

const HabitIndicator = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
    <Icon className="w-4 h-4 text-indigo-500" />
    <div className="text-left">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const MatchCard = ({ match, percentage }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group overflow-hidden relative"
  >
     {/* Match Badge */}
     <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        {percentage}% Match
     </div>

     <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <div className="relative">
           <div className="w-24 h-24 rounded-[2rem] bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden font-black text-3xl">
              {match.fullName?.charAt(0)}
           </div>
           <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
           </div>
        </div>

        <div className="flex-1 space-y-4">
           <div>
              <h3 className="text-xl font-headline font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tighter">{match.fullName}</h3>
              <p className="text-xs text-slate-400 font-medium">Class of 2026 · {match.collegeId}</p>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <HabitIndicator icon={Clock} label="Sleeps" value={match.habits?.sleepTime || '11 PM'} />
              <HabitIndicator icon={Volume2} label="Noise" value={match.studySchedule?.noiseTolerance || 'Low'} />
              <HabitIndicator icon={Sparkles} label="Focus" value={match.studySchedule?.preferredTime || 'Morning'} />
           </div>

           <div className="flex flex-wrap gap-2 pt-2">
              {['Reading', 'Coding', 'Music'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">#{tag}</span>
              ))}
           </div>

           <div className="flex gap-4 pt-4">
              <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                <MessageSquare className="w-4 h-4" /> Say Hello
              </button>
              <button className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-all border border-slate-100">
                <Heart className="w-6 h-6" />
              </button>
           </div>
        </div>
     </div>
  </motion.div>
);

const RoommateMatcher = () => {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulated Matches
  useEffect(() => {
    const fetchMatches = async () => {
      // In a real system, we'd hit /api/ai/matchmaking
      setTimeout(() => {
        setMatches([
          { fullName: 'Aditya Raj', collegeId: 'CS2025', habits: { sleepTime: '10:30 PM' }, studySchedule: { noiseTolerance: 'Low', preferredTime: 'Morning' } },
          { fullName: 'Sameer Khan', collegeId: 'IT2024', habits: { sleepTime: '12:00 AM' }, studySchedule: { noiseTolerance: 'Medium', preferredTime: 'Late Night' } },
          { fullName: 'Vikram Mehta', collegeId: 'ME2026', habits: { sleepTime: '11:00 PM' }, studySchedule: { noiseTolerance: 'Low', preferredTime: 'Afternoon' } },
        ]);
        setLoading(false);
      }, 1500);
    };
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-slate-900 pb-20">
      
      {/* Dynamic Header */}
      <section className="bg-indigo-600 pt-32 pb-40 px-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 border-8 border-white rounded-full animate-pulse delay-700" />
            <Sparkles className="absolute top-40 right-40 w-20 h-20 text-white animate-bounce" />
         </div>
         
         <div className="max-w-5xl mx-auto relative z-10 text-center text-white">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
               <span className="px-4 py-1 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.3em] inline-block mb-6 border border-white/20">AI Intelligence Core</span>
               <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tight leading-none mb-6">Perfect Match. <br /> Effortless Living.</h1>
               <p className="text-white/70 max-w-2xl mx-auto text-lg font-medium leading-relaxed">Our neural matchmaking engine analyzes habits, study flows, and personality types to connect you with the ideal roommate.</p>
            </motion.div>
         </div>
      </section>

      {/* Profile Setup / Match List */}
      <main className="max-w-5xl mx-auto px-6 -mt-24 relative z-20">
        
        {/* Match Controls */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 p-8 mb-12 flex flex-wrap gap-4 items-center justify-between border border-slate-100">
           <div className="flex gap-4 flex-1 min-w-[300px]">
              <div className="flex-1 relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                 <input type="text" placeholder="Filter by interests, major..." className="w-full bg-slate-50 border-none rounded-2xl px-12 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <button className="px-6 py-4 bg-slate-900 text-white rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest">
                 <Filter className="w-4 h-4" /> Filters
              </button>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Your Neural ID</p>
                 <p className="text-sm font-black text-indigo-600">ID: ALPHA-09X</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <button className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all shadow-xl shadow-emerald-500/5">
                Update Preferences
              </button>
           </div>
        </div>

        {/* Match List */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-headline font-black text-slate-950 uppercase tracking-tighter">Recommended Matches</h2>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                 <Sparkles className="w-4 h-4" /> AI Recommendations Active
              </div>
           </div>

           {loading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full" 
                />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Synching with network...</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {matches.map((m, i) => (
                   <MatchCard key={m.fullName} match={m} percentage={98 - i * (Math.random() * 5)} />
                ))}
             </div>
           )}

           {/* Empty State / Bottom Info */}
           <div className="bg-indigo-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-indigo-100 mt-12">
              <Sparkles className="w-12 h-12 text-indigo-300 mx-auto mb-6" />
              <h3 className="text-xl font-black text-indigo-900 mb-2">Want more precise matches?</h3>
              <p className="text-indigo-600/70 text-sm max-w-lg mx-auto mb-8 font-medium">By completing your deep habits survey, we can analyze sleep patterns and study cycles with 99.9% accuracy.</p>
              <button className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-xl shadow-indigo-600/10 hover:scale-105 transition-all">Start Deep Habits Survey</button>
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

export default RoommateMatcher;
