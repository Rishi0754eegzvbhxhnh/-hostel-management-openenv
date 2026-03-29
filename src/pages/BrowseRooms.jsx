import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const BACKEND = 'http://127.0.0.1:5000';

const BrowseRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND}/api/rooms`);
      setRooms(res.data);
      setFilteredRooms(res.data);
    } catch { console.error('Error fetching rooms'); }
    finally { setLoading(false); }
  };

  const parseQuery = (q) => {
    const lq = q.toLowerCase();
    let results = [...rooms];

    // AI Semantic Filtering (Heuristic)
    if (lq.includes('single')) results = results.filter(r => r.type === 'single');
    if (lq.includes('shared')) results = results.filter(r => r.type === 'shared');
    if (lq.includes('suite')) results = results.filter(r => r.type === 'suite');
    
    if (lq.includes('ac')) results = results.filter(r => r.features.some(f => f.toLowerCase().includes('ac')));
    if (lq.includes('wifi')) results = results.filter(r => r.features.some(f => f.toLowerCase().includes('wifi')));
    
    // Price parsing (e.g. "under 500")
    const priceMatch = lq.match(/under\s*(\d+)/) || lq.match(/below\s*(\d+)/) || lq.match(/less\s*than\s*(\d+)/);
    if (priceMatch) {
      const p = parseInt(priceMatch[1]);
      results = results.filter(r => r.pricePerMonth <= p);
    }

    setFilteredRooms(results);
  };

  const handleSearch = (val) => {
    setQuery(val);
    setIsAIProcessing(true);
    // Simulate OpenAI Natural Language Processing delay
    setTimeout(() => {
      parseQuery(val);
      setIsAIProcessing(false);
    }, 400);
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-24 pt-20">
      <Header activePage="Rooms" />
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* AI Intelligent Search Bar */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="font-label text-xs font-bold text-secondary tracking-[0.2em] uppercase block mb-3">Inventory Portal</span>
            <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tight">AI Room Navigator</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto mt-4">
              Our vision transformer helps you find a space that fits your lifestyle. Describe your preference in plain English.
            </p>
          </div>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden border border-outline-variant/10">
              <div className="pl-6 text-primary">
                {isAIProcessing ? (
                   <span className="material-symbols-outlined animate-spin">sync</span>
                ) : (
                   <span className="material-symbols-outlined animate-pulse">auto_awesome</span>
                )}
              </div>
              <input 
                type="text" 
                placeholder="Find a single room with AC under 500..." 
                value={query}
                onChange={e => handleSearch(e.target.value)}
                className="w-full px-4 py-6 text-lg focus:outline-none placeholder:text-outline/40 font-medium" 
              />
              <div className="pr-6">
                 <button className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Search AI</button>
              </div>
            </div>
            {query && (
              <p className="mt-4 text-center text-xs text-outline font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                 AI Analysis Active: <span className="text-primary">{filteredRooms.length} Spaces Found</span>
              </p>
            )}
          </div>
        </section>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             <div className="col-span-full py-20 flex justify-center"><span className="material-symbols-outlined animate-spin text-5xl text-primary">sync</span></div>
          ) : (
            filteredRooms.map(r => (
              <div key={r._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all border border-outline-variant/5">
                <div className="relative h-64 bg-surface-container-low overflow-hidden">
                   {r.view360 && <img src={r.view360} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                   {!r.view360 && <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary/30">No Image Available</div>}
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-primary shadow-sm">
                      {r.isAvailable ? 'AVAILABLE' : 'FULLY BOOKED'}
                   </div>
                   <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-white text-xs">panorama_photosphere</span>
                      <span className="text-white text-[10px] font-bold uppercase">360° View Ready</span>
                   </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-headline font-extrabold text-2xl text-on-surface mb-1">Room {r.roomNumber}</h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{r.type} Residence</p>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-headline font-black text-primary">₹{r.pricePerMonth}</p>
                       <p className="text-[10px] font-bold text-outline">per month</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                     {r.features.map(f => (
                       <span key={f} className="bg-surface-container-low px-2 py-1 rounded-md text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check</span> {f}
                       </span>
                     ))}
                  </div>

                  <Link to="/roomview" className="w-full py-4 bg-surface-container-highest text-on-surface font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all group/btn">
                    Explore Space
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))
          )}
          {filteredRooms.length === 0 && !loading && (
             <div className="col-span-full py-20 text-center">
                <span className="material-symbols-outlined text-6xl text-outline/30 mb-4 block">sentiment_dissatisfied</span>
                <p className="font-headline font-bold text-xl text-on-surface-variant capitalize">No rooms match your specific preference.</p>
                <p className="text-sm text-outline mt-2">Try searching something broader, like 'single room' or 'AC'.</p>
             </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default BrowseRooms;
