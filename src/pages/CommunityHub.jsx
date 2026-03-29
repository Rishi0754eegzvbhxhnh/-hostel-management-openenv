import React, { useState } from 'react';
import { Compass, Users, Sparkles, Code, Music, Pencil, Briefcase, GraduationCap, Calendar, Zap, MessageSquare, Handshake, Search, Filter, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SkillCard = ({ name, skill, bio, level, icon: Icon }) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
     <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[4rem] group-hover:scale-110 mb-6 transition-transform" />
     <div>
        <div className="flex justify-between items-start mb-6">
           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800 font-black overflow-hidden uppercase text-xl border border-slate-100 shadow-sm">
              {name.charAt(0)}
           </div>
           <div className="text-right">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                 {level}
              </span>
           </div>
        </div>

        <h3 className="text-xl font-headline font-black text-slate-900 uppercase tracking-tighter mb-1">{name}</h3>
        <p className="flex items-center gap-1.5 text-xs text-indigo-600 font-black uppercase tracking-[0.1em] mb-4">
           {skill}
        </p>

        <p className="text-sm text-slate-400 font-medium leading-relaxed italic mb-8">"{bio}"</p>
     </div>

     <div className="flex gap-4">
        <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10">
           Request Mentorship
        </button>
        <button className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100 shadow-sm">
           <MessageSquare className="w-5 h-5" />
        </button>
     </div>
  </div>
);

