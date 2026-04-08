import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, MapPin, Users, Heart, Camera, Radio, Globe, Zap, ArrowRight, ShieldCheck, Sparkles, Plus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from '../components/Calendar'; // Reuse existing calendar core

const EventCard = ({ title, category, time, location, attendees, icon: Icon, color }) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
     <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-[4rem] group-hover:scale-110 transition-transform ${color}`} />
     <div>
        <div className="flex justify-between items-start mb-6">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.replace('bg-', 'bg-').replace('-500', '-50')} ${color.replace('bg-', 'text-')}`}>
              <Icon className="w-6 h-6" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{time}</span>
        </div>

        <h3 className="text-xl font-headline font-black text-slate-900 uppercase tracking-tighter mb-2">{title}</h3>
        <p className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
           <MapPin className="w-3.5 h-3.5" /> {location}
        </p>

        <div className="flex items-center gap-2 mb-8">
           <Users className="w-4 h-4 text-slate-300" />
           <span className="text-xs font-bold text-slate-700">{attendees} Students Registered</span>
        </div>
     </div>

     <button className="py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-950/10">
        Claim Entry Pass
     </button>
  </div>
);

const EventCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        // Fallback to demo data
        setEvents([
          { title: 'Neural Hackathon 2.0', category: 'Tech', startTime: '10:00', location: 'Block A Rooftop', attendees: 124, icon: Zap, color: 'bg-indigo-500' },
          { title: 'Sunset Yoga', category: 'Wellness', startTime: '17:30', location: 'Garden Area', attendees: 45, icon: Heart, color: 'bg-rose-500' },
          { title: 'Acoustic Night', category: 'Entertainment', startTime: '20:00', location: 'Hostel Mess', attendees: 89, icon: Radio, color: 'bg-amber-500' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getCategoryIcon = (category) => {
    const icons = {
      cultural: Heart,
      sports: Zap,
      academic: Globe,
      social: Radio,
      workshop: Camera
    };
    return icons[category] || Radio;
  };

  const getCategoryColor = (category) => {
    const colors = {
      cultural: 'bg-rose-500',
      sports: 'bg-indigo-500',
      academic: 'bg-blue-500',
      social: 'bg-amber-500',
      workshop: 'bg-green-500'
    };
    return colors[category] || 'bg-slate-500';
  };

  const featuredEvents = events.slice(0, 3).map(e => ({
    title: e.title,
    category: e.category,
    time: e.startTime,
    location: e.location,
    attendees: e.attendees?.length || 0,
    icon: getCategoryIcon(e.category),
    color: getCategoryColor(e.category)
  }));

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-body text-slate-900 pb-20 pt-20">
      <main className="max-w-7xl mx-auto px-8 py-12">
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* LEFT Column: Calendar & Controls */}
            <div className="lg:col-span-4 space-y-12 sticky top-32">
               <div>
                  <h1 className="text-5xl font-headline font-black tracking-tighter leading-none text-slate-950 mb-6 uppercase">Hostel <br /> <span className="text-indigo-600">Events Hub</span></h1>
                  <p className="text-slate-400 text-lg font-medium max-w-sm mb-12 italic leading-relaxed">Planning your weekend? Explore live activities, workshops, and community socials.</p>
               </div>

               <div className="bg-slate-950 rounded-[3rem] p-8 shadow-2xl shadow-indigo-950/20 overflow-hidden">
                  <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl text-white">
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Selected Node</p>
                     <p className="text-sm font-black">{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <Calendar 
                    selectedDate={selectedDate} 
                    onDateSelect={(date) => setSelectedDate(date)} 
                  />
                  <button className="w-full mt-10 py-5 bg-white text-slate-950 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-400 transition-all">
                     View All Upcoming Events
                  </button>
               </div>
            </div>

            {/* RIGHT Column: Event List & Features */}
            <div className="lg:col-span-8 space-y-12">
               
               {/* Dashboard Overlay Card */}
               <div className="bg-indigo-600 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/10 mb-16">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                     <div className="shrink-0 w-44 h-44 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 flex flex-col justify-between">
                        <CalendarIcon className="w-8 h-8 opacity-40 text-white" />
                        <div>
                           <p className="text-sm font-black opacity-60 uppercase tracking-widest">Next Major</p>
                           <p className="text-5xl font-headline font-black leading-none uppercase">30</p>
                           <p className="text-[10px] font-black uppercase mt-1">APRIL</p>
                        </div>
                     </div>
                     <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-indigo-300" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">AI Event Recommendation</p>
                        </div>
                        <h3 className="text-4xl font-headline font-black uppercase tracking-tighter leading-none">The Great Hostel <br /> Film Night 🎬</h3>
                        <p className="text-indigo-100/70 text-lg font-medium italic">"Based on your neural social index, we recommend attending the Film Night. Your roommate has also registered!"</p>
                        <button className="px-10 py-4 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Claim Member Pass</button>
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between pl-6 border-l-4 border-indigo-600 mb-8">
                  <div>
                     <h2 className="text-3xl font-headline font-black text-slate-950 uppercase tracking-tighter">Live Happenings</h2>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Events mapped for current neural cycle</p>
                  </div>
                  <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all">
                     <Plus className="w-3 h-3" /> Propose Activity
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuredEvents.map(e => (
                    <EventCard key={e.title} {...e} />
                  ))}
               </div>

               {/* Activity Tracker Info */}
               <div className="bg-slate-50 rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center gap-12 border border-slate-100">
                  <div className="shrink-0 grid grid-cols-2 gap-4">
                     {[1, 2, 3, 4].map(i => (
                       <div key={i} className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300">
                          <Plus className="w-6 h-6" />
                       </div>
                     ))}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Want to organize something?</h4>
                     <p className="text-slate-500 text-sm font-medium leading-relaxed italic">"Our ecosystem thrives on student-led initiatives. Propose an event, gather interest, and unlock funding from the Hostel Council."</p>
                     <div className="flex gap-4 mt-8 justify-center md:justify-start">
                        <button className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all">
                           Guild Guidelines <ArrowRight className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
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

export default EventCalendar;
