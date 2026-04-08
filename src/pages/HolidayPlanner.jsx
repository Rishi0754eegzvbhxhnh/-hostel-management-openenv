/**
 * HolidayPlanner.jsx  — Hyderabad Local Edition
 * ==============================================
 * Hyderabad-first weekend planner for hostel students.
 * Browse by category, filter by vibe + budget,
 * and generate AI itineraries for local day/weekend plans.
 */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND = 'http://localhost:5000';

// ── Category Config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',           label: 'All Places',   emoji: '✨', color: '#6366f1', bg: '#eef2ff' },
  { id: 'historical',    label: 'Historical',   emoji: '🏛️', color: '#ea580c', bg: '#fff7ed' },
  { id: 'nature',        label: 'Nature',       emoji: '🌿', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'food',          label: 'Food Streets', emoji: '🍛', color: '#dc2626', bg: '#fef2f2' },
  { id: 'cafes',         label: 'Cafes',        emoji: '☕', color: '#92400e', bg: '#fffbeb' },
  { id: 'shopping',      label: 'Shopping',     emoji: '🛍️', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'hidden',        label: 'Hidden Gems',  emoji: '💎', color: '#0891b2', bg: '#ecfeff' },
  { id: 'dayTrips',      label: 'Day Trips',    emoji: '🚗', color: '#4f46e5', bg: '#eef2ff' },
  { id: 'entertainment', label: 'Fun & Thrills', emoji: '🎡', color: '#db2777', bg: '#fdf2f8' },
];

// ── Vibe Config ───────────────────────────────────────────────────────────────
const VIBES = [
  { id: 'explorer',    label: 'Explorer',    emoji: '🧭' },
  { id: 'foodie',      label: 'Foodie',      emoji: '🍛' },
  { id: 'couples',     label: 'Couples',     emoji: '💑' },
  { id: 'budget',      label: 'Budget',      emoji: '💸' },
  { id: 'adventure',   label: 'Adventure',   emoji: '🧗' },
  { id: 'relaxation',  label: 'Relaxation',  emoji: '🌅' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'groups',      label: 'Groups',      emoji: '👥' },
];

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ r }) => (
  <span className="text-amber-400 text-xs">
    {'★'.repeat(Math.floor(r))}<span className="text-amber-200">{'★'.repeat(5 - Math.floor(r))}</span>
    <span className="text-slate-400 ml-1 font-bold">{r}</span>
  </span>
);

