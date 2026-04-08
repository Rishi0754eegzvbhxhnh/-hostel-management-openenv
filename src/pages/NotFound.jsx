/**
 * NotFound.jsx
 * =============
 * 404 Not Found page — shown for any unmatched route.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #312e81 100%)' }}>
      <div className="text-center text-white max-w-lg mx-auto">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-extrabold leading-none text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)' }}>
            404
          </div>
          <div className="absolute inset-0 text-[10rem] font-extrabold leading-none text-white/5 blur-xl">
            404
          </div>
        </div>

        <div className="text-5xl mb-4">🏨</div>
        <h1 className="text-2xl font-extrabold mb-3">Room Not Found!</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          Looks like you've wandered into the wrong corridor. This page doesn't exist in the hostel directory.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm backdrop-blur-md border border-white/20 transition-all">
            ← Go Back
          </button>
          <Link to="/dashboard"
            className="px-6 py-3 text-white font-extrabold rounded-2xl text-sm transition-all shadow-xl"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            🏠 Back to Dashboard
          </Link>
          <Link to="/admin"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm backdrop-blur-md border border-white/20 transition-all">
            Admin Portal →
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 grid grid-cols-3 gap-3 max-w-sm mx-auto text-xs">
          {[
            { label: 'Login', link: '/login', icon: '🔑' },
            { label: 'Food Menu', link: '/food-menu', icon: '🍛' },
            { label: 'Holiday Planner', link: '/holiday-planner', icon: '🎒' },
          ].map(l => (
            <Link key={l.label} to={l.link}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-colors">
              <div className="text-2xl mb-1">{l.icon}</div>
              <div className="font-bold text-slate-300">{l.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
