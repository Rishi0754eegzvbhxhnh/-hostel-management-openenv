import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', adminCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/auth/admin/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        adminCode: formData.adminCode,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const detail = err.response?.data?.error ? ` (${err.response.data.error})` : '';
      setError(`${msg}${detail}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-container flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-xl font-headline font-extrabold text-primary">Admin Registration</h1>
            <p className="text-xs text-on-surface-variant">Hostel Management Console</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <div className="bg-error/10 text-error p-3 rounded-lg text-sm font-medium">{error}</div>}

          {[
            { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Dr. John Smith' },
            { id: 'email', label: 'Admin Email', type: 'email', placeholder: 'admin@hostel.edu' },
            { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{f.label}</label>
              <input id={f.id} type={f.type} placeholder={f.placeholder} value={formData[f.id]}
                onChange={handleChange} required
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Admin Authorization Code</label>
            <input id="adminCode" type="text" placeholder="Enter secret admin code"
              value={formData.adminCode} onChange={handleChange} required
              className="w-full bg-white rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-sm border border-amber-200" />
            <p className="text-[11px] text-amber-600 mt-2">💡 Default code: <strong>HOSTEL_ADMIN_2024</strong></p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/30">
            {loading ? 'Creating Admin Account...' : 'Register as Admin'}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Already have an account? <Link to="/" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
