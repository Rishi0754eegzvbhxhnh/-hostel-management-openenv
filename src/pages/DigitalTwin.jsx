import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Text, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Activity, Zap, Users, AlertCircle, Maximize2, RotateCcw } from 'lucide-react';

const BuildingBlock = ({ position, color, height, status, label, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[1.5, height, 1.5]} />
        <meshStandardMaterial 
          color={hovered ? '#4f46e5' : color} 
          emissive={hovered ? '#4f46e5' : color} 
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent 
          opacity={0.9} 
        />
      </mesh>
      {/* Glow Effect */}
      {status === 'alert' && (
        <mesh position={[0, height + 0.2, 0]}>
           <sphereGeometry args={[0.2, 16, 16]} />
           <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

const DigitalTwin = () => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [stats, setStats] = useState({
    occupancy: 84,
    energy: 12.4,
    complaints: 3,
    temp: 24,
    humidity: 45
  });
  const [infraData, setInfraData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/ai/context');
        const data = res.data;
        setStats({
          occupancy: Math.round((data.rooms.total - data.rooms.available) / data.rooms.total * 100) || 84,
          energy: data.infrastructure?.energy || 12.4,
          complaints: data.stats.pendingComplaints,
          temp: 24,
          humidity: 45
        });
        setInfraData(data.infrastructure?.blocks);
      } catch (err) { console.error('Twin stats error'); }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const hostelBlocks = [
    { id: 'A', name: 'Block A (Boys)', pos: [-3, 0, -2], color: '#3b82f6', height: 4, status: 'ok', occupancy: 92, energy: 4.5 },
    { id: 'B', name: 'Block B (Girls)', pos: [3, 0, -2], color: '#ec4899', height: 4, status: 'ok', occupancy: 88, energy: 3.8 },
    { id: 'C', name: 'Mess Hall', pos: [0, 0, 2], color: '#f59e0b', height: 2, status: 'alert', occupancy: 45, energy: 2.1 },
    { id: 'D', name: 'Admin/Laundry', pos: [0, 0, -5], color: '#10b981', height: 3, status: 'ok', occupancy: 12, energy: 5.6 },
  ].map(b => {
    const live = infraData?.find(d => d.block === b.id);
    if (live) return { ...b, energy: live.usage, status: live.status === 'peak' ? 'alert' : 'ok' };
    return b;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body selection:bg-indigo-500/30 overflow-hidden">
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
        <header className="flex justify-between items-start pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-tighter text-sm uppercase">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Live Infrastructure Twin
            </div>
            <h1 className="text-4xl font-headline font-black tracking-tight">Digital Twin Panel</h1>
          </motion.div>

          <div className="flex gap-4">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex gap-6">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Energy Usage</p>
                <div className="flex items-center gap-1 justify-center">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <p className="text-xl font-headline font-bold">{stats.energy} <span className="text-xs text-slate-500 font-normal">kWh</span></p>
                </div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupancy</p>
                <div className="flex items-center gap-1 justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                  <p className="text-xl font-headline font-bold">{stats.occupancy}%</p>
                </div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complaints</p>
                <div className="flex items-center gap-1 justify-center">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-xl font-headline font-bold">{stats.complaints}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <footer className="flex justify-between items-end pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-80">
            <AnimatePresence mode='wait'>
              {selectedBlock ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{selectedBlock.name}</h3>
                      <p className="text-xs text-slate-400">Real-time Telemetry</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedBlock.status === 'ok' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500 animate-pulse'}`}>
                      {selectedBlock.status === 'ok' ? 'Online' : 'Attention Req.'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Occupancy</span>
                        <span>{selectedBlock.occupancy}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedBlock.occupancy}%` }}
                          className="h-full bg-indigo-500" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Temp</p>
                        <p className="text-lg font-bold">22°C</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Humidity</p>
                        <p className="text-lg font-bold">48%</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBlock(null)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition-all"
                  >
                    Reset View
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">Select a building block to view live analytics and sensor data.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-2">
            <button className="w-12 h-12 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all">
              <Maximize2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-12 h-12 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={40} />
          <color attach="background" args={['#020617']} />
          <fog attach="fog" args={['#020617', 15, 25]} />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <spotLight position={[-10, 10, 5]} angle={0.15} penumbra={1} intensity={0.8} />

          <Suspense fallback={null}>
            <group position={[0, -2, 0]}>
              {/* Floor/Grid */}
              <gridHelper args={[20, 20, '#1e293b', '#0f172a']} />
              <ContactShadows opacity={0.4} scale={20} blur={24} far={10} resolution={256} color="#000000" />
              
              {/* Buildings */}
              {hostelBlocks.map(block => (
                <BuildingBlock 
                  key={block.id}
                  position={block.pos}
                  color={block.color}
                  height={block.height}
                  status={block.status}
                  label={block.name}
                  onClick={() => setSelectedBlock(block)}
                />
              ))}

              {/* Decorative Elements */}
              <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh position={[5, 1, 5]}>
                   <torusKnotGeometry args={[0.5, 0.1, 64, 8]} />
                   <MeshDistortMaterial color="#4f46e5" speed={5} distort={0.3} />
                </mesh>
              </Float>
            </group>
          </Suspense>

          <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={8} 
            maxDistance={20}
            autoRotate={!selectedBlock}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
      `}} />
    </div>
  );
};

export default DigitalTwin;
