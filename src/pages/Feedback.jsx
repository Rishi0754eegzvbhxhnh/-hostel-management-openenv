import React, { useState } from 'react';
import { MessageSquare, Heart, ThumbsUp, Send, Sparkles, Zap, ShieldCheck, Filter, Search, Globe, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackCard = ({ title, category, author, content, likes, status }) => (
  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
     <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/5 rounded-bl-[4rem] group-hover:scale-110 mb-6 transition-transform" />
     <div>
        <div className="flex justify-between items-start mb-6">
           <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${category === 'Idea' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {category}
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{status}</span>
        </div>

        <h3 className="text-xl font-headline font-black text-slate-900 uppercase tracking-tighter mb-2">{title}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 font-body">"{content}"</p>
        
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
              {author.charAt(0)}
           </div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{author}</p>
        </div>
     </div>

     <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
        <button className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
           <ThumbsUp className="w-4 h-4" /> {likes} Endorsements
        </button>
        <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
           <MessageSquare className="w-4 h-4" />
        </button>
     </div>
  </div>
);

const FeedbackHub = () => {
  const [submissionStatus, setSubmissionStatus] = useState(false);

  const feedbacks = [
    { title: 'Smart Lighting in Hall 4', category: 'Idea', author: 'Aman Deep', content: 'Suggesting movement sensors for the common area in Hall 4 to save more energy.', likes: 42, status: 'Under Review' },
    { title: 'Pet Friendly Common Area', category: 'Suggestion', author: 'Sonal Verma', content: 'Implementing a small zone where we can bring trained pets during weekends.', likes: 18, status: 'Discussing' },
    { title: 'Weekend Night Canteen', category: 'Idea', author: 'Rahul Kaushik', content: 'Canteen should be open till 2 AM on Fridays and Saturdays for late-trackers.', likes: 89, status: 'Approved' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-body text-slate-950 pb-20 pt-20">
      
      {/* Header HERO */}
      <section className="bg-indigo-600 pt-32 pb-48 px-8 relative overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-10">
            <Globe className="absolute -right-20 -bottom-20 w-[400px] h-[400px] text-white animate-spin-slow" />
         </div>
         
         <div className="max-w-6xl mx-auto relative z-10 text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <span className="px-4 py-1 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.4em] inline-block mb-6 border border-white/20">Voice Protocol Alpha</span>
               <h1 className="text-6xl md:text-8xl font-headline font-black tracking-tighter leading-none mb-6">Hostel Pulse: <br /> <span className="text-indigo-200">Better Living</span></h1>
               <p className="text-white/70 max-w-2xl mx-auto text-lg font-medium">Your feedback is the neural engine of our system. Propose ideas, endorse suggestions, and shape the futuristic hostel experience.</p>
            </motion.div>
         </div>
      </section>

      {/* Main Portal */}
      <main className="max-w-6xl mx-auto px-6 -mt-24 relative z-20">
         
         {/* Feedback Submission HUD */}
         <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/10 p-10 mb-16 border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-6">
               <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-headline font-black text-slate-900 uppercase tracking-tighter">Submit Neural Insight</h3>
               <p className="text-slate-400 text-sm font-medium">Propose a life improvement. Our AI will categorize and route it to the appropriate council committee.</p>
            </div>
            
            <div className="lg:col-span-8 flex flex-col gap-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Pulse Title (e.g. Roof Top Garden)" className="bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10" />
                  <select className="bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 uppercase font-black text-[10px] tracking-widest text-slate-500">
                     <option>Neural Idea</option>
                     <option>Infrastructure Suggestion</option>
                     <option>Policy Refresh</option>
                  </select>
               </div>
               <textarea placeholder="Describe how this improves hostel ecosystem..." rows={4} className="bg-slate-50 border-none rounded-2xl px-6 py-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 resize-none"></textarea>
               <button className="py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-950/10">
                  Transmit Feedback Signal
               </button>
            </div>
         </div>

         {/* Grid Flow */}
         <div className="space-y-12">
            <div className="flex items-center justify-between pl-6 border-l-4 border-indigo-600">
               <div>
                  <h2 className="text-3xl font-headline font-black text-slate-950 uppercase tracking-tighter">Community Endorsements</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Found 142 Active Proposals</p>
               </div>
               <div className="flex gap-4">
                  <button className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                     <Filter className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                     <Search className="w-5 h-5" />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {feedbacks.map(f => (
                 <FeedbackCard key={f.title} {...f} />
               ))}
               <div className="bg-indigo-50 rounded-[2.5rem] border-2 border-dashed border-indigo-100 flex flex-col items-center justify-center p-12 text-center group transition-all">
                  <PartyPopper className="w-12 h-12 text-indigo-300 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-headline font-black text-indigo-900 uppercase">Be the Voice</h4>
                  <p className="text-xs text-indigo-600/70 font-bold uppercase tracking-widest mt-2 max-w-[200px]">Help us build a host of the future.</p>
               </div>
            </div>
         </div>

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        .animate-spin-slow { animation: spin 30s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default FeedbackHub;
