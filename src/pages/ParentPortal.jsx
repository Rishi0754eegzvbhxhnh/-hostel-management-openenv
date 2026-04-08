/**
 * ParentPortal.jsx
 * ==================
 * Parent Dashboard — view child's hostel status in real-time.
 * - Login / Register as parent
 * - See: Room info, Fee status, Complaints, Activity
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND = 'http://localhost:5000';

// ── Auth Screen ───────────────────────────────────────────────────────────────
function ParentAuth({ onLogin }) {
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [form, setForm]       = useState({ email: '', password: '', fullName: '', phone: '', childCollegeId: '', relationship: 'Parent' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/api/parents/login' : '/api/parents/register';
      const res = await axios.post(`${BACKEND}${endpoint}`, form);
      if (res.data.success) {
        localStorage.setItem('parentToken', res.data.token);
        localStorage.setItem('parentInfo', JSON.stringify(res.data.parent));
        onLogin(res.data.parent);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Request failed. Check if backend is running.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2027 100%)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #4f46e5)' }} className="px-8 py-8 text-white text-center">
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <h1 className="text-2xl font-extrabold">Parent Portal</h1>
          <p className="text-indigo-200 text-sm mt-1.5">Smart Hostel Management System</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-3.5 text-sm font-bold capitalize transition-colors ${mode === m ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
              {m === 'login' ? '🔑 Login' : '📝 Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="px-8 py-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {mode === 'register' && (
            <>
              <input name="fullName" value={form.fullName} onChange={handle} placeholder="Your Full Name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
              <input name="phone" value={form.phone} onChange={handle} placeholder="Phone Number"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <input name="childCollegeId" value={form.childCollegeId} onChange={handle}
                placeholder="Child's College ID (e.g. CS2101)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
              <select name="relationship" value={form.relationship} onChange={handle}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option>Parent</option><option>Guardian</option><option>Sibling</option>
              </select>
            </>
          )}

          <input name="email" type="email" value={form.email} onChange={handle} placeholder="Your Email"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
          <input name="password" type="password" value={form.password} onChange={handle} placeholder="Password"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl font-extrabold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Please wait…</> : mode === 'login' ? '🔑 Login to Parent Portal' : '📝 Create Parent Account'}
          </button>

          {mode === 'login' && (
            <p className="text-center text-xs text-slate-400 mt-2">
              New here? <button type="button" onClick={() => setMode('register')} className="text-indigo-600 font-bold underline">Register as Parent</button>
            </p>
          )}
        </form>

        <div className="px-8 pb-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-600 font-medium text-center">
            🔒 Only verified parents linked to an active student account can register.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function Badge({ children, color = 'slate' }) {
  const colors = { green: 'bg-green-100 text-green-700', red: 'bg-red-100 text-red-700', amber: 'bg-amber-100 text-amber-700', slate: 'bg-slate-100 text-slate-600', blue: 'bg-blue-100 text-blue-700', indigo: 'bg-indigo-100 text-indigo-700' };
  return <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${colors[color] || colors.slate}`}>{children}</span>;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ parentInfo, onLogout }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('parentToken');
        const res   = await axios.get(`${BACKEND}/api/parents/child-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setData(res.data);
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to load child data');
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f4ff, #eef2ff)' }}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-indigo-600 font-bold">Loading child status…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f0f4ff' }}>
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <div className="text-5xl mb-3">❌</div>
        <p className="text-red-600 font-bold mb-4">{error}</p>
        <button onClick={onLogout} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Back to Login</button>
      </div>
    </div>
  );

  const { child, room, feeStatus, complaints, activity } = data || {};

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #4f46e5)' }} className="text-white px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍👩‍👧</span>
            <div>
              <h1 className="font-extrabold text-lg">Parent Portal</h1>
              <p className="text-indigo-200 text-xs">Viewing: <strong className="text-white">{child?.fullName}</strong> · {child?.collegeId}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors border border-white/20">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Child Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-extrabold text-white shrink-0">
            {child?.fullName?.[0] || '?'}
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold text-slate-800 text-xl">{child?.fullName}</h2>
            <p className="text-slate-400 text-sm">{child?.email} · {child?.phone}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge color="indigo">College ID: {child?.collegeId}</Badge>
              <Badge color="green">Active Student</Badge>
              {activity?.mood && <Badge color="amber">Mood: {activity.mood}</Badge>}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Room', value: room?.number || 'Not Assigned', sub: `${room?.block || ''} ${room?.type ? '· ' + room.type : ''}`, emoji: '🏠', color: 'blue' },
            { label: 'Fee Status', value: feeStatus?.status?.toUpperCase(), sub: feeStatus?.status === 'pending' ? `₹${feeStatus.amountDue?.toLocaleString()} due` : 'All clear', emoji: '💰', color: feeStatus?.status === 'pending' ? 'red' : 'green' },
            { label: 'Complaints', value: complaints?.length || 0, sub: complaints?.filter(c => c.status === 'open').length + ' open', emoji: '📋', color: 'amber' },
            { label: 'Points', value: activity?.points || 0, sub: `${activity?.ecoPoints || 0} eco pts`, emoji: '⭐', color: 'indigo' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <div className="text-3xl mb-1">{s.emoji}</div>
              <p className={`font-extrabold text-lg ${s.color === 'red' ? 'text-red-600' : s.color === 'green' ? 'text-green-600' : s.color === 'amber' ? 'text-amber-600' : 'text-indigo-600'}`}>{s.value}</p>
              <p className="text-xs text-slate-400 font-semibold">{s.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Room Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">🏠 Room Information</h3>
            {room?.number === 'Not Assigned' ? (
              <p className="text-slate-400 text-sm text-center py-4">Room not yet assigned by admin.</p>
            ) : (
              <div className="space-y-3">
                {[
                  ['Room Number', room?.number],
                  ['Block', room?.block],
                  ['Room Type', room?.type],
                  ['Floor', room?.floor],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="font-bold text-slate-700">{value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fee Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">💰 Fee Status</h3>
            <div className="space-y-3">
              {[
                ['Status', <Badge color={feeStatus?.status === 'pending' ? 'red' : 'green'}>{feeStatus?.status}</Badge>],
                ['Amount Due', `₹${feeStatus?.amountDue?.toLocaleString('en-IN')}`],
                ['Due Date', feeStatus?.nextDue],
                ['Last Payment', feeStatus?.lastPaid],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">{label}</span>
                  <span className="font-bold text-slate-700">{value}</span>
                </div>
              ))}
            </div>

            {feeStatus?.status === 'pending' && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 font-medium flex items-start gap-2">
                ⚠️ Fee payment is pending. Please remind your ward to pay before <strong>{feeStatus?.nextDue}</strong>.
              </div>
            )}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">📋 Recent Complaints</h3>
          {!complaints?.length ? (
            <p className="text-slate-400 text-sm text-center py-4">✅ No complaints raised — all good!</p>
          ) : (
            <div className="space-y-3">
              {complaints.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm shrink-0">📌</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{c.title || 'Complaint'}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Badge color={c.status === 'resolved' ? 'green' : c.status === 'in-progress' ? 'amber' : 'red'}>{c.status || 'open'}</Badge>
                    {c.hfPriority && <Badge color={c.hfPriority === 'urgent' ? 'red' : 'amber'}>{c.hfPriority}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        {activity?.badges?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">⭐ Achievements & Badges</h3>
            <div className="flex flex-wrap gap-2">
              {activity.badges.map((b, i) => (
                <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span>{b.icon || '🏆'}</span>
                  <span className="text-xs font-bold text-amber-700">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-500 text-center font-medium">
          🔒 This portal shows real-time data for <strong>{child?.fullName}</strong>.
          Data refreshes automatically. Last synced: {new Date().toLocaleTimeString('en-IN')}.
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export default function ParentPortal() {
  const [parentInfo, setParentInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('parentInfo')); } catch { return null; }
  });

  const handleLogin  = (info) => setParentInfo(info);
  const handleLogout = () => {
    localStorage.removeItem('parentToken');
    localStorage.removeItem('parentInfo');
    setParentInfo(null);
  };

  if (!parentInfo) return <ParentAuth onLogin={handleLogin} />;
  return <Dashboard parentInfo={parentInfo} onLogout={handleLogout} />;
}
