import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const handleAISearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            // Simulated AI processing
            setTimeout(() => {
                setAiResults([
                    { id: 1, room: '501', type: 'Premium', status: 'Available', match: '98%' },
                    { id: 2, room: '405', type: 'Premium', status: 'Available', match: '85%' }
                ]);
                setIsSearching(false);
            }, 800);
        } catch (error) {
            console.error("Search error", error);
            setIsSearching(false);
        }
    };

    const bookedRooms = useMemo(() => {
        const booked = new Set();
        for (let i = 0; i < 20; i++) {
            const f = floors[Math.floor(Math.random() * floors.length)];
            const r = roomsPerFloor[Math.floor(Math.random() * roomsPerFloor.length)];
            booked.add(`${f}${r.toString().padStart(2, '0')}`);
        }
        return booked;
    }, []);

    const handleRoomClick = (room) => {
        if (bookedRooms.has(room)) { alert(`Room ${room} is already booked!`); return; }
        setSelectedRoom(room);
        setSelectedBeds(null);
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setSelectedRoom(null); setSelectedBeds(null); };

    const handleConfirmBooking = () => {
        if (!selectedBeds) { alert('Please select a bed option first.'); return; }
        
        const selectedBedDetails = bedOptions.find(b => b.count === selectedBeds);
        
        // Instant routing directly to the payment portal, injecting the selected room data!
        navigate('/payment', { 
            state: { 
                autoOpenCheckout: true, 
                amount: selectedBedDetails.price,
                roomNumber: selectedRoom,
                beds: selectedBeds
            } 
        });
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
                                
                                <h4 className="font-headline font-black text-2xl tracking-tight text-slate-900 mb-8">Configure Setup</h4>
                                
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
                                    className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20"
                                    onClick={handleConfirmBooking}
                                >
                                    Proceed to Gateway
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .animate-spin-slow { animation: spin 8s linear infinite; }
            ` }} />
        </div>
    );
};

export default RoomBooking;