// ── Place Card ─────────────────────────────────────────────────────────────────
function PlaceCard({ p, compact = false }) {
  const cat = CATEGORIES.find(c => c.label.toLowerCase().includes(p.type?.toLowerCase())) || CATEGORIES[0];
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all ${compact ? '' : ''}`}>
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-slate-100">
        {!imgErr ? (
          <img src={p.image} alt={p.name} className="w-full h-full object-cover"
            onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl"
            style={{ background: cat.bg }}>{cat.emoji}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-bold px-2 py-1 rounded-lg text-white backdrop-blur-md"
            style={{ background: cat.color + 'cc' }}>{cat.emoji} {p.type}</span>
        </div>

        {/* Cost badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-extrabold px-2 py-1 rounded-lg ${p.cost === 0 ? 'bg-green-500 text-white' : 'bg-white/90 text-slate-800'}`}>
            {p.cost === 0 ? '🆓 Free' : `₹${p.cost}`}
          </span>
        </div>

        {/* Name */}
        <div className="absolute bottom-2 left-3 right-2">
          <h3 className="text-white font-extrabold text-sm leading-tight drop-shadow">{p.name}</h3>
          <p className="text-white/70 text-[10px] font-semibold">📍 {p.area}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <Stars r={p.rating} />
        <p className="text-slate-500 text-xs mt-1.5 mb-2 leading-relaxed line-clamp-2">{p.desc}</p>

        {/* Meta row */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mb-2">
          <span>⏱️ {p.duration_hrs}h</span>
          {p.distance_km > 0 && <span>· 📍 {p.distance_km} km</span>}
          {p.timing && <span className="ml-auto truncate">{p.timing.split('|')[0].trim()}</span>}
        </div>

        {/* Vibe tags */}
        <div className="flex gap-1 flex-wrap">
          {p.vibe?.slice(0, 3).map(v => (
            <span key={v} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">#{v}</span>
          ))}
        </div>

        {/* Pro tip */}
        {p.tips?.[0] && (
          <div className="mt-2 bg-amber-50 rounded-lg px-2 py-1.5 text-[10px] text-amber-700 font-medium flex items-start gap-1">
            <span className="shrink-0">💡</span>
            <span>{p.tips[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Itinerary Slot Card ───────────────────────────────────────────────────────
function SlotCard({ slot, label, emoji, color }) {
  if (!slot) return null;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 border-2"
          style={{ borderColor: color, background: color + '20' }}>{emoji}</div>
        <div className="w-0.5 bg-slate-100 flex-1 my-1" />
      </div>
      <div className="pb-4 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color }}>{label}</p>
        <p className="font-bold text-slate-800 text-sm">{slot.name}</p>
        <p className="text-xs text-slate-400 mb-1">📍 {slot.area} · ⏱️ {slot.duration}h · {slot.cost === 0 ? '🆓 Free' : `₹${slot.cost}`}</p>
        <p className="text-xs text-slate-500 mb-1 line-clamp-1">{slot.desc}</p>
        {slot.tip && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 text-[10px] text-amber-700 font-medium">
            💡 {slot.tip}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function HolidayPlanner() {
  const [tab, setTab]             = useState('explore'); // 'explore' | 'plan'
  const [category, setCategory]   = useState('all');
  const [vibe, setVibe]           = useState('explorer');
  const [budget, setBudget]       = useState(500);
  const [days, setDays]           = useState(1);
  const [places, setPlaces]       = useState([]);
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPlaces = useCallback(async (cat = 'all', vibeFilter = '', bgt = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== 'all') params.set('category', cat);
      if (vibeFilter) params.set('vibe', vibeFilter);
      if (bgt > 0) params.set('budget', bgt);
      const res = await axios.get(`${BACKEND}/api/tourism/hyderabad?${params}`);
      if (res.data.success) setPlaces(res.data.places);
    } catch  { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    fetchPlaces(cat);
  };

  const generatePlan = async () => {
    setPlanLoading(true);
    setPlan(null);
    setTab('plan');
    try {
      const res = await axios.post(`${BACKEND}/api/tourism/hyderabad/weekend-plan`, {
        vibe, budget, days,
        studentName: 'Student',
      });
      if (res.data.success) {
        setPlan(res.data);
        showToast('🤖 AI itinerary ready!');
      }
    } catch { showToast('Failed to generate plan', 'error'); }
    finally { setPlanLoading(false); }
  };

  // Filter by search
  const displayed = places.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.area.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCat = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  return (
    <div className="min-h-screen font-sans bg-slate-50">

      {/* ── Hero Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a5f 100%)' }}
        className="text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🕌</span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Hyderabad Local Explorer</h1>
              <p className="text-indigo-300 text-sm">Weekend plans · Food streets · Hidden gems · Day trips — all for hostel students</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-4 text-xs text-indigo-300 font-semibold flex-wrap">
            <span className="bg-white/10 px-3 py-1.5 rounded-full">60+ local places</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full">🆓 Many free spots</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full">🤖 AI weekend planner</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full">🚗 Day trips included</span>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-2 mt-6">
            <button onClick={() => setTab('explore')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'explore' ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              🗺️ Explore Places
            </button>
            <button onClick={() => setTab('plan')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'plan' ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              🤖 Weekend Planner
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ══ EXPLORE TAB ══════════════════════════════════════════════════════ */}
        {tab === 'explore' && (
          <div>
            {/* Category Pills */}
            <div className="flex gap-2 flex-wrap mb-5">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => handleCategoryClick(c.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    category === c.id
                      ? 'border-transparent shadow-md text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                  style={category === c.id ? { background: c.color } : {}}>
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>

            {/* Search + Count */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search places, areas, food…"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <span className="text-slate-400 text-sm font-semibold">
                {displayed.length} places
                {selectedCat.id !== 'all' && <span className="ml-1" style={{ color: selectedCat.color }}>· {selectedCat.emoji} {selectedCat.label}</span>}
              </span>
            </div>

            {/* Places Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-slate-500 font-semibold">No places found. Try a different filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {displayed.map(p => <PlaceCard key={p.id} p={p} />)}
              </div>
            )}

            {/* Weekend Planner CTA */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-extrabold text-xl mb-1">🤖 Want a custom weekend plan?</h3>
                <p className="text-indigo-200 text-sm">Tell us your vibe and budget → Gemini AI crafts the perfect Hyderabad itinerary</p>
              </div>
              <button onClick={() => setTab('plan')}
                className="bg-white text-indigo-700 font-extrabold px-6 py-3 rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2">
                Generate Plan 🎯
              </button>
            </div>
          </div>
        )}

        {/* ══ WEEKEND PLANNER TAB ══════════════════════════════════════════════ */}
        {tab === 'plan' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Plan Config */}
            <div className="space-y-5">
              {/* Vibe Selector */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">🎭 Your Vibe</h3>
                <div className="grid grid-cols-2 gap-2">
                  {VIBES.map(v => (
                    <button key={v.id} onClick={() => setVibe(v.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                        vibe === v.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}>
                      <span>{v.emoji}</span> {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget & Days */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                    💰 Budget: <span className="text-indigo-600 font-extrabold">₹{budget}</span>
                  </label>
                  <input type="range" min="100" max="2000" step="100" value={budget}
                    onChange={e => setBudget(+e.target.value)}
                    className="w-full accent-indigo-600" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>₹100 (Budget)</span><span>₹2000 (Premium)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">📅 Days</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(d => (
                      <button key={d} onClick={() => setDays(d)}
                        className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                          days === d ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                        {d} {d === 1 ? 'Day' : 'Days'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button onClick={generatePlan} disabled={planLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold py-4 rounded-2xl text-sm hover:shadow-xl hover:shadow-indigo-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {planLoading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Building Itinerary…</>
                  : <>🤖 Generate {days}-Day Hyderabad Plan</>
                }
              </button>

              {/* Day Trips Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-amber-800 font-bold text-sm mb-1">🚗 Planning a Day Trip?</p>
                <p className="text-amber-600 text-xs">Switch to Explore → Day Trips category for Warangal, Bidar, Ananthagiri Hills, Kuntala Falls, and more!</p>
                <button onClick={() => { setTab('explore'); handleCategoryClick('dayTrips'); }}
                  className="mt-2 text-xs font-bold text-amber-700 underline">
                  See Day Trips →
                </button>
              </div>
            </div>

            {/* Right: Generated Plan */}
            <div className="lg:col-span-2">
              {planLoading ? (
                <div className="flex flex-col items-center justify-center h-72 gap-4 bg-white rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="font-bold text-slate-700 text-sm">🤖 Gemini AI is crafting your perfect Hyderabad plan…</p>
                    <p className="text-slate-400 text-xs mt-1">Picking the best spots based on your vibe ✨</p>
                  </div>
                </div>
              ) : plan ? (
                <div className="space-y-5">
                  {/* AI Narrative Banner */}
                  {plan.aiNarrative && (
                    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-100 rounded-2xl p-5 flex gap-3">
                      <span className="text-2xl shrink-0">🤖</span>
                      <div>
                        <p className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest mb-1">Gemini AI says</p>
                        <p className="text-slate-700 text-sm leading-relaxed italic">"{plan.aiNarrative}"</p>
                      </div>
                    </div>
                  )}

                  {/* Day Itineraries */}
                  {plan.itinerary?.map((day, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3"
                        style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}>
                        <h3 className="text-white font-extrabold text-sm">Day {day.day}</h3>
                        <span className="text-indigo-200 text-xs font-bold">Est. ₹{day.estimatedCost}</span>
                      </div>
                      <div className="p-5">
                        <SlotCard slot={day.morning}   label="Morning"   emoji="🌅" color="#f59e0b" />
                        <SlotCard slot={day.afternoon} label="Afternoon" emoji="☀️" color="#f97316" />
                        <SlotCard slot={day.evening}   label="Evening"   emoji="🌆" color="#6366f1" />

                        {/* Travel tip */}
                        <div className="mt-2 bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <span>🚗</span>
                          <span className="text-xs text-slate-500 font-medium">{day.travel_tip}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary + Transit Tips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Budget */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <h4 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wide">💰 Budget</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Your budget</span>
                          <span className="font-bold">₹{plan.budget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Estimated cost</span>
                          <span className="font-bold text-red-600">₹{plan.summary.estimatedCost}</span>
                        </div>
                        {plan.summary.savings > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Left over 🎉</span>
                            <span className="font-bold text-green-600">₹{plan.summary.savings}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${Math.min(100, (plan.summary.estimatedCost / plan.budget) * 100)}%` }} />
                      </div>
                    </div>

                    {/* Transit Tips */}
                    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
                      <h4 className="font-bold text-amber-700 text-sm mb-3">🚌 Getting Around</h4>
                      <ul className="space-y-1.5">
                        {plan.transit_tips?.map((tip, i) => (
                          <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                            <span className="text-amber-400 shrink-0">▸</span>{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Regenerate */}
                  <button onClick={generatePlan}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                    🔄 Regenerate Plan
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center text-center">
                  <div className="text-6xl mb-4">🕌</div>
                  <h3 className="font-extrabold text-slate-800 text-xl mb-2">Plan Your Hyderabad Weekend!</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-xs">Choose your vibe, set your budget, and let Gemini AI plan the perfect local trip for you.</p>
                  <div className="flex flex-wrap gap-2 justify-center text-xs text-slate-500">
                    {VIBES.map(v => <span key={v.id} className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1">{v.emoji} {v.label}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl shadow-2xl p-4 text-white text-sm font-bold flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-gradient-to-r from-indigo-600 to-violet-600'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
