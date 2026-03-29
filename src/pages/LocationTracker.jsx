import React, { useState, useEffect } from 'react';
import { MapPin, Users, Clock, AlertCircle, CheckCircle, Navigation, Activity } from 'lucide-react';

// ── MOCK DATA (replace with API calls to /api/location/*) ────────────────────
const STUDENTS = [
  { id: 1, name: 'Arjun Sharma', room: 'B-204', status: 'in-hostel', location: 'Common Room', lastSeen: '2 mins ago', lat: 28.6139, lng: 77.2090 },
  { id: 2, name: 'Priya Mehta', room: 'A-108', status: 'out', location: 'Library', lastSeen: '15 mins ago', lat: 28.6129, lng: 77.2080 },
  { id: 3, name: 'Ravi Kumar', room: 'C-305', status: 'in-room', location: 'Room C-305', lastSeen: 'Just now', lat: 28.6139, lng: 77.2090 },
  { id: 4, name: 'Sneha Patel', room: 'B-112', status: 'in-hostel', location: 'Mess Hall', lastSeen: '5 mins ago', lat: 28.6139, lng: 77.2090 },
  { id: 5, name: 'Amit Singh', room: 'A-201', status: 'out', location: 'Sports Complex', lastSeen: '30 mins ago', lat: 28.6149, lng: 77.2100 },
  { id: 6, name: 'Neha Gupta', room: 'C-410', status: 'in-room', location: 'Room C-410', lastSeen: '1 min ago', lat: 28.6139, lng: 77.2090 },
];

const ZONES = [
  { id: 1, name: 'Common Room', count: 12, capacity: 50, color: '#378ADD' },
  { id: 2, name: 'Mess Hall', count: 28, capacity: 100, color: '#1D9E75' },
  { id: 3, name: 'Study Room', count: 15, capacity: 30, color: '#EF9F27' },
  { id: 4, name: 'Gym', count: 8, capacity: 20, color: '#D85A30' },
  { id: 5, name: 'Library', count: 22, capacity: 60, color: '#7F77DD' },
];

const ALERTS = [
  { id: 1, type: 'warning', msg: 'Student Rahul K. has been outside hostel for 6+ hours', time: '10 mins ago' },
  { id: 2, type: 'info', msg: 'Mess Hall occupancy at 85% - peak dinner time', time: '15 mins ago' },
  { id: 3, type: 'success', msg: 'All students accounted for in evening roll call', time: '1 hour ago' },
];

const STATUS_CONFIG = {
  'in-room': { label: 'In Room', color: 'bg-green-100 text-green-700', icon: '🏠' },
  'in-hostel': { label: 'In Hostel', color: 'bg-blue-100 text-blue-700', icon: '🏢' },
  'out': { label: 'Outside', color: 'bg-amber-100 text-amber-700', icon: '🚶' },
};

// ─────────────────────────────────────────────────────────────────────────────
function SimpleMap({ students }) {
  return (
    <div className="relative w-full h-80 bg-gray-100 rounded-xl overflow-hidden border">
      {/* Simple map placeholder - replace with actual map library like Leaflet or Google Maps */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Map View</p>
          <p className="text-xs text-gray-400 mt-1">Integrate with Google Maps or Leaflet</p>
        </div>
      </div>
      
      {/* Student markers */}
      {students.slice(0, 5).map((student, i) => (
        <div
          key={student.id}
          className="absolute w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ 
            left: `${20 + i * 15}%`, 
            top: `${30 + (i % 2) * 20}%`,
            cursor: 'pointer'
          }}
          title={student.name}
        >
          {student.name.charAt(0)}
        </div>
      ))}
    </div>
  );
}

function ZoneCard({ zone }) {
  const percentage = (zone.count / zone.capacity) * 100;
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{zone.name}</h3>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${zone.color}20` }}>
          <Users className="w-5 h-5" style={{ color: zone.color }} />
        </div>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold text-gray-900">{zone.count}</span>
        <span className="text-xs text-gray-500">/ {zone.capacity} capacity</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all" 
          style={{ width: `${percentage}%`, backgroundColor: zone.color }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">{percentage.toFixed(0)}% occupied</p>
    </div>
  );
}

export default function LocationTracker() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveTracking, setLiveTracking] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredStudents = STUDENTS.filter(s => {
    const matchesFilter = filter === 'all' || s.status === filter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const inHostelCount = STUDENTS.filter(s => s.status === 'in-hostel' || s.status === 'in-room').length;
  const outCount = STUDENTS.filter(s => s.status === 'out').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📍 Location Tracker</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Real-time student location monitoring · Last updated: {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiveTracking(!liveTracking)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                liveTracking ? 'bg-green-600 text-white' : 'bg-white border text-gray-600'
              }`}
            >
              <Activity className="w-4 h-4" />
              {liveTracking ? 'Live Tracking ON' : 'Live Tracking OFF'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Students', value: STUDENTS.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'In Hostel', value: inHostelCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Outside', value: outCount, icon: Navigation, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Alerts', value: ALERTS.length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {ALERTS.length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Recent Alerts
            </h2>
            <div className="space-y-2">
              {ALERTS.map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    alert.type === 'success' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <span className="text-lg">
                    {alert.type === 'warning' ? '⚠️' : alert.type === 'success' ? '✅' : 'ℹ️'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{alert.msg}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map and Zones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h2 className="font-semibold text-gray-800 mb-4">Live Map View</h2>
              <SimpleMap students={STUDENTS} />
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h2 className="font-semibold text-gray-800 mb-4">Zone Occupancy</h2>
              <div className="space-y-3">
                {ZONES.map(zone => (
                  <ZoneCard key={zone.id} zone={zone} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-semibold text-gray-800">Student Locations</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by name or room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="in-room">In Room</option>
                  <option value="in-hostel">In Hostel</option>
                  <option value="out">Outside</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {filteredStudents.map(student => {
              const statusConfig = STATUS_CONFIG[student.status];
              return (
                <div key={student.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">Room {student.room}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">{student.location}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{student.lastSeen}</p>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStudents.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No students found matching your criteria</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