const OpportunityCard = ({ type, title, company, reward, deadline, icon: Icon, color }) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-6 hover:shadow-xl transition-all group">
     <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${color} shadow-lg shadow-indigo-100 shrink-0`}>
        <Icon className="w-8 h-8 text-white" />
     </div>
     <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{type}</span>
           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{deadline}</span>
        </div>
        <h4 className="font-headline font-black text-slate-900 uppercase tracking-tight">{title}</h4>
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">{company} · {reward}</p>
     </div>
     <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
        <ArrowRight className="w-5 h-5" />
     </button>
  </div>
);

const CommunityHub = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const mentors = [
    { name: 'Rohan Sharma', skill: 'React & AI Systems', bio: 'Helping 10+ students with advanced frontend architectures.', level: 'Expert Mentor', icon: Code },
    { name: 'Aditi Verma', skill: 'UI/UX Design', bio: 'Figma enthusiast. Master of Figma components and auto-layout.', level: 'Design Lead', icon: Pencil },
    { name: 'Sohan Singh', skill: 'Public Speaking', bio: 'TEDx speaker. I can help you crush your presentations.', level: 'Mentor', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-body text-slate-950 pb-20 pt-20">
      
      {/* Header HUD */}
      <section className="bg-slate-950 text-white pt-32 pb-48 px-8 relative overflow-hidden">
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 to-transparent z-10" />
         <div className="absolute inset-0 z-0 opacity-20">
            <Compass className="absolute -left-20 -bottom-20 w-[400px] h-[400px] text-indigo-400 animate-spin-slow" />
         </div>
         
         <div className="max-w-6xl mx-auto relative z-20">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
               <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Hostel Neural Networking Core</p>
               </div>
               <h1 className="text-6xl md:text-9xl font-headline font-black tracking-tighter leading-[0.8] uppercase text-center md:text-left">Community <br /> <span className="text-indigo-400">Synapse</span></h1>
               
               <div className="mt-12 flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[2rem] flex items-center gap-6">
                     <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Users className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Peer Mentors</p>
                        <p className="text-2xl font-headline font-black">124 Elite</p>
                     </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[2rem] flex items-center gap-6">
                     <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                        <Calendar className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Next Event</p>
                        <p className="text-2xl font-headline font-black">AI Hackathon</p>
                     </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-6 -mt-24 relative z-30">
         
         {/* Filter Terminal */}
         <div className="bg-white rounded-[3rem] shadow-2xl p-8 mb-16 flex flex-wrap items-center justify-between gap-6 border border-slate-100">
            <div className="flex-1 min-w-[300px] relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
               <input type="text" placeholder="Search skills, scholarship IDs, or events..." className="w-full bg-slate-50 border-none rounded-[2rem] px-16 py-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400" />
            </div>
            <div className="flex gap-3">
               <button className="px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-indigo-600 transition-all">
                  Signal Interest
               </button>
               <button className="w-[60px] h-[60px] bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all">
                  <Filter className="w-5 h-5" />
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Skill-Sharing Hub */}
            <div className="lg:col-span-8 space-y-12">
               <div className="flex items-center justify-between pl-4">
                  <div>
                     <h3 className="text-3xl font-headline font-black uppercase tracking-tighter">Skill-Sharing Hub</h3>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Peer-to-Peer Mentorship Node</p>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                     <Sparkles className="w-4 h-4" /> AI Matching Active
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {mentors.map(m => (
                    <SkillCard key={m.name} {...m} />
                  ))}
                  <div className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-indigo-400 hover:bg-white transition-all">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <Zap className="w-8 h-8" />
                     </div>
                     <h4 className="text-lg font-headline font-black text-slate-900 uppercase tracking-tighter">Become a Mentor</h4>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Earn 500 Bonus Points</p>
                  </div>
               </div>

               {/* AI Event Planner Card */}
               <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/10">
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                     <div className="shrink-0 w-44 h-44 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 flex flex-col justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Next Best Event</p>
                        <div>
                           <p className="text-6xl font-headline font-black leading-none">24</p>
                           <p className="text-xs font-black uppercase tracking-widest mt-1">MARCH</p>
                        </div>
                     </div>
                     <div className="flex-1 space-y-6">
                        <h4 className="text-4xl font-headline font-black uppercase tracking-tighter leading-none">Code & Coffee <br /> Neural Workshop</h4>
                        <p className="text-indigo-100/70 text-lg font-medium italic">"Based on your interest in 'React' and 'AI', our planner suggests you attend this peer workshop on Block A Rooftop."</p>
                        <button className="px-10 py-4 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Claim VIP Slot</button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Opportunities Terminal */}
            <div className="lg:col-span-4 space-y-12">
               <div>
                  <h3 className="text-xl font-headline font-black uppercase tracking-tighter mb-8 flex items-center gap-2 pl-4">
                     <Briefcase className="w-6 h-6 text-indigo-600" /> Opportunity Matrix
                  </h3>
                  <div className="space-y-4">
                     <OpportunityCard type="Scholarship" title="AI Excellence Grant" company="OpenAI Research" reward="₹50,000" deadline="3D Left" icon={GraduationCap} color="bg-emerald-500" />
                     <OpportunityCard type="Internship" title="Full Stack Intern" company="Google India" reward="Stipend: ₹1L" deadline="12D Left" icon={Code} color="bg-indigo-500" />
                     <OpportunityCard type="Volunteer" title="Hostel Tech Lead" company="Admin Core" reward="Free Meal Coupons" deadline="Expired" icon={Handshake} color="bg-amber-500" />
                     <OpportunityCard type="Scholarship" title="STEM Women Hub" company="AWS Foundation" reward="₹1.2L Support" deadline="8D Left" icon={Sparkles} color="bg-rose-500" />
                  </div>
                  <button className="w-full mt-10 py-6 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all">
                     Refresh Global Matrix
                  </button>
               </div>
               
               {/* Community Pulse Card */}
               <div className="bg-emerald-50 rounded-[3rem] p-10 border border-emerald-100/50">
                  <div className="flex items-center gap-2 mb-4">
                     <Zap className="w-4 h-4 text-emerald-600" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Community Pulse</p>
                  </div>
                  <h4 className="text-xl font-headline font-black text-emerald-950 uppercase tracking-tighter mb-4">Active Mentorships</h4>
                  <div className="flex -space-x-4 mb-6">
                     {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                          U{i}
                       </div>
                     ))}
                     <div className="w-12 h-12 rounded-full border-4 border-white bg-emerald-500 flex items-center justify-center font-bold text-xs text-white">
                        +84
                     </div>
                  </div>
                  <p className="text-emerald-700/70 text-sm font-medium italic">84 students joined mentorship groups in the last 24 hours. The hub is thriving!</p>
               </div>
            </div>

         </div>

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        .animate-spin-slow { animation: spin 25s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default CommunityHub;
