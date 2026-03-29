import React, { useState } from 'react';

// ── MOCK DATA (replace with GET /api/admin/analytics) ────────────────────────
const OCCUPANCY_DATA = [
  { month: 'Feb', rate: 82 }, { month: 'Mar', rate: 88 }, { month: 'Apr', rate: 91 },
  { month: 'May', rate: 85 }, { month: 'Jun', rate: 78 }, { month: 'Jul', rate: 94 },
];

const REVENUE_DATA = [
  { month: 'Feb', rent: 420000, mess: 160000, other: 42000 },
  { month: 'Mar', rent: 440000, mess: 175000, other: 51000 },
  { month: 'Apr', rent: 455000, mess: 180000, other: 47000 },
  { month: 'May', rent: 430000, mess: 168000, other: 55000 },
  { month: 'Jun', rent: 390000, mess: 145000, other: 38000 },
  { month: 'Jul', rent: 465000, mess: 185000, other: 62000 },
];

const COMPLAINT_CATS = [
  { cat: 'Plumbing',    count: 38, color: '#378ADD' },
  { cat: 'Electricity', count: 24, color: '#1D9E75' },
  { cat: 'Wi-Fi',       count: 19, color: '#EF9F27' },
  { cat: 'Cleanliness', count: 15, color: '#D85A30' },
  { cat: 'Furniture',   count: 9,  color: '#7F77DD' },
  { cat: 'Other',       count: 7,  color: '#888780' },
];

const RECENT_EVENTS = [
  { time: '10:32 AM', icon: '🔔', msg: 'New complaint #C047 — Critical (Score: 91)', type: 'alert' },
  { time: '09:58 AM', icon: '💰', msg: 'Payment received ₹12,800 — Priya M., Room A-108', type: 'success' },
  { time: '09:15 AM', icon: '🚪', msg: 'Unauthorised entry attempt — Gate C (flagged)', type: 'warning' },
  { time: '08:44 AM', icon: '✅', msg: 'Complaint #C039 resolved — Ravi K.', type: 'success' },
  { time: '08:20 AM', icon: '📊', msg: 'Occupancy hit 94% — highest this semester', type: 'info' },
  { time: 'Yesterday', icon: '🍽️', msg: 'Mess demand prediction updated for this week', type: 'info' },
];

