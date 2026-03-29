import React, { useState } from 'react';
import { Trophy, Star, Award, Shield, Users, Zap, TrendingUp, Sparkles, Medal, Heart, Target, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeaderboardRow = ({ rank, name, points, change }) => (
  <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl transition-all group overflow-hidden relative">
     <div className="flex items-center gap-6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${rank === 1 ? 'bg-amber-100 text-amber-600' : rank === 2 ? 'bg-slate-100 text-slate-500' : rank === 3 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'}`}>
           {rank}
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold overflow-hidden uppercase">
           {name.charAt(0)}
        </div>
        <div>
           <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-widest text-xs">{name}</h4>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Level 12</span>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           </div>
        </div>
     </div>
     
     <div className="text-right">
        <div className="text-xl font-headline font-black text-slate-900">{points}</div>
        <div className={`text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center justify-end gap-1`}>
           <TrendingUp className="w-3 h-3" /> +{change} pts
        </div>
     </div>
  </div>
);

const BadgeCard = ({ name, icon: Icon, color }) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col items-center gap-4 hover:shadow-2xl transition-all group relative overflow-hidden">
     <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 rounded-bl-3xl group-hover:scale-125 transition-transform ${color}`} />
     <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color.replace('bg-', 'bg-').replace('-500', '-50')} ${color.replace('bg-', 'text-')}`}>
        <Icon className="w-8 h-8" />
     </div>
     <div className="text-center">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{name}</h4>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">Earned Dec 12</p>
     </div>
  </div>
);

const Gamification = () => {
  const [activeTab, setActiveTab] = useState('floor-ranking');
  const [missionStarted, setMissionStarted] = useState(false);

  const rankData = {
    'floor-ranking': [
      { rank: 1, name: 'Sohan Patel', points: 12450, change: 450 },
      { rank: 2, name: 'Rohan Sharma', points: 11200, change: 220 },
      { rank: 3, name: 'Vikram Mehta', points: 10800, change: 310 },
      { rank: 4, name: 'Aditya Raj', points: 9400, change: 150 },
    ],
    'monthly-pulse': [
      { rank: 1, name: 'Vikram Mehta', points: 2100, change: 800 },
      { rank: 2, name: 'Aditya Raj', points: 1950, change: 450 },
      { rank: 3, name: 'Sohan Patel', points: 1800, change: 300 },
      { rank: 4, name: 'Rohan Sharma', points: 1200, change: 100 },
    ],
    'global-standings': [
      { rank: 1, name: 'Ananya Gupta', points: 45000, change: 1200 },
      { rank: 2, name: 'Sohan Patel', points: 42450, change: 450 },
      { rank: 3, name: 'Priya Singh', points: 39800, change: 600 },
      { rank: 4, name: 'Rohan Sharma', points: 38200, change: 220 },
    ]
  };

  const currentRanks = rankData[activeTab] || rankData['floor-ranking'];

  const badges = [
    { name: 'Eco Warrior', icon: Zap, color: 'bg-emerald-500' },
    { name: 'Social Star', icon: Users, color: 'bg-indigo-500' },
    { name: 'Peace Maker', icon: Heart, color: 'bg-rose-500' },
    { name: 'Event Pro', icon: Star, color: 'bg-amber-500' },
    { name: 'Quick Fix', icon: Target, color: 'bg-cyan-500' },
    { name: 'Top Mentor', icon: Shield, color: 'bg-violet-500' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-body text-slate-900 pb-20 pt-20">
      <main className="max-w-6xl mx-auto px-8 py-12">
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Hall of Fame */}
            <div className="lg:col-span-8 space-y-12">
               <div>
                  <span className="px-4 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] inline-block mb-6 border border-amber-200">Neural Reward System</span>
                  <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter leading-[0.9] uppercase text-slate-950 mb-6">Hall of <br /> <span className="text-amber-600">Fame</span></h1>
                  <p className="text-slate-400 max-w-lg text-lg font-medium">Earn points for sustainable living, community participation, and discipline. Compete for the title of 'Hostel Legend'.</p>
               </div>

               <div className="flex gap-4 border-b border-slate-100 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  {['Floor Ranking', 'Monthly Pulse', 'Global Standings'].map(tab => {
                    const tabId = tab.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <button 
                        key={tab}
                        className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tabId ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-900'}`}
                        onClick={() => setActiveTab(tabId)}
                      >
                        {tab}
                      </button>
                    );
                  })}
               </div>

               <div className="space-y-4 relative min-h-[380px]">
                 <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 absolute w-full"
                  >
                    {currentRanks.map(r => (
                      <LeaderboardRow key={r.rank} {...r} />
                    ))}
                  </motion.div>
                 </AnimatePresence>
               </div>

               <div className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden group mt-12">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 opacity-10 blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                     <div className={`w-40 h-40 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shrink-0 transition-all duration-500 ${missionStarted ? 'shadow-[0_0_40px_rgba(245,158,11,0.5)]' : ''}`}>
                        <Flame className={`w-20 h-20 text-amber-500 ${missionStarted ? 'animate-bounce' : 'animate-pulse'}`} />
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <h3 className="text-3xl font-headline font-black uppercase tracking-tighter mb-4">Elite Challenges</h3>
                        <p className="text-white/60 mb-8 font-medium italic">"Current Mission: Reduce your AC usage by 10% this week to earn the 'Sustainable Soul' mega-badge and 500 points."</p>
                        <button 
                          onClick={() => setMissionStarted(true)}
                          className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/10 ${missionStarted ? 'bg-emerald-500 text-white cursor-default' : 'bg-amber-500 text-slate-950 hover:bg-white'}`}
                        >
                          {missionStarted ? 'Mission Synced & Active' : 'Start Mission'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Badges & Rewards */}
            <div className="lg:col-span-4 space-y-12 sticky top-32">
               
               <div className="bg-indigo-600 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none grayscale brightness-150">
                     <div className="absolute inset-0 bg-gradient-to-tr from-white to-transparent" />
                  </div>
                  <div className="relative z-10 space-y-8">
                     <div className="flex justify-between items-start">
                        <span className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                           <Medal className="w-6 h-6" />
                        </span>
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-indigo-200 tracking-widest uppercase">Points Balance</p>
                           <p className="text-3xl font-headline font-black">9,420</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                           <span>Level Progress</span>
                           <span>75%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-white shadow-[0_0_15px_white]" />
                        </div>
                        <p className="text-[10px] text-white/60 font-medium italic">Earning the 'Elite' status at 10,000 points unlocks premium room upgrades.</p>
                     </div>
                  </div>
               </div>

               <div>
                  <h3 className="text-xl font-headline font-black uppercase tracking-tighter mb-6 flex items-center gap-2 text-slate-900 pl-2">
                     <Award className="w-6 h-6 text-amber-500" /> Digital Badgetry
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     {badges.map(b => (
                       <BadgeCard key={b.name} {...b} />
                     ))}
                  </div>
                  <button className="w-full mt-8 py-5 border-2 border-dashed border-slate-100 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:border-amber-500 hover:text-amber-600 transition-all">
                     View Complete Collection
                  </button>
               </div>

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

export default Gamification;
