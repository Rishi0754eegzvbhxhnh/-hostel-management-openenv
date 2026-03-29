import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND = 'http://127.0.0.1:5000';
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
  const [stats, setStats] = useState({ totalStudents: 0, pendingComplaints: 0, openMaintenance: 0, resolvedComplaints: 0 });
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const [statsRes, complaintsRes, studentsRes, maintenanceRes] = await Promise.all([
        axios.get(`${BACKEND}/api/admin/stats`, { headers }),
        axios.get(`${BACKEND}/api/complaints`, { headers }),
        axios.get(`${BACKEND}/api/admin/students`, { headers }),
        axios.get(`${BACKEND}/api/admin/maintenance`, { headers }),
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setStudents(studentsRes.data);
      setMaintenance(maintenanceRes.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally { setLoading(false); }
  };

  const updateComplaintStatus = async (id, status) => {
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'complaints', label: 'Complaints', icon: 'report', badge: stats.pendingComplaints },
    { id: 'maintenance', label: 'Maintenance', icon: 'build', badge: stats.openMaintenance },
    { id: 'rooms', label: 'Inventory (360)', icon: 'bed' },
    { id: 'digital-twin', label: 'Digital Twin', icon: 'view_in_ar' },
    { id: 'students', label: 'Students', icon: 'groups' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
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
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="material-symbols-outlined animate-spin text-primary text-5xl">sync</span>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Dashboard Overview</h2>
                <p className="text-on-surface-variant mb-8">Welcome back, {user.fullName} 👋</p>

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
                        <div className="flex flexwrap gap-2 mb-3">
                          <Badge label={c.category} colorClass={CATEGORY_COLORS[c.category]} />
                          <Badge label={c.priority} colorClass={PRIORITY_COLORS[c.priority]} />
                          <Badge label={c.status} colorClass={STATUS_COLORS[c.status]} />
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
                            <td className="px-6 py-4 text-on-surface-variant">{s.room || '—'}</td>
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
                <p className="text-on-surface-variant mb-8">Manage room status and upload 360° panoramic previews.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(maintenance.length > 0 ? maintenance : [{roomNumber: '302', type: 'single', isAvailable: true, view360: null}]).map((r, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg">Room {r.roomNumber || '302'}</h4>
                            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{r.type || 'Single'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {r.isAvailable ? 'AVAILABLE' : 'BOOKED'}
                          </span>
                       </div>

                       <div className="relative aspect-video bg-surface-container-low rounded-xl overflow-hidden mb-4 group">
                          {r.view360 ? (
                            <img src={r.view360} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-outline">
                               <span className="material-symbols-outlined text-4xl mb-2">panorama_photosphere</span>
                               <p className="text-[10px] font-bold uppercase">No 360° Image</p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                             <input type="file" className="hidden" id={`room-v360-${i}`} onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async (ev) => {
                                   try {
                                      // Simulated upload to memory for demo
                                      alert('360 Image uploaded to memory! In a real system, this would be saved to the database.');
                                      // This logic would normally hit an API endpoint to update the room's view360
                                   } catch { alert('Upload failed'); }
                                };
                                reader.readAsDataURL(file);
                             }} />
                             <label htmlFor={`room-v360-${i}`} className="cursor-pointer bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold">
                                Upload 360° Photo
                             </label>
                          </div>
                       </div>

                       <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-surface-container text-on-surface rounded-lg text-xs font-bold">Edit Details</button>
                          <button className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold">Toggle Status</button>
                       </div>
                    </div>
                  ))}
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
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
