/**
 * ForecastPanel.jsx
 * =================
 * Predictive Analytics dashboard for the Admin Portal.
 * Shows 30-day forecasts for revenue, occupancy, complaints, and energy
 * using data from /api/forecast (linear regression on real MongoDB data).
 *
 * Pure SVG charts — no recharts/chart.js dependency needed.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND = 'http://localhost:5000';

// ── Micro SVG Line Chart ───────────────────────────────────────────────────────
function MiniLineChart({ data, color, height = 80, valueKey = 'predicted', label = '' }) {
  if (!data?.length) return null;
  const values = data.map(d => d[valueKey]);
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const w = 300;
  const h = height;
  const pad = 6;
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  });
  const areaPoints = `${pad},${h - pad} ${points.join(' ')} ${w - pad},${h - pad}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color})`} />
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Last point dot */}
      {(() => {
        const [lx, ly] = points[points.length - 1].split(',');
        return <circle cx={lx} cy={ly} r="3.5" fill={color} />;
      })()}
    </svg>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function MiniBarChart({ data, color, valueKey = 'predicted' }) {
  if (!data?.length) return null;
  const values = data.map(d => d[valueKey]);
  const max = Math.max(...values) || 1;
  const w = 300;
  const h = 80;
  const pad = 6;
  const barW = (w - pad * 2) / values.length - 3;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      {values.map((v, i) => {
        const bh = ((v / max) * (h - pad * 2));
        const x = pad + i * ((w - pad * 2) / values.length);
        const y = h - pad - bh;
        return (
          <rect key={i} x={x} y={y} width={barW} height={bh}
            rx="3" fill={color} opacity={0.6 + (i / values.length) * 0.4} />
        );
      })}
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, trend, color, bg }) {
  const trendUp = parseFloat(trend) > 0;
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-3 ${bg} relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trendUp ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Forecast Chart Card ────────────────────────────────────────────────────────
function ForecastCard({ title, icon, subtitle, chart, stats, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
          30-day forecast
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4 ml-7">{subtitle}</p>
      {chart}
      {stats && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
          {stats.map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <p className="text-base font-extrabold" style={{ color }}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Complaint Category Pill ────────────────────────────────────────────────────
const CAT_COLORS = {
  maintenance: '#3b82f6', food: '#f97316', cleanliness: '#10b981',
  security: '#ef4444', noise: '#8b5cf6', other: '#6b7280',
};

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════
export default function ForecastPanel({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use DEBUG_TOKEN fallback data if no real token
      if (token === 'DEBUG_TOKEN') {
        setData(generateDemoData());
        setLastRefresh(new Date());
        return;
      }
      const res = await axios.get(`${BACKEND}/api/forecast`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data);
        setLastRefresh(new Date());
      }
    } catch (e) {
      setError('Could not load forecast data. Using demo data.');
      setData(generateDemoData());
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForecast(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Running predictive models…</p>
    </div>
  );

  const { summary, revenue, occupancy, complaints, energy } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-indigo-700 font-sans flex items-center gap-3">
            📈 Predictive Forecast
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            AI-powered 30-day predictions based on live hostel data
            {lastRefresh && ` · Updated ${lastRefresh.toLocaleTimeString('en-IN')}`}
          </p>
        </div>
        <button onClick={fetchForecast}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm px-4 py-2 rounded-xl transition-colors">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
        <KpiCard
          icon="💰" label="Forecast Revenue (30d)"
          value={`₹${(summary.forecastRevenue30d || 0).toLocaleString('en-IN')}`}
          sub="Linear regression on transactions"
          trend={summary.revenueGrowthPct}
          color="#059669" bg="bg-emerald-50"
        />
        <KpiCard
          icon="🏠" label="Current Occupancy"
          value={`${summary.currentOccupancy}%`}
          sub={`${summary.occupiedRooms} / ${summary.totalRooms} rooms`}
          color="#4f46e5" bg="bg-indigo-50"
        />
        <KpiCard
          icon="⚠️" label="Pending Complaints"
          value={summary.pendingComplaints}
          sub="Requires resolution"
          color="#dc2626" bg="bg-red-50"
        />
        <KpiCard
          icon="⚡" label="Total Energy Used"
          value={`${summary.totalEnergy} kWh`}
          sub={`${summary.activeDevices} active IoT devices`}
          color="#d97706" bg="bg-amber-50"
        />
      </div>

      {/* Forecast Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* Revenue Forecast */}
        <ForecastCard
          title="Revenue Forecast"
          icon="💰"
          subtitle="30-day collection prediction from payment trends"
          color="#059669"
          chart={
            <MiniLineChart data={revenue.forecast} color="#059669" height={90} />
          }
          stats={[
            { label: 'Total Forecast', value: `₹${(summary.forecastRevenue30d || 0).toLocaleString('en-IN')}` },
            { label: 'Daily Avg', value: `₹${Math.round((summary.forecastRevenue30d || 0) / 30).toLocaleString('en-IN')}` },
            { label: 'Growth', value: `${summary.revenueGrowthPct}%` },
          ]}
        />

        {/* Occupancy Forecast */}
        <ForecastCard
          title="Occupancy Trend"
          icon="🏠"
          subtitle="Room fill rate over next 30 days"
          color="#4f46e5"
          chart={
            <MiniLineChart data={occupancy.forecast} color="#4f46e5" height={90} />
          }
          stats={[
            { label: 'Current', value: `${summary.currentOccupancy}%` },
            { label: 'Projected Peak', value: `${Math.max(...(occupancy.forecast?.map(d => d.predicted) || [summary.currentOccupancy]))}%` },
            { label: 'Available Rooms', value: summary.totalRooms - summary.occupiedRooms },
          ]}
        />

        {/* Complaint Volume Forecast */}
        <ForecastCard
          title="Complaint Volume"
          icon="⚠️"
          subtitle="Weekly complaint predictions for proactive management"
          color="#ef4444"
          chart={
            <MiniBarChart data={complaints.forecast} color="#ef4444" />
          }
          stats={[
            { label: 'Next Week', value: complaints.forecast?.[0]?.predicted || 0 },
            { label: 'Next Month', value: complaints.forecast?.reduce((s, d) => s + d.predicted, 0) || 0 },
            { label: 'Pending Now', value: summary.pendingComplaints },
          ]}
        />

        {/* Energy Forecast */}
        <ForecastCard
          title="Energy Consumption"
          icon="⚡"
          subtitle="Predicted kWh usage with weekend/weekday patterns"
          color="#d97706"
          chart={
            <MiniLineChart data={energy.forecast} color="#d97706" height={90} />
          }
          stats={[
            { label: 'Daily Avg', value: `${energy.dailyAvg} kWh` },
            { label: 'Active Devices', value: summary.activeDevices },
            { label: 'Total Used', value: `${summary.totalEnergy} kWh` },
          ]}
        />
      </div>

      {/* Complaint Category Breakdown */}
      {complaints.byCategory?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Complaint Category Breakdown
            <span className="text-xs font-normal text-gray-400">(last 30 days)</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {complaints.byCategory.map(cat => {
              const color = CAT_COLORS[cat._id] || '#6b7280';
              const total = complaints.byCategory.reduce((s, c) => s + c.count, 0);
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={cat._id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-sm font-semibold capitalize text-gray-700">{cat._id}</span>
                  <span className="text-xs text-gray-400">{cat.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>

          {/* Visual proportion bar */}
          <div className="flex rounded-full overflow-hidden h-2 mt-4">
            {complaints.byCategory.map(cat => {
              const total = complaints.byCategory.reduce((s, c) => s + c.count, 0);
              const pct = (cat.count / total) * 100;
              return (
                <div key={cat._id} style={{ width: `${pct}%`, background: CAT_COLORS[cat._id] || '#6b7280' }} />
              );
            })}
          </div>
        </div>
      )}

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold text-lg">AI Insights</h3>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Powered by linear regression</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            summary.forecastRevenue30d > summary.last30dRevenue
              ? `📈 Revenue is trending upward by ${summary.revenueGrowthPct}% — consider investing in new amenities.`
              : `📉 Revenue is projecting lower than last month — consider running a fee reminder campaign.`,
            summary.currentOccupancy > 85
              ? `🏠 Occupancy is high (${summary.currentOccupancy}%) — consider waitlisting for peak season.`
              : `🏠 Occupancy at ${summary.currentOccupancy}% — run a referral campaign to fill ${summary.totalRooms - summary.occupiedRooms} vacant rooms.`,
            summary.pendingComplaints > 3
              ? `⚠️ ${summary.pendingComplaints} complaints need attention — prioritize resolution this week.`
              : `✅ Complaint volume is low (${summary.pendingComplaints} pending) — hostel operations are running smoothly.`,
            summary.activeDevices > 0
              ? `⚡ ${summary.activeDevices} IoT devices active — daily energy usage is ${energy.dailyAvg} kWh.`
              : `💡 No IoT devices active — enable smart devices for energy monitoring.`,
          ].map((insight, i) => (
            <div key={i} className="bg-white/10 rounded-xl px-4 py-3 text-sm leading-relaxed">
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Demo data for DEBUG_TOKEN mode ─────────────────────────────────────────────
function generateDemoData() {
  const days = n => Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      predicted: Math.round(8000 + Math.random() * 4000 + i * 100),
    };
  });
  return {
    summary: {
      currentOccupancy: 78, totalRooms: 60, occupiedRooms: 47,
      forecastRevenue30d: 285000, last30dRevenue: 252000, revenueGrowthPct: '13.1',
      pendingComplaints: 4, activeDevices: 7, totalEnergy: 89.4,
    },
    revenue: { forecast: days(30), historical: [] },
    occupancy: {
      current: 78,
      forecast: Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i * 2.5);
        return { date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), predicted: Math.min(98, 78 + i * 1.2) };
      }),
    },
    complaints: {
      forecast: Array.from({ length: 6 }, (_, i) => ({
        label: `Week ${i + 1}`,
        date: `W${i + 1}`,
        predicted: Math.round(3 + Math.random() * 5),
      })),
      byCategory: [
        { _id: 'maintenance', count: 12 },
        { _id: 'food', count: 5 },
        { _id: 'cleanliness', count: 4 },
        { _id: 'noise', count: 2 },
        { _id: 'other', count: 1 },
      ],
    },
    energy: {
      dailyAvg: 2.98,
      forecast: Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i * 2.5);
        return { date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), predicted: parseFloat((2.5 + Math.random() * 1.5).toFixed(2)) };
      }),
    },
  };
}
