/**
 * SmartParking.jsx
 * ================
 * Interactive Smart Parking management page.
 * Shows live grid of 40 slots across 4 zones (A-D).
 * Allows vehicle entry/exit with auto slot assignment.
 */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND = 'http://localhost:5000';
const token   = localStorage.getItem('token');
const headers = { Authorization: `Bearer ${token}` };

// Zone colors
const ZONE_CONFIG = {
  A: { color: '#4f46e5', bg: '#eef2ff', label: 'Zone A — Bikes' },
  B: { color: '#0891b2', bg: '#ecfeff', label: 'Zone B — Bikes' },
  C: { color: '#16a34a', bg: '#f0fdf4', label: 'Zone C — Cars' },
  D: { color: '#ea580c', bg: '#fff7ed', label: 'Zone D — Cars' },
};

export default function SmartParking() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [seeding, setSeeding]     = useState(false);
  const [entryForm, setEntryForm] = useState({ vehicleNo: '', vehicleType: 'bike', studentName: '', blockNo: '', zone: '' });
  const [exitSlot, setExitSlot]   = useState('');
  const [toast, setToast]         = useState(null);
  const [guidance, setGuidance]   = useState(null);
  const [activeZone, setActiveZone] = useState('all');

  const showToast = (type, msg, detail = '') => {
    setToast({ type, msg, detail });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/parking`);
      if (res.data.success) setData(res.data);
    } catch {
      // Try seeding first
    } finally { setLoading(false); }
  }, []);

  const seedSlots = async () => {
    setSeeding(true);
    try {
      const res = await axios.post(`${BACKEND}/api/parking/seed`, {}, { headers });
      if (res.data.success) { showToast('success', '✅ Parking Initialized', `${res.data.count} slots created`); await fetchData(); }
    } catch (e) { showToast('error', 'Seed Failed', e.message); }
    finally { setSeeding(false); }
  };

  useEffect(() => { fetchData(); const timer = setInterval(fetchData, 15000); return () => clearInterval(timer); }, [fetchData]);

  const handleEntry = async (e) => {
    e.preventDefault();
    if (!entryForm.vehicleNo) return;
    try {
      const res = await axios.post(`${BACKEND}/api/parking/entry`, {
        ...entryForm, preferredZone: entryForm.zone || undefined
      }, { headers });
      if (res.data.success) {
        setGuidance(res.data.guidance);
        showToast('success', `🅿️ Parked at ${res.data.slot.slotId}!`, res.data.guidance.split('\n')[0]);
        setEntryForm({ vehicleNo: '', vehicleType: 'bike', studentName: '', blockNo: '', zone: '' });
        await fetchData();
      }
    } catch (e) {
      showToast('error', 'Entry Failed', e.response?.data?.message || e.message);
    }
  };

  const handleExit = async () => {
    if (!exitSlot) return;
    try {
      const res = await axios.post(`${BACKEND}/api/parking/exit/${exitSlot}`, {}, { headers });
      if (res.data.success) {
        showToast('success', `✅ Vehicle Exited (${res.data.duration})`, res.data.message);
        setExitSlot('');
        setGuidance(null);
        await fetchData();
      }
    } catch (e) {
      showToast('error', 'Exit Failed', e.response?.data?.message || e.message);
    }
  };

  // Filter slots by zone
  const displaySlots = data?.slots?.filter(s => activeZone === 'all' || s.zone === activeZone) || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-3">
                🚗 Smart Parking System
                <span className="text-xs font-bold bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full">LIVE</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Real-time slot monitoring · Auto assignment · AI-guided navigation</p>
            </div>
            <button onClick={seedSlots} disabled={seeding}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-60">
              {seeding ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Initializing…</> : '⚡ Initialize Slots'}
            </button>
          </div>

          {/* Stats Bar */}
          {data?.stats && (
            <div className="grid grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Total Slots',    value: data.stats.total,      icon: '🅿️',  color: 'text-white' },
                { label: 'Occupied',       value: data.stats.occupied,   icon: '🔴',  color: 'text-red-300' },
                { label: 'Available',      value: data.stats.available,  icon: '🟢',  color: 'text-green-300' },
                { label: 'Bikes / Cars',   value: `${data.stats.bikes} / ${data.stats.cars}`, icon: '🏍️', color: 'text-yellow-300' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 rounded-2xl p-4">
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.icon} {s.value}</p>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Entry / Exit Forms */}
        <div className="space-y-5">
          {/* Vehicle Entry */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">🚦 Vehicle Entry</h2>
            <form onSubmit={handleEntry} className="space-y-3">
              <input value={entryForm.vehicleNo} onChange={e => setEntryForm(f => ({ ...f, vehicleNo: e.target.value.toUpperCase() }))}
                placeholder="Vehicle No. (e.g. MH-12-AB-1234)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300" />

              <div className="grid grid-cols-2 gap-2">
                <select value={entryForm.vehicleType} onChange={e => setEntryForm(f => ({ ...f, vehicleType: e.target.value }))}
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="bike">🏍️ Bike</option>
                  <option value="car">🚗 Car</option>
                </select>
                <select value={entryForm.zone} onChange={e => setEntryForm(f => ({ ...f, zone: e.target.value }))}
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="">Any Zone</option>
                  {['A','B','C','D'].map(z => <option key={z} value={z}>Zone {z}</option>)}
                </select>
              </div>

              <input value={entryForm.studentName} onChange={e => setEntryForm(f => ({ ...f, studentName: e.target.value }))}
                placeholder="Student Name (optional)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

              <input value={entryForm.blockNo} onChange={e => setEntryForm(f => ({ ...f, blockNo: e.target.value }))}
                placeholder="Hostel Block (A/B/C)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

              <button type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 rounded-xl text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all">
                🚗 Assign Slot
              </button>
            </form>
          </div>

          {/* Vehicle Exit */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">🚪 Vehicle Exit</h2>
            <div className="flex gap-2">
              <select value={exitSlot} onChange={e => setExitSlot(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                <option value="">Select Slot to Free</option>
                {data?.slots?.filter(s => s.isOccupied).map(s => (
                  <option key={s.slotId} value={s.slotId}>
                    {s.slotId} — {s.vehicleNo} ({s.studentName || 'Guest'})
                  </option>
                ))}
              </select>
              <button onClick={handleExit} disabled={!exitSlot}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                Exit
              </button>
            </div>
          </div>

          {/* Guidance Box */}
          {guidance && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
              <h3 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">🗺️ Parking Guidance</h3>
              <div className="text-sm text-indigo-800 leading-relaxed whitespace-pre-line font-medium">{guidance}</div>
            </div>
          )}

          {/* Nearest Available */}
          {data?.nearestAvailable && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-bold text-slate-700 mb-3 text-sm">⚡ Nearest Available Slots</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.nearestAvailable).map(([zone, slot]) => (
                  <div key={zone} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: ZONE_CONFIG[zone]?.color }}>
                      {zone}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{slot || <span className="text-red-400">Full</span>}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Parking Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : !data?.slots?.length ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="text-5xl mb-4">🅿️</div>
              <h3 className="font-bold text-slate-700 mb-2">No Parking Slots Found</h3>
              <p className="text-slate-400 text-sm mb-4">Click "Initialize Slots" to set up the parking system.</p>
              <button onClick={seedSlots} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
                ⚡ Initialize Now
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              {/* Zone Filter Tabs */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                {['all', 'A', 'B', 'C', 'D'].map(z => (
                  <button key={z} onClick={() => setActiveZone(z)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                      activeZone === z
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>
                    {z === 'all' ? 'All Zones' : ZONE_CONFIG[z]?.label}
                  </button>
                ))}
              </div>

              {/* Slot Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {displaySlots.map(slot => (
                  <div
                    key={slot.slotId}
                    title={slot.isOccupied ? `${slot.vehicleNo}\n${slot.studentName}\nSince ${new Date(slot.entryTime).toLocaleTimeString('en-IN')}` : `${slot.slotId} — Available`}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold cursor-pointer transition-all hover:scale-105 border-2 ${
                      slot.isOccupied
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : 'bg-green-100 border-green-300 text-green-700 hover:border-green-400'
                    }`}
                  >
                    <span style={{ color: ZONE_CONFIG[slot.zone]?.color }} className="text-[10px] font-black">{slot.zone}</span>
                    <span className="text-[11px]">{String(slot.slotNumber).padStart(2,'0')}</span>
                    <span className="text-[8px] mt-0.5">{slot.isOccupied ? (slot.vehicleType === 'car' ? '🚗' : '🏍️') : '✓'}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-200 rounded border border-green-400" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-200 rounded border border-red-400" /> Occupied</span>
                <span className="flex items-center gap-1.5">🏍️ Bike — 🚗 Car</span>
                <span className="ml-auto text-slate-300">Auto-refresh: 15s</span>
              </div>
            </div>
          )}

          {/* Occupied Vehicles Table */}
          {data?.slots?.filter(s => s.isOccupied).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mt-5">
              <h3 className="font-bold text-slate-700 mb-3">🚗 Currently Parked Vehicles</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase tracking-wider">
                      {['Slot','Vehicle','Type','Student','Entry','Duration'].map(h => (
                        <th key={h} className="text-left py-2 pr-4 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.slots.filter(s => s.isOccupied).map(s => {
                      const dur = s.entryTime ? Math.round((Date.now() - new Date(s.entryTime)) / 60000) : 0;
                      return (
                        <tr key={s.slotId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 pr-4 font-bold" style={{ color: ZONE_CONFIG[s.zone]?.color }}>{s.slotId}</td>
                          <td className="py-2 pr-4 font-mono text-xs font-bold text-slate-700">{s.vehicleNo}</td>
                          <td className="py-2 pr-4">{s.vehicleType === 'car' ? '🚗' : '🏍️'}</td>
                          <td className="py-2 pr-4 text-slate-600">{s.studentName || 'Guest'}</td>
                          <td className="py-2 pr-4 text-slate-400 text-xs">{s.entryTime ? new Date(s.entryTime).toLocaleTimeString('en-IN') : '—'}</td>
                          <td className="py-2 text-slate-500 text-xs font-semibold">
                            <span className={`px-2 py-0.5 rounded-full ${dur > 120 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                              {dur}m
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 max-w-sm rounded-2xl shadow-2xl p-5 text-white flex items-start gap-3 ${
          toast.type === 'success' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-red-600 to-rose-600'
        }`}>
          <div className="text-xl">{toast.type === 'success' ? '✅' : '❌'}</div>
          <div>
            <p className="font-bold text-sm">{toast.msg}</p>
            {toast.detail && <p className="text-xs opacity-80 mt-1">{toast.detail}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
