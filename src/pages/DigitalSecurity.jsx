import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Shield, Lock, Unlock, QrCode, Scan, ShieldAlert, History, Activity, Zap, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SecurityMetric = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-6 hover:shadow-xl transition-all group">
     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-indigo-100`}>
        <Icon className="w-8 h-8" />
     </div>
     <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-headline font-black text-slate-900">{value}</p>
     </div>
  </div>
);

const SecurityLogItem = ({ name, type, time, status }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all">
     <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'authorized' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
           {status === 'authorized' ? <UserCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div>
           <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">{name}</p>
           <p className="text-[10px] text-slate-400 font-bold uppercase">{type} · {time}</p>
        </div>
     </div>
     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${status === 'authorized' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
        {status}
     </span>
  </div>
);

const DigitalSecurity = () => {
  const [method, setMethod] = useState('face'); // 'face' or 'qr'
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // 'success', 'warning', 'error'
  const webcamRef = useRef(null);

  const [logs, setLogs] = useState([
    { name: 'Aditya Raj', type: 'Main Entrance Entry', time: '10:42 AM', status: 'authorized' },
    { name: 'Unknown Target', type: 'Unlicensed Access Try', time: '09:12 AM', status: 'unauthorized' },
    { name: 'Sameer Khan', type: 'Block B Exit', time: '08:50 AM', status: 'authorized' }
  ]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanStatus('success');
      setTimeout(() => setScanStatus(null), 3000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-body text-slate-950 pb-20 pt-20">
      
      {/* Header HERO */}
      <section className="bg-slate-950 text-white pt-32 pb-48 px-8 relative overflow-hidden">
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 to-transparent z-10" />
         <div className="absolute inset-0 z-0 opacity-15">
            <Shield className="absolute -right-20 -bottom-20 w-[400px] h-[400px] text-red-500 animate-pulse" />
         </div>
         
         <div className="max-w-6xl mx-auto relative z-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-5 h-5 text-red-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400">Hostel Neural Fortress Active</p>
               </div>
               <h1 className="text-6xl md:text-9xl font-headline font-black tracking-tighter leading-[0.85] uppercase text-white mb-8">Digital <br /> <span className="text-red-500">Defense</span></h1>
               <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed italic">"AI-powered facial recognition and QR-protocol attendance system for seamless security across the hostel habitat."</p>
            </motion.div>
         </div>
      </section>

      {/* Main SECURITY Console */}
      <main className="max-w-7xl mx-auto px-6 -mt-24 relative z-30">
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            
            {/* Left: Terminal Hub / Metrics */}
            <div className="lg:col-span-8 flex flex-col gap-8">
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <SecurityMetric icon={History} label="Active Users" value="482" color="bg-indigo-50 text-indigo-600" />
                  <SecurityMetric icon={ShieldAlert} label="Alerts Flagged" value="12" color="bg-rose-50 text-rose-600" />
                  <SecurityMetric icon={Zap} label="Neural Pulse" value="Live" color="bg-emerald-50 text-emerald-600" />
               </div>

               {/* AI Scanner HUD */}
               <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-indigo-900/10 border border-slate-100 flex flex-col lg:flex-row gap-12 relative overflow-hidden">
                  <div className="shrink-0 w-full lg:w-[400px] aspect-video bg-slate-950 rounded-[2.5rem] relative overflow-hidden group border border-white/10 shadow-2xl">
                     <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 pointer-events-none" />
                     
                     <AnimatePresence>
                        {scanning && (
                           <motion.div initial={{ y: -100 }} animate={{ y: 200 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="absolute inset-x-0 h-1 bg-red-500 shadow-[0_0_15px_red] z-20" />
                        )}
                        {scanStatus === 'success' && (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm z-30 flex items-center justify-center">
                              <UserCheck className="w-16 h-16 text-emerald-500 animate-bounce" />
                           </motion.div>
                        )}
                     </AnimatePresence>

                     <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                           <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                           <span className="text-[9px] font-black uppercase text-white tracking-widest">Live: Neural Scanner 01</span>
                        </div>
                     </div>

                     {/* Mock Face Landmarks Overlay */}
                     <div className="absolute inset-0 z-10 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-48 h-64 border-2 border-dashed border-white rounded-[4rem]" />
                     </div>

                     <Webcam 
                       audio={false}
                       ref={webcamRef}
                       screenshotFormat="image/webp"
                       className="w-full h-full object-cover"
                     />
                  </div>

                  <div className="flex-1 space-y-8">
                     <div className="flex gap-4">
                        <button 
                           onClick={() => setMethod('face')}
                           className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${method === 'face' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                           Face Recognition
                        </button>
                        <button 
                           onClick={() => setMethod('qr')}
                           className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${method === 'qr' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                           QR Entry Pass
                        </button>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-3xl font-headline font-black uppercase tracking-tighter text-slate-900">Protocol Initiation</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Position your neural pattern (Face) in the quadrant or prepare your QR pass for authorized access validation.</p>
                     </div>

                     <button 
                       onClick={handleScan}
                       disabled={scanning}
                       className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-950 transition-all shadow-2xl shadow-red-900/10 flex items-center justify-center gap-2"
                     >
                        {scanning ? 'Analyzing Bio-Signature...' : <><Scan className="w-5 h-5" /> Execute Digital Scan</>}
                     </button>
                  </div>
               </div>
            </div>

            {/* Right: Security Matrix Logs */}
            <div className="lg:col-span-4 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight flex items-center gap-2">
                     <Activity className="w-6 h-6 text-indigo-500" /> Access Logs
                  </h3>
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
               </div>

               <div className="space-y-3">
                  {logs.map((log, i) => (
                    <SecurityLogItem key={i} {...log} />
                  ))}
               </div>

               <div className="mt-12 bg-rose-50 rounded-[2rem] p-6 border border-rose-100/50">
                  <div className="flex items-center gap-2 mb-4">
                     <AlertTriangle className="w-5 h-5 text-rose-600" />
                     <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest">Unauthorized Access Detected</p>
                  </div>
                  <p className="text-rose-900/70 text-[11px] font-bold leading-relaxed italic uppercase">"Unknown target attempted entry at 09:12 AM via Main Lab Gate. Visual log captured and archived for Admin review."</p>
                  <button className="mt-6 w-full py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">
                     View Alert Imagery
                  </button>
               </div>
            </div>

         </div>

         {/* QR Entry Pass Interface (Simulated Mobile Overlay) */}
         <AnimatePresence>
            {method === 'qr' && (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-16 bg-slate-950 rounded-[3.5rem] p-16 text-white text-center flex flex-col items-center gap-12 border border-white/10 relative overflow-hidden">
                  <div className="absolute -top-20 -left-20 w-80 h-80 bg-red-500 opacity-10 blur-[100px]" />
                  <div className="relative z-10 space-y-4">
                     <h3 className="text-4xl font-headline font-black uppercase tracking-tighter leading-none">Your Strategic <br /> Entry Pass</h3>
                     <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Authorized for Block B, Mess, and Gym</p>
                  </div>
                  <div className="relative p-6 bg-white rounded-[2rem] shadow-2xl shadow-indigo-500/50 group">
                     <QrCode className="w-48 h-48 text-slate-950 group-hover:scale-105 transition-transform" />
                  </div>
                  <button className="px-10 py-5 border-2 border-dashed border-white/20 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all">
                     Refresh Neural Pass Code: 124-ALPHA
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
      `}} />

    </div>
  );
};

export default DigitalSecurity;
