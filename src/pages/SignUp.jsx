import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    college_id: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    terms: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.terms) {
      setError('You must agree to the Terms and Conditions');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        fullName: formData.full_name,
        collegeId: formData.college_id,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      setLoading(false);
      alert(response.data.message || 'Account created successfully!');
      navigate('/');

    } catch (err) {
      setLoading(false);
      if (err.code === 'ERR_NETWORK') {
        setError('Backend server is not responding. Please check if your Node/Express server is running on port 5000.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'An error occurred during signup. Check your database connection.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-xl editorial-shadow bg-surface-container-lowest">
        <section className="hidden md:flex md:col-span-5 bg-primary-container relative p-12 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-90"></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-on-primary">
              Students Intelligence
            </h1>
            <p className="mt-4 font-body text-on-primary-container text-lg max-w-xs leading-relaxed">
              Join the curated network of academic excellence and modern living.
            </p>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-[2px] bg-secondary-fixed"></div>
              <span className="font-label text-[11px] font-medium tracking-widest uppercase text-secondary-fixed">Student Portal</span>
            </div>
            <blockquote className="font-headline italic text-xl text-on-primary font-medium">
              "Elevating the hostel experience through intelligent curation and effortless management."
            </blockquote>
          </div>
          <div className="absolute bottom-0 right-0 w-full h-1/2 opacity-20 pointer-events-none">
            <img
              className="w-full h-full object-cover"
              alt="Modern architecture"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfm24i3JmReH-bKjC5Z2kBKI0W1pp3vYAshmY6p2yXnitmF8CbwtVWwSD6-lGr7-FT_iQ9RXd0WmVYEhziOYdViz2FT9z1wkk_E1ZZaILIXHdXV5ghiVAYdc85Xr8mMo3PtxK3ezpwPnyMfJUHKVgpAMLC1byPrKwHHvLOXEV8FZesFYinix8GKcs88f9h9iOzlwsSmk7AaQgzM5gyeMfTL1jfleAYDspeECCNX_KIUPdc1aZS56XEckjjfMywaWEk4p5J8cLXPEM"
            />
          </div>
        </section>

        <section className="col-span-1 md:col-span-7 p-8 md:p-16 bg-surface-container-lowest">
          <header className="mb-10">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Create Account</h2>
            <p className="font-body text-on-surface-variant mt-2">Enter your credentials to join the community.</p>
          </header>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 text-error p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="full_name">Full Name</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container transition-all"
                  id="full_name"
                  placeholder="John Doe"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="college_id">College ID</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container transition-all"
                  id="college_id"
                  placeholder="STD-2024-001"
                  type="text"
                  value={formData.college_id}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="email">Email</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container transition-all"
                  id="email"
                  placeholder="john@university.edu"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="phone">Phone Number</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container transition-all"
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="password">Password</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container transition-all"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="confirm_password">Confirm Password</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container transition-all"
                  id="confirm_password"
                  placeholder="••••••••"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary-container bg-surface-container-low"
                id="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
              />
              <label className="font-body text-sm text-on-surface-variant" htmlFor="terms">
                I agree to the <a className="text-primary font-medium hover:underline underline-offset-4 decoration-secondary-fixed decoration-2" href="#">Terms and conditions</a>
              </label>
            </div>
            <div className="pt-6 space-y-6">
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/10 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-grow bg-surface-container-high"></div>
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">or join with</span>
                <div className="h-[1px] flex-grow bg-surface-container-high"></div>
              </div>
              <p className="text-center font-body text-sm text-on-surface-variant">
                Already have an account?
                <Link className="ml-1 text-primary font-bold hover:underline underline-offset-4 decoration-secondary-fixed decoration-2" to="/">Sign In</Link>
              </p>
            </div>
          </form>
        </section>
      </main>

      <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary-fixed opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary-fixed opacity-10 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default SignUp;
