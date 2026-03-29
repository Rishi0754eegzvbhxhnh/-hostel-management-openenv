import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ activePage = "Home" }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#fbf8ff] dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(26,27,35,0.06)]">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container overflow-hidden font-bold">
            {user ? user.fullName.charAt(0) : <span className="material-symbols-outlined">person</span>}
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold tracking-tighter text-primary font-headline leading-none">Editorial Intelligence</h1>
            {user && <span className="text-[10px] font-label text-outline uppercase tracking-widest mt-1">{user.fullName}</span>}
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/dashboard" label="Home" active={activePage === "Home"} />
          <NavLink to="/room-booking" label="Rooms" active={activePage === "Rooms"} />
          <NavLink to="/payment" label="Payments" active={activePage === "Payments"} />
          <NavLink to="/food-menu" label="Food" active={activePage === "Food"} />
          <NavLink to="/smart-living" label="Smart" active={activePage === "Smart"} />
          <NavLink to="/events" label="Hub" active={activePage === "Events"} />
          <NavLink to="/gamification" label="Win" active={activePage === "Win"} />
          {user?.role === 'admin' && <NavLink to="/admin/predictive" label="Forecast" active={activePage === "Forecast"} />}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-error border border-error/20 rounded-full hover:bg-error/5 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/" className="text-primary font-bold font-label text-[11px] uppercase tracking-wider">Sign In</Link>
          )}
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant active:scale-95 duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ to, label, active }) => (
  <Link 
    className={`${active ? 'text-[#1A237E] font-bold border-b-2 border-[#1A237E]' : 'text-slate-500 dark:text-slate-400 font-medium hover:text-[#1A237E] transition-colors'} font-label text-[11px] tracking-wide uppercase`}
    to={to}
  >
    {label}
  </Link>
);

export default Header;
