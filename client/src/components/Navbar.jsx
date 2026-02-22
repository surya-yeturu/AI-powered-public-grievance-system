import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isCitizen, isOfficial, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userLabel = !isAuthenticated
    ? null
    : isAdmin
      ? 'Admin · All Departments'
      : isOfficial
        ? `${user.name} · ${user.department}`
        : user.name;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Smart City Grievance Platform
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/citizen/new-complaint" className="navbar-link">Submit Complaint</Link>

          {isAuthenticated && isCitizen && (
            <Link to="/citizen/dashboard" className="navbar-link">My Complaints</Link>
          )}

          {(isOfficial || isAdmin) && (
            <>
              <Link to="/official/dashboard" className="navbar-link">Dashboard</Link>
              {isAdmin && (
                <Link to="/admin/escalations" className="navbar-link navbar-link-alerts">Escalation Alerts</Link>
              )}
            </>
          )}

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link navbar-link-primary">Register</Link>
            </>
          ) : (
            <div className="navbar-user-section">
              <span className="navbar-user-pill">{userLabel}</span>
              <button type="button" onClick={handleLogout} className="navbar-button">
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
