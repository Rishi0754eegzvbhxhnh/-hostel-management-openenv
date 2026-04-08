import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FinanceChatbot from '../components/FinanceChatbot';
import AdminIoTPanel from '../components/AdminIoTPanel';
import ForecastPanel from '../components/ForecastPanel';

const BACKEND = 'http://localhost:5000';
const CATEGORY_COLORS = {
  maintenance: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  cleanliness: 'bg-green-100 text-green-700',
  security: 'bg-red-100 text-red-700',
  noise: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};
const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_review: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  open: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
};

const Badge = ({ label, colorClass }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${colorClass}`}>
    {label?.replace('_', ' ')}
  </span>
);

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
    <div>
      <p className="text-3xl font-headline font-extrabold text-on-surface">{value}</p>
      <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
      {sub && <p className="text-xs text-outline mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('overview');
  const [sampleTransactions, setSampleTransactions] = useState([]);
  const [sampleBookings, setSampleBookings] = useState([]);
  const [pendingFees, setPendingFees] = useState([]);
  const [sampleStudents, setSampleStudents] = useState([]);
  const [notifSending, setNotifSending] = useState(null);
  const [notifChannel, setNotifChannel] = useState({});
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg, detail }
  const [stats, setStats] = useState({ totalStudents: 0, pendingComplaints: 0, openMaintenance: 0, resolvedComplaints: 0 });
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token || user.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    if (token === 'DEBUG_TOKEN') {
      setStats({ totalStudents: 156, pendingComplaints: 4, openMaintenance: 2, resolvedComplaints: 98 });
      setComplaints([{ _id: '1', title: 'Water Leak', studentName: 'Rishi', status: 'pending', priority: 'high', category: 'maintenance', createdAt: new Date() }]);
      setStudents([{ _id: 'S1', fullName: 'Rishi Kumar', email: 'rishi@edu.in', collegeId: 'CS2024', phone: '9848022338' }]);
      setMaintenance([{ _id: 'M1', roomNumber: '302', description: 'Fan noise', status: 'open', type: 'single', isAvailable: true, view360: null }]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [statsRes, complaintsRes, studentsRes, roomsRes, maintenanceRes] = await Promise.all([
        axios.get(`${BACKEND}/api/admin/stats`, { headers }),
        axios.get(`${BACKEND}/api/complaints`, { headers }),
        axios.get(`${BACKEND}/api/admin/students`, { headers }),
        axios.get(`${BACKEND}/api/rooms`, { headers }),
        axios.get(`${BACKEND}/api/admin/maintenance`, { headers }),
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setStudents(studentsRes.data);
      setRooms(roomsRes.data);
      setMaintenance(maintenanceRes.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally { setLoading(false); }
  };

  const seedDatabase = async () => {
    if (!window.confirm('This will reset all rooms and add sample students. Proceed?')) return;
    setLoading(true);
    try {
      await axios.post(`${BACKEND}/api/rooms/seed`, {}, { headers });
      await fetchAll();
      setToast({ type: 'success', msg: 'System Initialized!', detail: 'Live room inventory and sample data seeded successfully.' });
    } catch (err) {
      setToast({ type: 'error', msg: 'Seed Failed', detail: err.message });
    } finally { setLoading(false); }
  };

  const [menuRandomizing, setMenuRandomizing] = useState(false);
  const randomizeMenu = async () => {
    setMenuRandomizing(true);
    try {
      const res = await axios.post(`${BACKEND}/api/sample/menu/randomize`, {}, { headers });
      if (res.data.success) {
        const today = new Date().toLocaleDateString('en-IN', { weekday: 'long' });
        const todayMenu = res.data.data?.[today];
        const preview = todayMenu
          ? `Today (${today}): 🍳 ${todayMenu.breakfast?.items?.slice(0,1).join(', ')} · 🍛 ${todayMenu.lunch?.items?.slice(0,1).join(', ')} · 🍽️ ${todayMenu.dinner?.items?.slice(0,1).join(', ')}`
          : 'Full 7-day menu updated!';
        setToast({ type: 'success', msg: '🎲 Menu Randomized!', detail: preview });
        setTimeout(() => setToast(null), 5000);
      }
    } catch (err) {
      setToast({ type: 'error', msg: 'Randomize Failed', detail: err.message });
    } finally { setMenuRandomizing(false); }
  };

  const updateComplaintStatus = async (id, status) => {
    // Debug mode: update state locally (fake IDs aren't valid MongoDB ObjectIds)
    if (token === 'DEBUG_TOKEN') {
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status, adminResponse } : c));
      setSelectedComplaint(null);
      setToast({ type: 'success', msg: 'Status Updated (Demo)', detail: `Complaint marked as ${status}` });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      await axios.patch(`${BACKEND}/api/complaints/${id}`, { status, adminResponse }, { headers });
      fetchAll();
      setSelectedComplaint(null);
    } catch (err) { alert('Failed to update'); }
  };

  const updateMaintenanceStatus = async (id, status) => {
    try {
      await axios.patch(`${BACKEND}/api/admin/maintenance/${id}`, { status }, { headers });
      fetchAll();
    } catch (err) { alert('Failed to update'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const [autoNotifyStatus, setAutoNotifyStatus] = useState(null); // null | 'sending' | { sent, failed, results }

  // Load sample data for expo tabs
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/sample/transactions').then(r => r.json()),
      fetch('http://localhost:5000/api/sample/bookings').then(r => r.json()),
      fetch('http://localhost:5000/api/sample/pending-fees').then(r => r.json()),
      fetch('http://localhost:5000/api/sample/students').then(r => r.json()),
    ]).then(([tx, bk, pf, st]) => {
      if (tx.success) setSampleTransactions(tx.data);
      if (bk.success) setSampleBookings(bk.data);
      if (pf.success) setPendingFees(pf.data);
      if (st.success) setSampleStudents(st.data);
    }).catch(console.error);
  }, []);

  // Auto-send notifications when admin opens Pending Fees tab
  useEffect(() => {
    if (activeTab !== 'pending-fees') return;
    setAutoNotifyStatus('sending');

    fetch('http://localhost:5000/api/sample/auto-notify-overdue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'email' }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAutoNotifyStatus({ sent: data.sent, failed: data.failed, message: data.message });
          // Refresh pending fees to get updated reminder counts
          fetch('http://localhost:5000/api/sample/pending-fees').then(r => r.json()).then(pf => {
            if (pf.success) setPendingFees(pf.data);
          });
          if (data.sent > 0) {
            showToast('success', `📡 Auto-Notified ${data.sent} overdue student${data.sent > 1 ? 's' : ''}!`,
              data.results?.map(r => `${r.studentName}: ${r.ok ? '✅' : '❌'}`).join(' · ')
            );
          }
        } else {
          setAutoNotifyStatus({ sent: 0, failed: 0, message: 'Auto-notify skipped' });
        }
      })
      .catch(() => setAutoNotifyStatus({ sent: 0, failed: 0, message: 'Backend not reachable' }));
  }, [activeTab]);


  const showToast = (type, msg, detail = '') => {
    setToast({ type, msg, detail });
    setTimeout(() => setToast(null), 5000);
  };

  const sendFeeReminder = async (fee) => {
    const ch = notifChannel[fee.id] || 'email';
    setNotifSending(fee.id);
    try {
      const res = await fetch('http://localhost:5000/api/notifications/send-fee-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: fee.studentId,
          studentName: fee.studentName,
          studentEmail: fee.email,
          phone: fee.phone,
          roomNumber: fee.room,
          amount: fee.amount,
          daysOverdue: fee.daysOverdue,
          lateFee: fee.lateFee,
          channel: ch,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const mode = data.results?.email?.mode || data.results?.sms?.mode || 'live';
        showToast(
          'success',
          `✅ Reminder sent to ${fee.studentName}!`,
          mode === 'demo'
            ? `📧 Demo mode: ${data.results?.email?.message || data.results?.sms?.message || 'Notification logged.'}`
            : `Sent via ${ch.toUpperCase()} successfully.`,
        );
        // Update the reminder count in UI
        setPendingFees(prev => prev.map(f =>
          f.id === fee.id
            ? { ...f, reminderCount: f.reminderCount + 1, lastReminder: new Date().toLocaleDateString('en-IN') }
            : f
        ));
      } else {
        showToast('error', `❌ Failed to send to ${fee.studentName}`, data.errors?.join(', ') || data.error || 'Unknown error');
      }
    } catch (err) {
      showToast('error', '❌ Network error', err.message);
    } finally {
      setNotifSending(null);
    }
  };

  const bulkSendAll = async () => {
    const ch = 'both';
    setNotifSending('bulk');
    try {
      const res = await fetch('http://localhost:5000/api/notifications/bulk-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: ch,
          students: pendingFees.map(f => ({
            studentId: f.studentId,
            studentName: f.studentName,
            email: f.email,
            phone: f.phone,
            room: f.room,
            amount: f.amount,
            daysOverdue: f.daysOverdue,
            lateFee: f.lateFee,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `📡 Bulk reminders sent!`, `${data.summary.sent} sent, ${data.summary.failed} failed out of ${pendingFees.length} students.`);
        setPendingFees(prev => prev.map(f => ({ ...f, reminderCount: f.reminderCount + 1, lastReminder: new Date().toLocaleDateString('en-IN') })));
      } else {
        showToast('error', '❌ Bulk send failed', data.error);
      }
    } catch (err) {
      showToast('error', '❌ Network error', err.message);
    } finally {
      setNotifSending(null);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'complaints', label: 'Complaints', icon: 'report', badge: stats.pendingComplaints },
    { id: 'maintenance', label: 'Maintenance', icon: 'build', badge: stats.openMaintenance },
    { id: 'rooms', label: 'Inventory (360)', icon: 'bed' },
    { id: 'digital-twin', label: 'Digital Twin', icon: 'view_in_ar' },
    { id: 'students', label: 'Students', icon: 'groups' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
    { id: 'parking', label: '🅿️ Parking', icon: 'local_parking' },
    { id: 'studypods', label: '📚 Study Pods', icon: 'school' },
    { id: 'laundry', label: '🧺 Laundry', icon: 'local_laundry_service' },
    { id: 'security', label: '🔒 Security', icon: 'security' },
    { id: 'iot', label: '💡 IoT Control', icon: 'lightbulb' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
    { id: 'bookings', label: 'Bookings', icon: 'event_available' },
    { id: 'pending-fees', label: 'Pending Fees', icon: 'pending_actions', badge: pendingFees.filter(p => p.daysOverdue > 0).length },
    { id: 'forecast', label: '📈 Forecast', icon: 'trending_up' },
    { id: 'finance-ai', label: '🤖 Finance AI', icon: 'smart_toy' },
  ];

  return (
    <div className="min-h-screen bg-surface font-body flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-primary min-h-screen p-6 gap-2">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          </div>
          <div>
            <p className="text-white font-headline font-bold leading-tight">Admin Panel</p>
            <p className="text-white/60 text-[11px]">Hostel Console</p>
          </div>
        </div>

        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id ? 'bg-white text-primary font-bold' : 'text-white/70 hover:bg-white/10 font-medium'}`}>
            <span className="material-symbols-outlined text-[20px]" style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
            <span className="text-sm flex-1">{tab.label}</span>
            {tab.badge > 0 && (
              <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{tab.badge}</span>
            )}
          </button>
        ))}

        <div className="mt-auto">
          <div className="border-t border-white/10 pt-4 mb-3">
            <p className="text-white font-semibold text-sm">{user.fullName}</p>
            <p className="text-white/50 text-xs">{user.email}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <span className="material-symbols-outlined text-[18px]">logout</span>Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto relative">

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-8 right-8 z-[100] max-w-md rounded-2xl shadow-2xl p-5 flex items-start gap-4 ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
              : 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
          }`}>
            <div className="text-2xl shrink-0">{toast.type === 'success' ? '✅' : '❌'}</div>
            <div className="flex-1">
              <p className="font-black text-sm">{toast.msg}</p>
              {toast.detail && <p className="text-xs opacity-80 mt-1 leading-relaxed">{toast.detail}</p>}
            </div>
            <button onClick={() => setToast(null)} className="text-white/60 hover:text-white text-xl font-bold leading-none">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="material-symbols-outlined animate-spin text-primary text-5xl">sync</span>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-headline text-3xl font-extrabold text-primary mb-1">Dashboard Overview</h2>
                    <p className="text-on-surface-variant">Welcome back, {user.fullName} 👋</p>
                  </div>
                  <button
                    onClick={randomizeMenu}
                    disabled={menuRandomizing}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-lg shadow-orange-200 transition-all disabled:opacity-60"
                  >
                    {menuRandomizing
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating…</>
                      : <>🎲 Randomize Menu</>
                    }
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                  <StatCard icon="groups" label="Total Students" value={stats.totalStudents} color="bg-primary-fixed text-primary" />
                  <StatCard icon="report" label="Pending Complaints" value={stats.pendingComplaints} sub="Needs attention" color="bg-error-container text-error" />
                  <StatCard icon="build" label="Open Maintenance" value={stats.openMaintenance} sub="In progress" color="bg-secondary-container text-secondary" />
                  <StatCard icon="check_circle" label="Resolved Complaints" value={stats.resolvedComplaints} color="bg-tertiary-fixed text-on-tertiary-fixed" />
                </div>

                {/* Recent Complaints Preview */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline font-bold text-lg">Recent Complaints</h3>
                    <button onClick={() => setActiveTab('complaints')}
                      className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                      View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {complaints.slice(0, 4).map(c => (
                      <div key={c._id} className="flex items-center justify-between py-3 border-b border-surface-container-low last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-fixed rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">{c.studentName?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-on-surface">{c.title}</p>
                            <p className="text-xs text-on-surface-variant">{c.studentName} · Room {c.roomNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge label={c.category} colorClass={CATEGORY_COLORS[c.category]} />
                          <Badge label={c.status} colorClass={STATUS_COLORS[c.status]} />
                        </div>
                      </div>
                    ))}
                    {complaints.length === 0 && <p className="text-on-surface-variant text-sm text-center py-6">No complaints yet 🎉</p>}
                  </div>
                </div>

                {/* Recent Maintenance */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline font-bold text-lg">Maintenance Requests</h3>
                    <button onClick={() => setActiveTab('maintenance')}
                      className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                      View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {maintenance.slice(0, 4).map(m => (
                      <div key={m._id} className="flex items-center justify-between py-3 border-b border-surface-container-low last:border-0">
                        <div>
                          <p className="font-semibold text-sm">{m.issue}</p>
                          <p className="text-xs text-on-surface-variant">Room {m.roomNumber} · {m.studentName}</p>
                        </div>
                        <Badge label={m.status} colorClass={STATUS_COLORS[m.status]} />
                      </div>
                    ))}
                    {maintenance.length === 0 && <p className="text-on-surface-variant text-sm text-center py-6">No maintenance requests 🔧</p>}
                  </div>
                </div>
              </div>
            )}

            {/* COMPLAINTS TAB */}
            {activeTab === 'complaints' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Student Complaints</h2>
                <p className="text-on-surface-variant mb-8">Review and respond to complaints with image evidence.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {complaints.map(c => (
                    <div key={c._id} className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Image proofs */}
                      {c.images?.length > 0 && (
                        <div className={`grid ${c.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-0.5 max-h-40 overflow-hidden`}>
                          {c.images.slice(0, 2).map((img, i) => (
                            <div key={i} className="relative h-40 bg-surface-container-low cursor-pointer group"
                              onClick={() => setSelectedImage(img)}>
                              <img src={img} alt={`Proof ${i+1}`} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                                <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                              </div>
                              {c.images.length > 2 && i === 1 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">+{c.images.length - 2}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {!c.images?.length && (
                        <div className="h-20 bg-surface-container-low flex items-center justify-center">
                          <span className="material-symbols-outlined text-outline text-3xl">image_not_supported</span>
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge label={c.category} colorClass={CATEGORY_COLORS[c.category]} />
                          <Badge label={c.priority} colorClass={PRIORITY_COLORS[c.priority]} />
                          <Badge label={c.status} colorClass={STATUS_COLORS[c.status]} />
                          {c.aiStatus && (
                            <span className={`inline-flex items-center px-2.2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                              c.aiStatus === 'authentic' ? 'bg-emerald-100 text-emerald-700' : 
                              c.aiStatus === 'ai_detected' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {c.aiStatus === 'authentic' ? '✓ Authentic' : c.aiStatus === 'ai_detected' ? '⚠ AI GENERATED' : 'Processing AI...'}
                            </span>
                          )}
                        </div>
                        <h4 className="font-headline font-bold text-on-surface mb-1">{c.title}</h4>
                        <p className="text-xs text-on-surface-variant mb-2">{c.studentName} · Room {c.roomNumber}</p>
                        <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{c.description}</p>
                        <p className="text-[10px] text-outline mb-3">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>

                        <button onClick={() => { setSelectedComplaint(c); setAdminResponse(c.adminResponse || ''); }}
                          className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-container transition-colors">
                          Review & Respond
                        </button>
                      </div>
                    </div>
                  ))}
                  {complaints.length === 0 && (
                    <div className="col-span-full text-center py-20 text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl mb-3 block">sentiment_satisfied</span>
                      <p className="font-semibold">No complaints filed yet!</p>
                    </div>
                  )}
                </div>

                {/* Complaint Detail Modal */}
                {selectedComplaint && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedComplaint(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="font-headline text-xl font-bold text-primary">{selectedComplaint.title}</h3>
                            <p className="text-sm text-on-surface-variant">{selectedComplaint.studentName} · Room {selectedComplaint.roomNumber}</p>
                          </div>
                          <button onClick={() => setSelectedComplaint(null)} className="text-on-surface-variant hover:text-on-surface">
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge label={selectedComplaint.category} colorClass={CATEGORY_COLORS[selectedComplaint.category]} />
                          <Badge label={selectedComplaint.priority} colorClass={PRIORITY_COLORS[selectedComplaint.priority]} />
                          <Badge label={selectedComplaint.status} colorClass={STATUS_COLORS[selectedComplaint.status]} />
                          {selectedComplaint.aiStatus && (
                            <div className={`px-3 py-1 rounded-lg flex items-center gap-2 ${
                              selectedComplaint.aiStatus === 'authentic' ? 'bg-emerald-50 text-emerald-700' : 
                              selectedComplaint.aiStatus === 'ai_detected' ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-gray-700'
                            }`}>
                              <span className="material-symbols-outlined text-sm">{selectedComplaint.aiStatus === 'authentic' ? 'verified' : 'warning'}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                {selectedComplaint.aiStatus === 'authentic' ? 'Authentic Photo' : 'AI Generation Detected'}
                                {selectedComplaint.aiConfidence > 0 && ` (${selectedComplaint.aiConfidence}%)`}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-on-surface mb-6 leading-relaxed">{selectedComplaint.description}</p>

                        {/* Images */}
                        {selectedComplaint.images?.length > 0 && (
                          <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Visual Evidence ({selectedComplaint.images.length})</p>
                            <div className="grid grid-cols-3 gap-2">
                              {selectedComplaint.images.map((img, i) => (
                                <div key={i} className="rounded-xl overflow-hidden h-24 cursor-pointer group" onClick={() => setSelectedImage(img)}>
                                  <img src={img} alt={`Proof ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Admin Response</label>
                          <textarea value={adminResponse} onChange={e => setAdminResponse(e.target.value)} rows={3}
                            placeholder="Write your response to the student..."
                            className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <button onClick={() => updateComplaintStatus(selectedComplaint._id, 'in_review')}
                            className="py-3 bg-blue-100 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-200 transition-colors">
                            Mark In Review
                          </button>
                          <button onClick={() => updateComplaintStatus(selectedComplaint._id, 'resolved')}
                            className="py-3 bg-green-100 text-green-700 rounded-xl font-bold text-sm hover:bg-green-200 transition-colors">
                            ✓ Resolve
                          </button>
                          <button onClick={() => updateComplaintStatus(selectedComplaint._id, 'rejected')}
                            className="py-3 bg-red-100 text-red-700 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Lightbox */}
                {selectedImage && (
                  <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-6" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-6 right-6 text-white" onClick={() => setSelectedImage(null)}>
                      <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                    <img src={selectedImage} alt="Complaint proof" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* MAINTENANCE TAB */}
            {activeTab === 'maintenance' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Maintenance Requests</h2>
                <p className="text-on-surface-variant mb-8">Track and manage hostel maintenance issues.</p>

                <div className="space-y-4">
                  {maintenance.map(m => (
                    <div key={m._id} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 flex flex-col md:flex-row md:items-center gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{m.issue}</p>
                            <p className="text-xs text-on-surface-variant">Room {m.roomNumber} · {m.studentName}</p>
                          </div>
                        </div>
                        {m.description && <p className="text-sm text-on-surface-variant ml-13 mt-2">{m.description}</p>}
                        {m.images?.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {m.images.slice(0, 3).map((img, i) => (
                              <div key={i} className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedImage(img)}>
                                <img src={img} alt="proof" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-outline mt-2">{new Date(m.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[150px]">
                        <Badge label={m.status} colorClass={STATUS_COLORS[m.status]} />
                        <select
                          value={m.status}
                          onChange={e => updateMaintenanceStatus(m._id, e.target.value)}
                          className="text-sm bg-surface-container-low rounded-xl px-3 py-2 font-medium focus:outline-none"
                        >
                          <option value="open">Open</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {maintenance.length === 0 && (
                    <div className="text-center py-20 text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl mb-3 block">handyman</span>
                      <p className="font-semibold">No maintenance requests yet!</p>
                    </div>
                  )}
                </div>

                {selectedImage && (
                  <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-6" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-6 right-6 text-white" onClick={() => setSelectedImage(null)}>
                      <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                    <img src={selectedImage} alt="Maintenance proof" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Student Directory</h2>
                <p className="text-on-surface-variant mb-8">{students.length} registered student{students.length !== 1 ? 's' : ''}</p>
                <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          {['Student', 'Email', 'College ID', 'Room', 'Joined'].map(h => (
                            <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low">
                        {students.map(s => (
                          <tr key={s._id} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-9 h-9 bg-primary-fixed rounded-full flex items-center justify-center shrink-0">
                                <span className="font-bold text-primary text-sm">{s.fullName?.charAt(0)}</span>
                              </div>
                              <span className="font-semibold text-on-surface">{s.fullName}</span>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant">{s.email}</td>
                            <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">{s.collegeId}</td>
                            <td className="px-6 py-4 text-on-surface-variant">{s.room?.roomNumber || '—'}</td>
                            <td className="px-6 py-4 text-on-surface-variant">{new Date(s.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {students.length === 0 && (
                          <tr><td colSpan={5} className="text-center py-12 text-on-surface-variant">No students registered yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ROOMS MANAGEMENT TAB */}
            {activeTab === 'rooms' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Room Inventory</h2>
                <p className="text-on-surface-variant mb-8">Manage room status and occupancy levels across all blocks.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((r) => (
                    <div key={r._id} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg">Room {r.roomNumber}</h4>
                            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{r.type}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {r.isAvailable ? 'AVAILABLE' : 'BOOKED'}
                          </span>
                       </div>

                       <div className="mb-4">
                          <p className="text-xs text-on-surface-variant font-medium">Occupancy: {r.occupants?.length} / {r.capacity}</p>
                          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-1 overflow-hidden">
                             <div className="bg-primary h-full transition-all" style={{ width: `${(r.occupants?.length / r.capacity) * 100}%` }} />
                          </div>
                       </div>

                       <div className="relative aspect-video bg-surface-container-low rounded-xl overflow-hidden mb-4 group">
                          {r.view360 ? (
                            <img src={r.view360} className="w-full h-full object-cover" alt={`Room ${r.roomNumber}`} />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-outline">
                               <span className="material-symbols-outlined text-4xl mb-2">panorama_photosphere</span>
                               <p className="text-[10px] font-bold uppercase">No 360° Image</p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                             <input type="file" className="hidden" id={`room-v360-${r._id}`} />
                             <label htmlFor={`room-v360-${r._id}`} className="cursor-pointer bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold">
                                Upload 360° Photo
                             </label>
                          </div>
                       </div>
                    </div>
                  ))}
                  {rooms.length === 0 && <p className="col-span-full text-center py-20 text-on-surface-variant">No rooms in inventory.</p>}
                </div>
              </div>
            )}
            {activeTab === 'payments' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Fee Management</h2>
                <p className="text-on-surface-variant mb-8">Track student payment status and outstanding balances.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                  <StatCard icon="payments" label="Total Collected" value="₹8,40,000" sub="This semester" color="bg-green-100 text-green-700" />
                  <StatCard icon="pending" label="Outstanding" value="₹1,24,000" sub={`${students.length} students`} color="bg-orange-100 text-orange-700" />
                  <StatCard icon="check_circle" label="Paid in Full" value={`${Math.max(0, students.length - 2)}`} sub="Students cleared" color="bg-primary-fixed text-primary" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-surface-container-low flex justify-between items-center">
                    <h3 className="font-headline font-bold">Payment Ledger</h3>
                    <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                      Export CSV <span className="material-symbols-outlined text-sm">download</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          {['Student', 'College ID', 'Semester Fee', 'Paid', 'Outstanding', 'Status'].map(h => (
                            <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low">
                        {students.map((s, i) => {
                          const fee = 12000;
                          const paid = i % 3 === 0 ? fee : i % 3 === 1 ? fee * 0.5 : 0;
                          const outstanding = fee - paid;
                          const status = outstanding === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
                          const statusColor = outstanding === 0 ? 'bg-green-100 text-green-700' : paid > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                          return (
                            <tr key={s._id} className="hover:bg-surface-container-low/50 transition-colors">
                              <td className="px-6 py-4 font-semibold">{s.fullName}</td>
                              <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{s.collegeId}</td>
                              <td className="px-6 py-4">₹{fee.toLocaleString()}</td>
                              <td className="px-6 py-4 text-green-700 font-semibold">₹{paid.toLocaleString()}</td>
                              <td className="px-6 py-4 text-red-600 font-semibold">₹{outstanding.toLocaleString()}</td>
                              <td className="px-6 py-4"><Badge label={status} colorClass={statusColor} /></td>
                            </tr>
                          );
                        })}
                        {students.length === 0 && (
                          <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant">No student data available.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* DIGITAL TWIN REDIRECT */}
            {activeTab === 'digital-twin' && (
              <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-primary-container rounded-3xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-5xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>view_in_ar</span>
                </div>
                <h3 className="text-3xl font-headline font-black text-primary mb-4">Immersive Infrastructure</h3>
                <p className="text-on-surface-variant mb-8 text-lg">Load the high-performance Digital Twin Dashboard to visualize live occupancy, energy efficiency, and sensor analytics across all blocks.</p>
                <button 
                  onClick={() => navigate('/admin/digital-twin')}
                  className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                >
                  <span className="material-symbols-outlined">launch</span>
                  Launch 3D Twin Engine
                </button>
                <p className="mt-8 text-xs text-outline font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Real-time Telemetry Active
                </p>
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'transactions' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Transaction History</h2>
                <p className="text-on-surface-variant mb-6">Complete log of all payments made by students.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard icon="payments" label="Total Revenue" value={`₹${sampleTransactions.filter(t=>t.status==='paid').reduce((s,t)=>s+t.amount,0).toLocaleString()}`} color="bg-green-100 text-green-700" />
                  <StatCard icon="pending" label="Pending" value={`₹${sampleTransactions.filter(t=>t.status==='pending').reduce((s,t)=>s+t.amount,0).toLocaleString()}`} color="bg-amber-100 text-amber-700" />
                  <StatCard icon="receipt_long" label="Total Transactions" value={sampleTransactions.length} color="bg-primary-fixed text-primary" />
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          {['ID', 'Student', 'Room', 'Amount', 'Type', 'Date', 'Status', 'Method'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low">
                        {rooms.filter(r => r.occupants?.length > 0).map((r, i) => (
                          <tr key={r._id} className="hover:bg-surface-container-low/50">
                            <td className="px-4 py-3 font-mono text-xs text-outline">TXN-00{i+1}</td>
                            <td className="px-4 py-3 font-semibold">{r.occupants?.[0]?.fullName || 'Hostel Student'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">{r.roomNumber}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800">₹{r.pricePerMonth?.toLocaleString() || '6,500'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 capitalize">{r.type}</span>
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant text-xs">{new Date(r.updatedAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <Badge label="paid" colorClass="bg-green-100 text-green-700" />
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">Live DB</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Room Bookings</h2>
                <p className="text-on-surface-variant mb-6">All active, upcoming, and historical room reservations.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard icon="event_available" label="Active Bookings" value={sampleBookings.filter(b=>b.status==='active').length} color="bg-green-100 text-green-700" />
                  <StatCard icon="schedule" label="Upcoming" value={sampleBookings.filter(b=>b.status==='upcoming').length} color="bg-blue-100 text-blue-700" />
                  <StatCard icon="payments" label="Advance Collected" value={`₹${sampleBookings.reduce((s,b)=>s+b.advancePaid,0).toLocaleString()}`} color="bg-primary-fixed text-primary" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {rooms.filter(r => r.occupants?.length > 0).map(r => (
                    <div key={r._id} className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-on-surface">Occupied Room</h4>
                          <p className="text-xs text-outline mono">Room {r.roomNumber}</p>
                        </div>
                        <Badge label="Active" colorClass="bg-green-100 text-green-700" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-surface-container-low rounded-lg p-2">
                          <p className="text-outline">Type</p>
                          <p className="font-bold text-on-surface text-base uppercase">{r.type}</p>
                        </div>
                        <div className="bg-surface-container-low rounded-lg p-2">
                          <p className="text-outline">Capacity</p>
                           <p className="font-bold">{r.occupants.length} / {r.capacity}</p>
                        </div>
                        <div className="bg-surface-container-low rounded-lg p-2 text-center col-span-2 py-3">
                           <p className="font-black text-emerald-700 text-lg">₹{r.pricePerMonth?.toLocaleString()} / mo</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PENDING FEES TAB */}
            {activeTab === 'pending-fees' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-headline text-3xl font-extrabold text-primary mb-1">⚠️ Pending Fee Alerts</h2>
                    <p className="text-on-surface-variant">Send timely reminders to students with outstanding dues via Email or SMS.</p>
                  </div>
                  <button
                    onClick={bulkSendAll}
                    disabled={notifSending === 'bulk' || pendingFees.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 text-sm uppercase tracking-wider whitespace-nowrap"
                  >
                    {notifSending === 'bulk' ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending All...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">send</span> Notify All ({pendingFees.length}) via Email + SMS</>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard icon="pending_actions" label="Total Outstanding" value={`₹${pendingFees.reduce((s,f)=>s+f.amount+f.lateFee,0).toLocaleString()}`} color="bg-red-100 text-red-700" />
                  <StatCard icon="warning" label="Overdue Cases" value={pendingFees.filter(p=>p.daysOverdue>0).length} color="bg-amber-100 text-amber-700" />
                  <StatCard icon="notifications_active" label="Reminders Sent (Session)" value={pendingFees.reduce((s,p)=>s+p.reminderCount,0)} color="bg-primary-fixed text-primary" />
                </div>

                {/* Auto-Notify Status Banner */}
                {autoNotifyStatus && (
                  <div className={`flex items-center gap-3 p-4 rounded-2xl mb-5 text-sm font-semibold border ${
                    autoNotifyStatus === 'sending'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                      : autoNotifyStatus.sent > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {autoNotifyStatus === 'sending' ? (
                      <><span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>🤖 Auto-notifying all overdue students via email right now...</span></>
                    ) : (
                      <><span className="text-xl shrink-0">{autoNotifyStatus.sent > 0 ? '📡' : 'ℹ️'}</span>
                      <div>
                        <p className="font-black">{autoNotifyStatus.message}</p>
                        {autoNotifyStatus.sent > 0 && <p className="text-xs font-normal mt-0.5 opacity-75">{autoNotifyStatus.sent} email{autoNotifyStatus.sent > 1 ? 's' : ''} dispatched automatically on tab open · Check backend console for full delivery log</p>}
                      </div></>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {pendingFees.map(fee => (
                    <div key={fee.id} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${fee.daysOverdue > 20 ? 'border-red-500' : fee.daysOverdue > 0 ? 'border-amber-400' : 'border-blue-400'}`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-red-600">{fee.studentName.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">{fee.studentName} <span className="text-xs text-outline">({fee.studentId})</span></p>
                              <p className="text-xs text-slate-500">Room {fee.room}</p>
                              <div className="flex gap-3 mt-1">
                                {fee.email && <p className="text-xs text-indigo-600 font-semibold">✉️ {fee.email}</p>}
                                {fee.phone && <p className="text-xs text-teal-600 font-semibold">📱 {fee.phone}</p>}
                              </div>
                            </div>
                            {fee.daysOverdue > 0 && (
                              <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full">{fee.daysOverdue} DAYS OVERDUE</span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div><p className="text-outline text-xs">Due Amount</p><p className="font-black text-red-600 text-lg">₹{fee.amount.toLocaleString()}</p></div>
                            <div><p className="text-outline text-xs">Late Fee</p><p className="font-bold text-amber-600">₹{fee.lateFee}</p></div>
                            <div><p className="text-outline text-xs">Reminders</p><p className="font-bold">{fee.reminderCount} sent</p></div>
                          </div>
                          {fee.lastReminder && <p className="text-xs text-outline mt-2">Last reminder: {fee.lastReminder}</p>}
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Send Reminder Via</p>
                          <div className="flex gap-2">
                            {['email', 'sms', 'both'].map(ch => (
                              <button
                                key={ch}
                                onClick={() => setNotifChannel(prev => ({...prev, [fee.id]: ch}))}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                  (notifChannel[fee.id] || 'email') === ch
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'border-slate-200 text-slate-600 hover:border-indigo-400'
                                }`}
                              >
                                {ch === 'email' ? '✉️' : ch === 'sms' ? '📱' : '📡'} {ch}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => sendFeeReminder(fee)}
                            disabled={notifSending === fee.id}
                            className="py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {notifSending === fee.id ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Sending...</>) : 'Send Reminder'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IOT CONTROL TAB */}
            {activeTab === 'iot' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">💡 IoT Device Control</h2>
                <p className="text-on-surface-variant mb-6">Monitor and control hostel appliances — lights, fans, ACs, geysers and water motors across all blocks.</p>
                <AdminIoTPanel />
              </div>
            )}

            {/* FINANCE AI TAB */}
            {activeTab === 'finance-ai' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">🤖 Finance AI Chatbot</h2>
                <p className="text-on-surface-variant mb-6">Conversational finance insights — ask about dues, collections, forecasts, and more.</p>
                <FinanceChatbot />
              </div>
            )}

            {/* FORECAST TAB */}
            {activeTab === 'forecast' && (
              <ForecastPanel token={token} />
            )}

          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
