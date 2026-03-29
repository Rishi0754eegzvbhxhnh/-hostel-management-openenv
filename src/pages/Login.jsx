import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND = 'http://localhost:5000';

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('student'); // 'student' | 'admin'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'admin' ? '/api/auth/admin/login' : '/api/auth/login';
      const response = await axios.post(`${BACKEND}${endpoint}`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setLoading(false);
      navigate(mode === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setLoading(false);
      if (err.code === 'ERR_NETWORK') {
        setError('Backend server is down. Ensure nodeserver is running.');
      } else {
        const msg = err.response?.data?.message || 'Invalid email or password';
        const technical = err.response?.data?.error ? ` (${err.response.data.error})` : '';
        setError(`${msg}${technical}`);
      }
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-[#fbf8ff]/90 backdrop-blur-xl shadow-[0_20px_40px_rgba(26,27,35,0.06)]">
        <div className="flex justify-between items-center px-6 py-5 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 editorial-gradient rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tighter text-primary font-headline">Hostel Intelligence</h1>
          </div>
          <div className="hidden md:flex gap-8">
            <Link className="text-primary font-bold border-b-2 border-primary font-headline" to="/">Sign In</Link>
            <Link className="text-on-surface-variant font-headline hover:text-primary transition-colors" to="/signup">Sign Up</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl shadow-[0_40px_80px_rgba(26,27,35,0.12)] bg-surface-container-lowest">

          {/* Branding Side */}
          <div className="hidden lg:flex flex-col justify-between p-12 editorial-gradient text-white relative overflow-hidden">
            <div className="relative z-10">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-secondary-fixed opacity-80">
                {mode === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </span>
              <h2 className="text-5xl font-headline font-extrabold tracking-tighter mt-6 leading-tight">
                {mode === 'admin' ? <>Manage your<br />hostel with<br />full control.</> : <>Curate your<br />stay with<br />elegance.</>}
              </h2>
            </div>
            <div className="relative z-10 flex flex-col gap-4">
              {mode === 'admin' ? (
                <>
                  <Feature icon="groups" text="Monitor all student activity" />
                  <Feature icon="payments" text="Track fees & outstanding balances" />
                  <Feature icon="build" text="Manage maintenance requests" />
                  <Feature icon="report" text="Handle student complaints" />
                </>
              ) : (
                <>
                  <Feature icon="analytics" text="Real-time occupancy & food analytics" />
                  <Feature icon="bed" text="Visual room management" />
                  <Feature icon="calendar_month" text="Vacation date planning" />
                </>
              )}
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-[32px] border-white/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          </div>

          {/* Form Side */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-surface-container-low p-1 mb-8 gap-1">
              <button
                onClick={() => { setMode('student'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'student' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
              >
                <span className="material-symbols-outlined text-sm mr-1 align-middle">school</span>Student
              </button>
              <button
                onClick={() => { setMode('admin'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'admin' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}
              >
                <span className="material-symbols-outlined text-sm mr-1 align-middle">admin_panel_settings</span>Admin
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-3xl font-headline font-bold text-primary mb-2">
                {mode === 'admin' ? 'Admin Access' : 'Welcome back'}
              </h3>
              <p className="text-on-surface-variant text-sm">
                {mode === 'admin' ? 'Sign in to the hostel management console' : 'Access your student dashboard'}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-error/10 text-error p-3 rounded-lg text-sm font-medium animate-in fade-in">
                  {error}
                </div>
              )}
              <div>
                <label className="block font-label text-xs font-bold uppercase tracking-wider text-outline mb-2">Email</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 text-on-surface custom-input transition-all placeholder:text-outline-variant focus:outline-none"
                  id="email" placeholder={mode === 'admin' ? 'admin@hostel.edu' : 'student@university.edu'}
                  type="email" value={formData.email} onChange={handleChange} required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-label text-xs font-bold uppercase tracking-wider text-outline">Password</label>
                  <a className="text-xs font-semibold text-secondary hover:underline" href="#">Forgot password?</a>
                </div>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 text-on-surface custom-input transition-all focus:outline-none"
                  id="password" placeholder="••••••••" type="password" value={formData.password} onChange={handleChange} required
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="block w-full py-4 text-center editorial-gradient text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Signing In...' : mode === 'admin' ? 'Enter Admin Console' : 'Sign In'}
              </button>
            </form>

            {mode === 'student' && (
              <>
                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-container-high" /></div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-surface-container-lowest text-outline font-medium">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = `${BACKEND}/api/auth/google`}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant/40 bg-white hover:bg-surface-container-low transition-colors text-on-surface font-semibold text-sm shadow-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={() => window.location.href = `${BACKEND}/api/auth/github`}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant/40 bg-white hover:bg-surface-container-low transition-colors text-on-surface font-semibold text-sm shadow-sm"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                    GitHub
                  </button>
                </div>
              </>
            )}

              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs text-on-surface-variant text-center font-medium">
                  🔐 Admin access requires pre-authorized credentials.<br/>
                  <Link to="/admin/signup" className="text-primary font-bold hover:underline">Register as Admin →</Link>
                </p>
                <button 
                   onClick={() => {
                     localStorage.setItem('token', 'DEBUG_TOKEN');
                     localStorage.setItem('user', JSON.stringify({ fullName: 'Debug Admin', role: 'admin' }));
                     navigate('/admin');
                   }}
                   className="mt-4 w-full text-[9px] uppercase tracking-widest font-bold text-outline hover:text-primary transition-colors underline"
                >
                   🚀 DEBUG: Bypass Login to View Dashboard
                </button>
              </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-outline">
                New here?
                <Link className="text-secondary font-bold ml-1 hover:underline" to="/signup">Create student account</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-outline font-label">© 2024 Hostel Intelligence Platform.</p>
      </footer>
    </div>
  );
};

const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center glass-panel shrink-0">
      <span className="material-symbols-outlined text-white text-[20px]">{icon}</span>
    </div>
    <p className="text-sm opacity-90 font-medium">{text}</p>
  </div>
);

export default Login;
