import React, { useState, useEffect, useRef } from 'react';

const Panorama360Viewer = ({ onClose }) => {
  const [currentView, setCurrentView] = useState('room');
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef(null);

  // Enhanced panorama views with better quality images
  const panoramaViews = {
    room: {
      title: 'Room Interior - 360° View',
      description: 'Spacious AC room with modern furnishings and study area',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=2000&q=80',
      hotspots: [
        { x: 20, y: 50, label: 'Study Desk & Chair', icon: '📚', info: 'Ergonomic study setup with lamp' },
        { x: 40, y: 45, label: 'Comfortable Bed', icon: '🛏️', info: 'Queen size bed with storage' },
        { x: 60, y: 55, label: 'Wardrobe', icon: '👔', info: 'Large wardrobe with mirror' },
        { x: 80, y: 50, label: 'Window View', icon: '🪟', info: 'Natural lighting & ventilation' }
      ]
    },
    washroom: {
      title: 'Attached Washroom - 360° View',
      description: 'Modern bathroom with 24/7 hot water and premium fittings',
      image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=2000&q=80',
      hotspots: [
        { x: 25, y: 55, label: 'Hot Shower', icon: '🚿', info: '24/7 hot water supply' },
        { x: 50, y: 45, label: 'Wash Basin', icon: '🚰', info: 'Premium fittings' },
        { x: 75, y: 50, label: 'Geyser', icon: '♨️', info: 'Instant hot water' }
      ]
    },
    terrace: {
      title: 'Terrace View - 360° Panorama',
      description: 'Shared terrace with city skyline and relaxation area',
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=2000&q=80',
      hotspots: [
        { x: 30, y: 40, label: 'Seating Area', icon: '🪑', info: 'Comfortable outdoor seating' },
        { x: 50, y: 30, label: 'City Skyline', icon: '🏙️', info: 'Panoramic city view' },
        { x: 70, y: 45, label: 'Garden Space', icon: '🌿', info: 'Green relaxation zone' }
      ]
    }
  };

  const currentPanorama = panoramaViews[currentView];

  // Auto-rotate effect
  useEffect(() => {
    if (autoRotate && !isDragging) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 0.1) % 360);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [autoRotate, isDragging]);

  // Handle drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setAutoRotate(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStart;
    setRotation(prev => (prev + delta * 0.3) % 360);
    setDragStart(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setAutoRotate(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - dragStart;
    setRotation(prev => (prev + delta * 0.3) % 360);
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-gradient-to-b from-slate-900/90 to-transparent absolute top-0 w-full z-10">
        <div>
          <h3 className="text-white font-headline font-black text-2xl tracking-tighter uppercase flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl animate-spin-slow">360</span>
            {currentPanorama.title}
          </h3>
          <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mt-1">
            {currentPanorama.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              autoRotate ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            {autoRotate ? '⏸ Pause' : '▶ Auto Rotate'}
          </button>
          <button 
            onClick={onClose} 
            className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* 360° Panorama Viewer */}
      <div 
        ref={containerRef}
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="absolute inset-0 w-[300%] h-full transition-transform duration-75 ease-out"
          style={{ 
            backgroundImage: `url(${currentPanorama.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat-x',
            transform: `translateX(${-rotation * 10}px)`
          }}
        >
          {/* Interactive Hotspots */}
          {currentPanorama.hotspots.map((hotspot, i) => (
            <div 
              key={i}
              className="absolute group"
              style={{ 
                left: `${hotspot.x}%`, 
                top: `${hotspot.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 animate-pulse cursor-help hover:scale-125 transition-all">
                  <span className="text-2xl">{hotspot.icon}</span>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 whitespace-nowrap">
                    <p className="font-black text-xs uppercase tracking-widest mb-1">{hotspot.label}</p>
                    <p className="text-[10px] text-slate-300">{hotspot.info}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
      </div>

      {/* Controls */}
      <div className="p-8 bg-slate-900 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="text-white/60 text-xs font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm mr-2 inline-block align-middle">swipe</span>
              Drag to explore • Click hotspots for details
            </div>
            <div className="text-white/40 text-xs font-mono">
              Rotation: {Math.round(rotation)}°
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            {Object.keys(panoramaViews).map(view => (
              <button 
                key={view}
                onClick={() => {
                  setCurrentView(view);
                  setRotation(0);
                }}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  currentView === view 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {view === 'room' ? 'bed' : view === 'washroom' ? 'shower' : 'deck'}
                </span>
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      ` }} />
    </div>
  );
};

export default Panorama360Viewer;
