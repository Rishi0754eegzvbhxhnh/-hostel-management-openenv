import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Panorama360Viewer from '../components/Panorama360Viewer';
import './RoomBooking.css';

// Floor 5 to 1 (top to bottom)
const floors = [5, 4, 3, 2, 1];
const roomsPerFloor = Array.from({ length: 15 }, (_, i) => i + 1);

const bedOptions = [
    { count: 1, label: 'Single', icon: '🛏️', price: 8500 },
    { count: 2, label: 'Double', icon: '🛏️🛏️', price: 6500 },
    { count: 3, label: 'Triple', icon: '🛏️×3', price: 5000 },
    { count: 4, label: 'Quad', icon: '🛏️×4', price: 4200 },
    { count: 5, label: 'Five-Bed', icon: '🛏️×5', price: 3500 }
];

const RoomBooking = () => {
    const navigate = useNavigate();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBeds, setSelectedBeds] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [aiResults, setAiResults] = useState([]);
    const [show360View, setShow360View] = useState(false);
    const [current360View, setCurrent360View] = useState('room');
    const [panoramaRotation, setPanoramaRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);

    const [rooms, setRooms] = useState([]);
    const [bookedRooms, setBookedRooms] = useState(new Set());
    
    // Enhanced Filters
    const [filters, setFilters] = useState({
        roomType: 'all', // all, single, shared, suite
        priceRange: 'all', // all, budget, standard, premium
        floor: 'all', // all, 1, 2, 3, 4, 5
        amenities: [], // AC, WiFi, Attached Bathroom, Balcony
        availability: 'available' // all, available, occupied
    });

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/rooms');
                const data = await res.json();
                setRooms(data);
                const booked = new Set(data.filter(r => !r.isAvailable).map(r => r.roomNumber));
                setBookedRooms(booked);
            } catch (err) {
                console.error("Room fetch error", err);
            }
        };
        fetchRooms();
    }, []);

    const handleAISearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch('http://localhost:5000/api/rooms/ai-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery }),
            });
            const data = await res.json();
            if (data.success) {
                setAiResults(data.matches.map((m, i) => ({ 
                    id: i, 
                    room: m.roomNumber, 
                    type: m.type, 
                    status: 'Available', 
                    match: `${m.matchPercentage}%` 
                })));
            }
            setIsSearching(false);
        } catch (error) {
            console.error("Search error", error);
            setIsSearching(false);
        }
    };

    const handleRoomClick = (room) => {
        if (bookedRooms.has(room)) { alert(`Room ${room} is already booked!`); return; }
        setSelectedRoom(room);
        setSelectedBeds(null);
        setIsModalOpen(true);
    };

    const closeModal = () => { 
        setIsModalOpen(false); 
        setSelectedRoom(null); 
        setSelectedBeds(null); 
        setShow360View(false);
        setCurrent360View('room');
        setPanoramaRotation(0);
    };

    // 360 View Data
    const panoramaViews = {
        room: {
            title: 'Room Interior',
            description: 'Spacious room with modern furnishings',
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
            hotspots: [
                { x: 30, y: 50, label: 'Study Desk', icon: '📚' },
                { x: 70, y: 45, label: 'Wardrobe', icon: '👔' },
                { x: 50, y: 60, label: 'Bed', icon: '🛏️' }
            ]
        },
        washroom: {
            title: 'Attached Washroom',
            description: 'Modern bathroom with 24/7 hot water',
            image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200',
            hotspots: [
                { x: 40, y: 55, label: 'Shower', icon: '🚿' },
                { x: 60, y: 50, label: 'Mirror', icon: '🪞' },
                { x: 50, y: 70, label: 'Geyser', icon: '♨️' }
            ]
        },
        terrace: {
            title: 'Terrace View',
            description: 'Shared terrace with city skyline',
            image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
            hotspots: [
                { x: 35, y: 40, label: 'Seating Area', icon: '🪑' },
                { x: 65, y: 35, label: 'Garden', icon: '🌿' },
                { x: 50, y: 25, label: 'City View', icon: '🏙️' }
            ]
        }
    };

    // Handle panorama drag
    const handlePanoramaMouseDown = (e) => {
        setIsDragging(true);
        setDragStart(e.clientX);
    };

    const handlePanoramaMouseMove = (e) => {
        if (!isDragging) return;
        const delta = e.clientX - dragStart;
        setPanoramaRotation(prev => (prev + delta * 0.5) % 360);
        setDragStart(e.clientX);
    };

    const handlePanoramaMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handlePanoramaMouseMove);
            document.addEventListener('mouseup', handlePanoramaMouseUp);
            return () => {
                document.removeEventListener('mousemove', handlePanoramaMouseMove);
                document.removeEventListener('mouseup', handlePanoramaMouseUp);
            };
        }
    }, [isDragging, dragStart]);

    const handleConfirmBooking = async () => {
        if (!selectedBeds) { alert('Please select a bed option first.'); return; }
        
        const token = localStorage.getItem('token');
        if (!token) { alert('Please login to book a room'); navigate('/login'); return; }

        setIsSearching(true); // Reuse loading state
        try {
            const res = await fetch('http://localhost:5000/api/rooms/book', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roomNumber: selectedRoom }),
            });
            const data = await res.json();
            
            if (data.success) {
                const selectedBedDetails = bedOptions.find(b => b.count === selectedBeds);
                navigate('/payment', { 
                    state: { 
                        autoOpenCheckout: true, 
                        amount: selectedBedDetails.price,
                        roomNumber: selectedRoom,
                        beds: selectedBeds
                    } 
                });
            } else {
                alert(data.message || 'Booking failed');
            }
        } catch (err) {
            console.error('Booking confirmation failed', err);
            alert('Server unreachable. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="room-booking-container bg-[#fbf8ff] min-h-screen p-8 pt-24 font-body">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <span className="font-label text-[10px] font-black tracking-[0.3em] uppercase text-indigo-600 mb-2 block">Interactive Map</span>
                        <h2 className="text-4xl font-headline font-black tracking-tighter text-slate-900 uppercase">Live Floor Plan</h2>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-lg border border-slate-100 w-full max-w-md">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <span className="material-symbols-outlined text-xl">auto_awesome</span>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Find a vacant AC room on top floor..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                            className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-slate-900 placeholder:text-slate-300"
                        />
                        <button onClick={handleAISearch} disabled={isSearching} className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                            {isSearching ? "..." : "Search"}
                        </button>
                    </div>
                </div>

                {aiResults.length > 0 && (
                    <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-600 animate-pulse">radar</span> 
                            AI Found {aiResults.length} Matches
                        </h3>
                        <div className="flex gap-4">
                            {aiResults.map((res) => (
                                <div key={res.id} className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-indigo-100 flex items-center gap-6 cursor-pointer hover:border-indigo-400 transition-colors" onClick={() => handleRoomClick(res.room)}>
                                    <div>
                                        <p className="font-headline font-black text-xl text-slate-900">Room {res.room}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{res.type}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-black">
                                        {res.match}
                                    </div>
                                </div>
                            ))}
                            <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 ml-4" onClick={() => setAiResults([])}>Clear</button>
                        </div>
                    </div>
                )}

                {/* Enhanced Filters */}
                <div className="mb-8 bg-white rounded-[2rem] shadow-lg border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-600">tune</span>
                            Advanced Filters
                        </h3>
                        <button 
                            onClick={() => setFilters({ roomType: 'all', priceRange: 'all', floor: 'all', amenities: [], availability: 'available' })}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            Reset All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Room Type Filter */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Room Type</label>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'single', 'shared', 'suite'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilters(prev => ({ ...prev, roomType: type }))}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            filters.roomType === type
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Price Range</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'all', label: 'All' },
                                    { value: 'budget', label: '< ₹5K' },
                                    { value: 'standard', label: '₹5-7K' },
                                    { value: 'premium', label: '> ₹7K' }
                                ].map(price => (
                                    <button
                                        key={price.value}
                                        onClick={() => setFilters(prev => ({ ...prev, priceRange: price.value }))}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            filters.priceRange === price.value
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {price.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Floor Filter */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Floor</label>
                            <div className="flex flex-wrap gap-2">
                                {['all', '5', '4', '3', '2', '1'].map(floor => (
                                    <button
                                        key={floor}
                                        onClick={() => setFilters(prev => ({ ...prev, floor }))}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            filters.floor === floor
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {floor === 'all' ? 'All' : `F${floor}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amenities Filter */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Amenities</label>
                            <div className="flex flex-wrap gap-2">
                                {['AC', 'WiFi', 'Balcony'].map(amenity => (
                                    <button
                                        key={amenity}
                                        onClick={() => {
                                            setFilters(prev => ({
                                                ...prev,
                                                amenities: prev.amenities.includes(amenity)
                                                    ? prev.amenities.filter(a => a !== amenity)
                                                    : [...prev.amenities, amenity]
                                            }));
                                        }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            filters.amenities.includes(amenity)
                                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filter Summary */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <span className="material-symbols-outlined text-sm">info</span>
                            Showing: {rooms.filter(r => {
                                // Apply filters
                                if (filters.availability === 'available' && !r.isAvailable) return false;
                                if (filters.roomType !== 'all' && r.type !== filters.roomType) return false;
                                if (filters.floor !== 'all' && !r.roomNumber.startsWith(filters.floor)) return false;
                                if (filters.priceRange === 'budget' && r.pricePerMonth >= 5000) return false;
                                if (filters.priceRange === 'standard' && (r.pricePerMonth < 5000 || r.pricePerMonth >= 7000)) return false;
                                if (filters.priceRange === 'premium' && r.pricePerMonth < 7000) return false;
                                if (filters.amenities.length > 0) {
                                    const hasAllAmenities = filters.amenities.every(amenity => 
                                        r.features?.some(f => f.includes(amenity))
                                    );
                                    if (!hasAllAmenities) return false;
                                }
                                return true;
                            }).length} rooms
                        </div>
                        <div className="flex gap-2">
                            {filters.roomType !== 'all' && (
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase">
                                    {filters.roomType}
                                </span>
                            )}
                            {filters.priceRange !== 'all' && (
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">
                                    {filters.priceRange}
                                </span>
                            )}
                            {filters.floor !== 'all' && (
                                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase">
                                    Floor {filters.floor}
                                </span>
                            )}
                            {filters.amenities.map(amenity => (
                                <span key={amenity} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase">
                                    {amenity}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 mb-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-indigo-600 shadow-lg shadow-indigo-600/30"></div> Premium AC (Flr 4-5)</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-white border-2 border-slate-200"></div> Standard (Flr 1-3)</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-slate-800"></div> Booked Matrix</div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 overflow-x-auto">
                    <table className="w-full border-separate border-spacing-2">
                        <tbody>
                            {floors.map((floor) => (
                                <tr key={floor}>
                                    <td className="pr-6 font-headline font-black text-xl text-slate-300 w-20">F{floor}</td>
                                    {roomsPerFloor.map((col) => {
                                        const roomId = `${floor}${col.toString().padStart(2, '0')}`;
                                        const isBooked = bookedRooms.has(roomId);
                                        const isPremium = floor >= 4;
                                        return (
                                            <td key={roomId}>
                                                <div
                                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                                                        isBooked ? 'bg-slate-900 text-slate-500 scale-95 opacity-50 cursor-not-allowed' : 
                                                        isPremium ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-110 hover:-translate-y-1' : 
                                                        'bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-110 hover:-translate-y-1'
                                                    }`}
                                                    onClick={() => handleRoomClick(roomId)}
                                                    title={isBooked ? 'Booked' : `Room ${roomId}`}
                                                >
                                                    {roomId}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 360 Checkout Modal */}
                {isModalOpen && selectedRoom && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
                            {/* Visual Left Side */}
                            <div className="w-full md:w-1/2 relative bg-slate-900 h-64 md:h-auto">
                                <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover opacity-60" />
                                <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm animate-spin-slow">360</span>
                                    Live Matrix Overview
                                </div>
                                <div className="absolute bottom-10 left-10">
                                    <h3 className="text-white text-6xl font-headline font-black tracking-tighter shadow-2xl drop-shadow-2xl">{selectedRoom}</h3>
                                    <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs mt-2">Premium Selected Block</p>
                                </div>
                            </div>

                            {/* Logic Right Side */}
                            <div className="w-full md:w-1/2 p-10 bg-white relative">
                                <button className="absolute top-8 right-8 w-10 h-10 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full flex items-center justify-center transition-colors" onClick={closeModal}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                                
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="font-headline font-black text-2xl tracking-tight text-slate-900">Configure Setup</h4>
                                    <button 
                                        onClick={() => setShow360View(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">360</span>
                                        Virtual Tour
                                    </button>
                                </div>
                                
                                <div className="space-y-4 mb-10">
                                    {bedOptions.map(opt => (
                                        <button
                                            key={opt.count}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                                selectedBeds === opt.count ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-600/10' : 'border-slate-100 hover:border-slate-300 bg-white'
                                            }`}
                                            onClick={() => setSelectedBeds(opt.count)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex flex-wrap items-center justify-center text-lg ${selectedBeds === opt.count ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}>
                                                    {opt.icon}
                                                </div>
                                                <div className="text-left">
                                                    <p className={`font-black uppercase tracking-widest text-xs ${selectedBeds === opt.count ? 'text-indigo-900' : 'text-slate-900'}`}>{opt.label} Allocation</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Capacity: {opt.count} user(s)</p>
                                                </div>
                                            </div>
                                            <p className={`font-headline font-black text-xl ${selectedBeds === opt.count ? 'text-indigo-600' : 'text-slate-400'}`}>₹{opt.price}</p>
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    className={`w-full py-5 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl ${
                                        selectedBeds ? 'bg-slate-900 hover:bg-indigo-600 shadow-slate-900/20' : 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none'
                                    }`}
                                    onClick={handleConfirmBooking}
                                    disabled={!selectedBeds}
                                >
                                    {isSearching ? "Verifying Matrix..." : "Proceed to Gateway"}
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Enhanced 360° Viewer */}
                        {show360View && (
                            <Panorama360Viewer onClose={() => setShow360View(false)} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomBooking;
