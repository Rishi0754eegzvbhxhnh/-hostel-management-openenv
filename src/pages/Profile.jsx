/**
 * Profile.jsx
 * ============
 * Student Profile Page — view and edit personal info,
 * see room assignment, fee summary, badges, and activity.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND = 'http://localhost:5000';

export default function Profile() {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        const res = await axios.get(`${BACKEND}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data.user || res.data;
        setUser(u);
        setForm({ fullName: u.fullName, phone: u.phone, email: u.email });
      } catch {
        // Fallback to localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(stored);
          setForm({ fullName: stored.fullName, phone: stored.phone, email: stored.email });
        } catch { setUser(null); }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND}/api/auth/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(u => ({ ...u, ...form }));
      setEditing(false);
      showToast('Profile updated successfully!');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save', false);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4ff' }}>
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4ff' }}>
      <div className="text-center">
        <p className="text-slate-500 font-semibold mb-4">Please login to view your profile</p>
        <Link to="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700">
          Login →
        </Link>
      </div>
    </div>
  );

  const initials = user.fullName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #312e81, #4f46e5)' }} className="ptx-6 py-10 text-white text-center pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-extrabold text-white border-4 border-white/30 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="avatar" /> : initials}
          </div>
          <h1 className="text-2xl font-extrabold">{user.fullName}</h1>
          <p className="text-indigo-200 text-sm mt-1">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">{user.role || 'student'}</span>
            {user.collegeId && <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">ID: {user.collegeId}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-12 space-y-4">

        {/* Personal Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">👤 Personal Information</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                ✏️ Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="text-xs font-bold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg">Cancel</button>
                <button onClick={saveProfile} disabled={saving}
                  className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', key: 'fullName', icon: '👤' },
              { label: 'Email', key: 'email', icon: '📧', disabled: true },
              { label: 'Phone', key: 'phone', icon: '📱' },
              { label: 'College ID', key: 'collegeId', icon: '🎓', value: user.collegeId, disabled: true },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">{f.icon} {f.label}</label>
                {editing && !f.disabled ? (
                  <input value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                ) : (
                  <p className="text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl px-3 py-2.5">{f.value || form[f.key] || user[f.key] || '—'}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pay Fees', icon: '💳', link: '/payment',     color: '#4f46e5' },
            { label: 'My Room',  icon: '🏠', link: '/room-booking', color: '#059669' },
            { label: 'Complaints', icon: '📋', link: '/complaints', color: '#dc2626' },
            { label: 'Parking',  icon: '🚗', link: '/parking',     color: '#d97706' },
          ].map(l => (
            <Link key={l.label} to={l.link}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all text-center">
              <span className="text-3xl">{l.icon}</span>
              <span className="text-xs font-bold text-slate-600">{l.label}</span>
            </Link>
          ))}
        </div>

        {/* Gamification */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4">⭐ Points & Achievements</h2>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-indigo-600">{user.points || 0}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">Hostel Points</p>
            </div>
            <div className="w-px h-12 bg-slate-100" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-green-600">{user.ecoPoints || 0}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">Eco Points</p>
            </div>
            <div className="w-px h-12 bg-slate-100" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-amber-600">{user.badges?.length || 0}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">Badges</p>
            </div>
          </div>

          {user.badges?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.badges.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  <span>{b.icon || '🏆'}</span>
                  <span className="text-xs font-bold text-amber-700">{b.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs text-center py-2">Complete hostel activities to earn badges! 🎯</p>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4">🛏️ Room Preferences</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              ['Sleep Time', user.habits?.sleepTime || '11 PM'],
              ['Wake Time', user.habits?.wakeTime || '7 AM'],
              ['Food Pref.', user.habits?.foodPreference || 'Both'],
              ['Study Time', user.studySchedule?.preferredTime || 'Morning'],
              ['Noise', user.studySchedule?.noiseTolerance + ' tolerance' || 'Low'],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k}</p>
                <p className="font-bold text-slate-700 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-2xl shadow-2xl px-5 py-4 text-white text-sm font-bold ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.ok ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  );
}
