import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoomView = () => {
  const [room, setRoom] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [userLocation, setUserLocation] = React.useState(null);
  const [distance, setDistance] = React.useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Simulated Hostel Location (e.g. Bangalore)
  const HOSTEL_LAT = 12.9716;
  const HOSTEL_LON = 77.5946;

  React.useEffect(() => {
    fetchRoom();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        // Simple Haversine approximation
        const d = Math.sqrt(Math.pow(latitude - HOSTEL_LAT, 2) + Math.pow(longitude - HOSTEL_LON, 2)) * 111;
        setDistance(d.toFixed(1));
      });
    }
  }, []);

  const fetchRoom = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/rooms');
      setRoom(res.data[0]); // Show the first room for demo
    } catch { console.error('Error fetching room'); }
    finally { setLoading(false); }
  };

  const handleBook = async () => {
    if (!token) { navigate('/'); return; }
    try {
      await axios.post('http://127.0.0.1:5000/api/rooms/book', { roomId: room._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Redirect to the Payment Gateway to finalize the choice
      navigate('/payment', { state: { autoOpenCheckout: true, amount: room.pricePerMonth } });
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading || !room) return <div className="bg-black text-white h-screen flex items-center justify-center">Loading 360° Environment...</div>;

  return (
    <div className="bg-background text-on-surface font-body selection:bg-secondary-fixed selection:text-on-secondary-fixed overflow-hidden min-h-screen">
      {/* Immersive Background Container */}
      <div className="fixed inset-0 z-0 bg-pan-overlay">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
      </div>
      
      {/* UI Overlay Layer */}
      <div className="relative z-10 h-screen w-full flex flex-col justify-between p-6 md:p-10">
        <header className="flex justify-between items-center w-full">
          <Link to="/dashboard" className="flex items-center gap-2 group bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 backdrop-blur-md px-4 py-2 rounded-full transition-all text-white border border-white/10">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-headline font-bold text-sm">Dashboard</span>
          </Link>
          <div className="flex gap-4">
             {distance && (
               <div className="flex items-center gap-2 bg-secondary-container/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                 <span className="material-symbols-outlined text-secondary-fixed text-sm">location_on</span>
                 <span className="text-white font-headline text-xs font-bold uppercase tracking-widest">{distance} KM AWAY</span>
               </div>
             )}
             <div className="flex items-center gap-3 bg-surface-container-lowest/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
               <span className="text-white font-headline text-xs font-bold tracking-widest uppercase">{room.isAvailable ? '360° ACTIVE PREVIEW' : 'BOOKED'}</span>
             </div>
          </div>
        </header>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="flex flex-col items-center gap-4 opacity-80">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-3xl">sync</span>
            </div>
            <p className="text-white font-headline font-semibold tracking-wide drop-shadow-md">Rotate to Look Around</p>
          </div>
        </div>

        <footer className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="bg-surface-container-lowest/80 backdrop-blur-2xl p-6 md:p-8 rounded-xl shadow-[0_20px_40px_rgba(26,27,35,0.06)] flex flex-col gap-4 max-w-sm w-full md:w-auto">
            <div className="flex flex-col gap-1">
              <span className="text-primary font-label text-[10px] font-bold tracking-[0.2em] uppercase">{room.type}</span>
              <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Room {room.roomNumber}</h1>
            </div>
            <div className="flex flex-wrap gap-2 py-2">
              {room.features.map(f => <FeatureBadge key={f} icon="check" label={f} />)}
            </div>
            <div className="pt-2 border-t border-outline-variant/20">
              <p className="text-on-surface-variant text-sm leading-relaxed font-body">
                Premium student residence with modern amenities. Occupants: {room.occupants.length}/{room.capacity}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 w-full md:w-auto">
            <div className="flex flex-col items-end px-6">
              <span className="text-white/80 font-label text-[11px] font-medium tracking-wider uppercase">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-5xl font-headline font-extrabold tracking-tighter">₹{room.pricePerMonth}</span>
                <span className="text-white/60 text-lg font-headline font-bold">/m</span>
              </div>
            </div>
            {room.isAvailable && (
              <button onClick={handleBook} className="bg-gradient-to-br from-primary to-primary-container text-white px-10 py-5 rounded-full font-headline font-bold text-lg shadow-xl hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-full md:w-auto justify-center group">
                Confirm Booking Online
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            )}
            {!room.isAvailable && <p className="text-white font-bold bg-error px-6 py-2 rounded-full">FULLY BOOKED</p>}
          </div>
        </footer>
      </div>


      <div className="fixed top-8 right-8 z-20 flex flex-col gap-4">
        <ControlButton icon="zoom_in" />
        <ControlButton icon="fullscreen" />
        <ControlButton icon="info" />
      </div>
    </div>
  );
};

const FeatureBadge = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-lg text-on-surface-variant">
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
    <span className="text-xs font-semibold">{label}</span>
  </div>
);

const ControlButton = ({ icon }) => (
  <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
    <span className="material-symbols-outlined">{icon}</span>
  </button>
);

export default RoomView;
