import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const getInitialTheme = () => {
  try {
    return document.documentElement.getAttribute('data-theme') || 'light';
  } catch {
    return 'light';
  }
};

const Navbar = () => {
  const { user, logout, isAuthenticated, isCitizen, isOfficial, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  // Close the mobile menu on navigation
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* ignore */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userLabel = !isAuthenticated
    ? null
    : isAdmin
      ? 'Admin'
      : isOfficial
        ? `${user.name}`
        : user.name;
  const userSub = isAdmin ? 'All departments' : isOfficial ? user.department : 'Citizen';
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  const linkClass = ({ isActive }) => `navbar-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-mark" aria-hidden="true">◈</span>
          <span>Smart City<span className="navbar-logo-light"> Grievance</span></span>
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>

        <div className={`navbar-menu${open ? ' open' : ''}`}>
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          {(!isAuthenticated || isCitizen) && (
            <NavLink to="/citizen/new-complaint" className={linkClass}>Submit Complaint</NavLink>
          )}
          {isAuthenticated && isCitizen && (
            <NavLink to="/citizen/dashboard" className={linkClass}>My Complaints</NavLink>
          )}
          {(isOfficial || isAdmin) && (
            <NavLink to="/official/dashboard" className={linkClass}>Dashboard</NavLink>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin/overview" className={linkClass}>Overview</NavLink>
              <NavLink to="/admin/escalations" className={({ isActive }) => `navbar-link navbar-link-alerts${isActive ? ' active' : ''}`}>
                Escalations
              </NavLink>
            </>
          )}

          <span className="navbar-spacer" />

          <button type="button" className="navbar-icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle dark mode">
            {theme === 'dark' ? '☀' : '☾'}
          </button>

          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <Link to="/register" className="btn btn-primary navbar-cta">Register</Link>
            </>
          ) : (
            <div className="navbar-user-section">
              <span className="navbar-avatar" aria-hidden="true">{initial}</span>
              <span className="navbar-user-text">
                <span className="navbar-user-name">{userLabel}</span>
                <span className="navbar-user-sub">{userSub}</span>
              </span>
              <button type="button" onClick={handleLogout} className="btn btn-secondary navbar-logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
