import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  Info, 
  ChevronRight, 
  ArrowRight, 
  Maximize, 
  Box, 
  Scan, 
  Compass, 
  Wifi, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ARMarker = ({ x, y, label, type, description, icon: Icon }) => (
  <motion.div 
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    style={{ left: `${x}%`, top: `${y}%` }}
    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
  >
    <div className="relative group cursor-pointer">
      {/* Pulsing Aura */}
      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150" />
      
      {/* Marker Handle */}
      <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border-2 border-white rounded-full flex items-center justify-center text-white shadow-2xl transition-all group-hover:scale-110">
        <Icon className="w-6 h-6" />
      </div>

      {/* Label Card */}
      <div className="absolute left-1/2 -bottom-2 translate-y-full -translate-x-1/2 w-48 bg-black/60 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 transition-all opacity-0 group-hover:opacity-100 pointer-events-none origin-top scale-90 group-hover:scale-100">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{type}</p>
        <h3 className="text-white font-bold mb-1">{label}</h3>
        <p className="text-[10px] text-white/70 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  </motion.div>
);

const ARTour = () => {
  const [view, setView] = useState('camera'); // 'camera' | '360'
  const [scanning, setScanning] = useState(true);
  const [roomDetails, setRoomDetails] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const markers = [
    { x: 30, y: 40, label: 'Standard Room', type: 'Living Space', description: 'Cozy twin-sharing rooms with premium wooden furniture and storage.', icon: Box },
    { x: 70, y: 55, label: 'Kitchenette', type: 'Dining', description: 'Modern common kitchen area with microwave and basic supplies.', icon: Info },
    { x: 50, y: 25, label: 'Wi-Fi Hub', type: 'Connectivity', description: 'High-speed 1Gbps fiber connectivity throughout the floor.', icon: Wifi },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-body overflow-hidden">
      {/* AR HUD Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Header HUD */}
        <div className="p-8 flex justify-between items-start pointer-events-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                {scanning ? 'Initializing AR Core...' : 'System Calibrated'}
              </p>
            </div>
            <h1 className="text-3xl font-headline font-black tracking-tight">Virtual Tour</h1>
          </div>

          <div className="flex gap-4">
            <button className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center gap-2 hover:bg-white/20 transition-all">
              <Compass className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest hidden md:block">North Side</span>
            </button>
            <button className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center gap-2 hover:bg-white/20 transition-all">
               <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanning Animation */}
        <AnimatePresence>
          {scanning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none"
            >
              <div className="relative">
                <Scan className="w-32 h-32 text-white/20 animate-pulse" />
                <motion.div 
                   animate={{ y: [-40, 40, -40] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1]" 
                />
                <p className="text-center mt-6 text-sm font-bold tracking-[0.2em] uppercase text-white/60 font-headline">Scanning Environment...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Sidebar */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 space-y-4 pointer-events-auto">
           {['Lobby', 'Room 101', 'Dining Area', 'Laundry Room'].map((loc, idx) => (
             <button 
               key={loc}
               onClick={() => setCurrentStep(idx)}
               className={`w-40 flex items-center justify-between p-4 rounded-2xl border transition-all text-sm font-bold ${currentStep === idx ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
             >
               {loc}
               {currentStep === idx && <ArrowRight className="w-4 h-4 ml-2" />}
             </button>
           ))}
        </div>

        {/* AR Elements (Only shown if not scanning) */}
        {!scanning && (
          <div className="absolute inset-0 pointer-events-auto">
            {markers.map((m, i) => (
              <ARMarker key={i} {...m} />
            ))}

            {/* Directional Waypoint */}
            <motion.div 
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ left: '85%', top: '50%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 cursor-pointer"
            >
               <div className="w-20 h-20 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center animate-spin-slow">
                 <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center">
                    <ChevronRight className="w-8 h-8" />
                 </div>
               </div>
               <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Next: Common Hall</p>
            </motion.div>
          </div>
        )}

        {/* Bottom Panel */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl p-8 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row gap-8 pointer-events-auto items-center">
           <div className="flex-1 space-y-4">
              <div className="flex gap-4">
                 <button 
                   onClick={() => setView('camera')}
                   className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === 'camera' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                 >
                   Live AR Mode
                 </button>
                 <button 
                   onClick={() => setView('360')}
                   className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === '360' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                 >
                   360° Panorama
                 </button>
              </div>
              <div>
                <h3 className="text-xl font-bold font-headline">Floor 1: Main Wing</h3>
                <p className="text-white/60 text-sm mt-1">Move your phone to explore different sections of the hostel. Click markers for details.</p>
              </div>
           </div>
           
           <div className="flex gap-4 items-center shrink-0">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-4">
                 <div className="text-center">
                   <p className="text-[10px] text-white/40 uppercase font-black">Accuracy</p>
                   <p className="text-emerald-400 font-bold">98%</p>
                 </div>
                 <div className="w-px h-8 bg-white/10" />
                 <div className="text-center">
                   <p className="text-[10px] text-white/40 uppercase font-black">Sensors</p>
                   <p className="text-white font-bold uppercase text-[10px]">Active</p>
                 </div>
              </div>
              <button className="bg-white text-black px-8 py-5 rounded-3xl font-black text-sm hover:bg-indigo-50 transition-all uppercase tracking-tighter shadow-2xl">
                Join Now
              </button>
           </div>
        </div>
      </div>

      {/* Background Layer: Camera or 360 View */}
      <div className="absolute inset-0 z-0">
        {view === 'camera' ? (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <Webcam 
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover scale-x-[-1] opacity-70"
              videoConstraints={{ facingMode: "environment" }}
            />
            {/* Simulated Depth Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden relative grayscale-[0.3]">
            {/* Simplified 360 viewer - using an image that will fill the space */}
            <img 
              src="https://images.unsplash.com/photo-1555854817-5b2738a77ed5?q=80&w=2070&auto=format&fit=crop" 
              className="w-[200%] h-full object-cover max-w-none animate-custom-scroll" 
              alt="360 View"
            />
             <div className="absolute inset-0 bg-black/40" />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        @keyframes custom-scroll {
          0% { transform: translateX(0); }
          50% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-custom-scroll {
          animation: custom-scroll 30s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default ARTour;