const SATISFACTION_DATA = [
  { area: 'Mess Quality',   score: 3.8, responses: 212 },
  { area: 'Room Cleanliness', score: 4.1, responses: 198 },
  { area: 'Wi-Fi Speed',    score: 3.4, responses: 187 },
  { area: 'Staff Response', score: 4.3, responses: 175 },
  { area: 'Security',       score: 4.6, responses: 163 },
  { area: 'Overall',        score: 4.0, responses: 220 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Simple inline bar chart (no external lib needed)
function OccupancyChart({ data }) {
  const max = 100;
  return (
    <div className="flex items-end gap-2 h-36 mt-2">
      {data.map(d => {
        const h = (d.rate / max) * 100;
        const color = d.rate >= 90 ? '#1D9E75' : d.rate >= 80 ? '#378ADD' : '#EF9F27';
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-semibold" style={{ color }}>{d.rate}%</span>
            <div className="w-full rounded-t-md transition-all" style={{ height: `${h}%`, backgroundColor: color, minHeight: 4 }} />
            <span className="text-xs text-gray-400">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.rent + d.mess + d.other));
  return (
    <div className="flex items-end gap-2 h-36 mt-2">
      {data.map(d => {
        const total = d.rent + d.mess + d.other;
        const h = (total / max) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-gray-600">{(total / 100000).toFixed(1)}L</span>
            <div className="w-full rounded-t-md overflow-hidden flex flex-col" style={{ height: `${h}%`, minHeight: 4 }}>
              <div style={{ flex: d.other, backgroundColor: '#7F77DD' }} />
              <div style={{ flex: d.mess,  backgroundColor: '#1D9E75' }} />
              <div style={{ flex: d.rent,  backgroundColor: '#378ADD' }} />
            </div>
            <span className="text-xs text-gray-400">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  let cum = 0;
  const arcs = data.map(d => {
    const pct  = d.count / total;
    const start = cum;
    cum += pct;
    return { ...d, pct, start };
  });

  const describeArc = (start, pct) => {
    const r = 40, cx = 50, cy = 50;
    const a1 = (start * 360 - 90) * (Math.PI / 180);
    const a2 = ((start + pct) * 360 - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const lg = pct > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-28 h-28 flex-shrink-0">
        {arcs.map((a, i) => (
          <path key={i} d={describeArc(a.start, a.pct)} fill={a.color} stroke="white" strokeWidth="1" />
        ))}
        <circle cx="50" cy="50" r="22" fill="white" />
        <text x="50" y="47" textAnchor="middle" fontSize="9" fill="#444" fontWeight="600">{total}</text>
        <text x="50" y="57" textAnchor="middle" fontSize="7" fill="#888">total</text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-gray-600">{d.cat}</span>
            </div>
            <span className="text-xs font-semibold text-gray-800">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SatisfactionRow({ area, score, responses }) {
  const pct = (score / 5) * 100;
  const color = score >= 4.2 ? '#1D9E75' : score >= 3.5 ? '#378ADD' : '#EF9F27';
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{area}</span>
        <span className="font-semibold" style={{ color }}>
          {score} ★ <span className="text-gray-400 font-normal">({responses})</span>
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const EVENT_STYLES = {
  alert:   'bg-red-50 border-red-100 text-red-600',
  warning: 'bg-amber-50 border-amber-100 text-amber-700',
  success: 'bg-green-50 border-green-100 text-green-700',
  info:    'bg-blue-50 border-blue-100 text-blue-700',
};

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('This Month');
  
  const currentRev = REVENUE_DATA[REVENUE_DATA.length - 1];
  const totalRev   = currentRev.rent + currentRev.mess + currentRev.other;
  const totalComplaints = COMPLAINT_CATS.reduce((s, c) => s + c.count, 0);
  const resolved   = Math.round(totalComplaints * 0.72);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Admin view · Real-time insights · AI-powered predictions</p>
          </div>
          <div className="flex gap-2">
            {['This Month', 'Last 3M', 'This Year'].map(p => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                  ${period === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Occupancy Rate',     value: '94%',          delta: '+6% vs last month', icon: '🏠', good: true },
            { label: 'Revenue (Jul)',       value: `₹${(totalRev/100000).toFixed(1)}L`, delta: '+8.2% vs June', icon: '💰', good: true },
            { label: 'Open Complaints',     value: COMPLAINT_CATS.reduce((s,c)=>s+c.count,0) - resolved, delta: `${resolved} resolved this month`, icon: '🔧', good: false },
            { label: 'Student Satisfaction',value: '4.0 / 5.0',   delta: '+0.3 vs last month', icon: '😊', good: true },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-start justify-between">
                <span className="text-xl">{k.icon}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                  ${k.good ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {k.good ? '↑' : '↓'}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{k.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
              <p className={`text-xs mt-1 font-medium ${k.good ? 'text-green-600' : 'text-amber-600'}`}>
                {k.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          
          {/* Occupancy */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-semibold text-gray-800">Occupancy Rate</h2>
              <span className="text-xs text-gray-400">% of rooms filled</span>
            </div>
            <OccupancyChart data={OCCUPANCY_DATA} />
            <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
              🤖 <strong>Prediction:</strong> August occupancy expected at 96% — prepare 4 extra room units.
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-semibold text-gray-800">Monthly Revenue</h2>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />Rent
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-teal-600 inline-block" />Mess
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-purple-500 inline-block" />Other
                </span>
              </div>
            </div>
            <RevenueChart data={REVENUE_DATA} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="font-bold text-blue-700">₹{(currentRev.rent/1000).toFixed(0)}K</p>
                <p className="text-gray-500">Room Rent</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-2">
                <p className="font-bold text-teal-700">₹{(currentRev.mess/1000).toFixed(0)}K</p>
                <p className="text-gray-500">Mess</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="font-bold text-purple-700">₹{(currentRev.other/1000).toFixed(0)}K</p>
                <p className="text-gray-500">Services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
          {/* Complaints Breakdown */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Complaints by Category</h2>
            <DonutChart data={COMPLAINT_CATS} />
            <div className="mt-3 flex justify-between text-xs text-gray-500 border-t pt-3">
              <span>Resolution rate</span>
              <span className="font-semibold text-green-600">72%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
              <div className="h-1.5 rounded-full bg-green-500" style={{ width: '72%' }} />
            </div>
          </div>

          {/* Satisfaction */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 md:col-span-2">
            <h2 className="font-semibold text-gray-800 mb-4">Student Satisfaction Scores</h2>
            {SATISFACTION_DATA.map(s => (
              <SatisfactionRow key={s.area} {...s} />
            ))}
            <div className="mt-3 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 border border-amber-100">
              ⚠️ <strong>Action needed:</strong> Wi-Fi satisfaction (3.4) is below target. IT team notified.
            </div>
          </div>
        </div>

        {/* Bottom: AI Insights + Recent Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* AI Predictions */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-3">🤖 AI Predictive Insights</h2>
            <div className="space-y-3">
              {[
                { icon: '📈', title: 'Peak demand in 2 weeks', desc: 'Exam season — expect 40% more maintenance requests. Pre-assign 2 extra staff.', color: 'border-blue-200 bg-blue-50' },
                { icon: '🍽️', title: 'Mess waste will increase Friday', desc: 'Biryani day + low pre-bookings. Recommend reducing batch by 15%.', color: 'border-amber-200 bg-amber-50' },
                { icon: '💸', title: '12 late payments predicted', desc: 'Based on historical patterns — send reminders to at-risk students now.', color: 'border-red-200 bg-red-50' },
                { icon: '🌡️', title: 'AC overuse risk — Block C', desc: 'Electricity trend suggests 28% spike next week. Check for issues.', color: 'border-purple-200 bg-purple-50' },
              ].map((item, i) => (
                <div key={i} className={`flex gap-3 rounded-xl border p-3 ${item.color}`}>
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-3">🔴 Live Activity Feed</h2>
            <div className="space-y-2">
              {RECENT_EVENTS.map((e, i) => (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs ${EVENT_STYLES[e.type]}`}>
                  <span className="text-base">{e.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium leading-snug">{e.msg}</p>
                    <p className="opacity-70 mt-0.5">{e.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-3 py-2 text-xs text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors font-medium"
            >
              View All Activity →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
